import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create database and tables if they don't exist
async function initializeDatabase() {
  try {
    // Create connection without database selection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(20) UNIQUE,
        password VARCHAR(255) NOT NULL,
        location VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create farm_data table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS farm_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_land DECIMAL(10,2) NOT NULL,
        crop_types JSON,
        expected_revenue DECIMAL(10,2),
        active_crops JSON,
        soil_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Database and tables initialized successfully');
    await connection.end();
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden: Invalid token' });
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, password, location } = req.body;
    
    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user into database
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password, location) VALUES (?, ?, ?, ?, ?)',
      [name, email || null, phone || null, hashedPassword, location || null]
    );
    
    // Create default farm data for the user
    await pool.query(
      'INSERT INTO farm_data (user_id, total_land, crop_types, expected_revenue, active_crops, soil_type) VALUES (?, ?, ?, ?, ?, ?)',
      [result.insertId, 0.0, JSON.stringify([]), 0.0, JSON.stringify([]), 'Not specified']
    );
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate email/phone
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email or phone already registered' });
    }
    
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    
    if ((!email && !phone) || !password) {
      return res.status(400).json({ message: 'Email/phone and password required' });
    }
    
    // Query based on email or phone
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR phone = ?',
      [email || null, phone || null]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = rows[0];
    
    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/api/user/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user details
    const [userRows] = await pool.query(
      'SELECT id, name, email, phone, location FROM users WHERE id = ?',
      [userId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get farm data
    const [farmRows] = await pool.query(
      'SELECT * FROM farm_data WHERE user_id = ?',
      [userId]
    );
    
    const farmData = farmRows.length > 0 ? farmRows[0] : null;
    
    // Parse JSON fields if they exist
    if (farmData) {
      farmData.crop_types = JSON.parse(farmData.crop_types || '[]');
      farmData.active_crops = JSON.parse(farmData.active_crops || '[]');
    }
    
    res.json({
      user: userRows[0],
      farmData: farmData
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

app.put('/api/user/farm-data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { totalLand, cropTypes, expectedRevenue, activeCrops, soilType } = req.body;
    
    // Update farm data
    await pool.query(
      `UPDATE farm_data SET 
       total_land = ?, 
       crop_types = ?, 
       expected_revenue = ?, 
       active_crops = ?, 
       soil_type = ? 
       WHERE user_id = ?`,
      [
        totalLand || 0.0,
        JSON.stringify(cropTypes || []),
        expectedRevenue || 0.0,
        JSON.stringify(activeCrops || []),
        soilType || 'Not specified',
        userId
      ]
    );
    
    res.json({ message: 'Farm data updated successfully' });
  } catch (error) {
    console.error('Farm data update error:', error);
    res.status(500).json({ message: 'Failed to update farm data' });
  }
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    const PORT = process.env.PORT || 5000;
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`Health check at http://localhost:${PORT}/api/health`);
      console.log(`Database: ${process.env.DB_NAME} on ${process.env.DB_HOST}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    console.log('Starting server without database for API health checks...');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in limited mode (API health only)`);
    });
  }
};

startServer();