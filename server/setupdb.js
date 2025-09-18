import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

async function setupDatabase() {
  console.log('Setting up database...');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`User: ${process.env.DB_USER}`);
  console.log(`Database: ${process.env.DB_NAME || 'dhan_sathi'}`);

  try {
    // Connect to MySQL server without database
    console.log('Connecting to MySQL server...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'nikhith@2675'
    });
    
    console.log('✅ Successfully connected to MySQL server');
    
    // Create the database if it doesn't exist
    const dbName = process.env.DB_NAME || 'dhan_sathi';
    console.log(`Creating database '${dbName}' if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' is ready`);
    
    // Use the database
    console.log(`Switching to database '${dbName}'...`);
    await connection.query(`USE ${dbName}`);
    
    // Create users table
    console.log('Creating users table...');
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
    console.log('✅ Users table created');
    
    // Create farm_data table
    console.log('Creating farm_data table...');
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
    console.log('✅ Farm_data table created');
    
    // Check if we should create a demo user
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (userCount[0].count === 0) {
      console.log('Creating demo user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // Insert demo user
      const [result] = await connection.query(
        'INSERT INTO users (name, email, phone, password, location) VALUES (?, ?, ?, ?, ?)',
        ['Demo Farmer', 'demo@example.com', '9876543210', hashedPassword, 'Pune, Maharashtra']
      );
      
      // Create default farm data for the user
      await connection.query(
        'INSERT INTO farm_data (user_id, total_land, crop_types, expected_revenue, active_crops, soil_type) VALUES (?, ?, ?, ?, ?, ?)',
        [result.insertId, 2.5, JSON.stringify(['Wheat', 'Rice']), 125000, JSON.stringify(['Wheat', 'Rice', 'Sugarcane']), 'Fertile loam']
      );
      
      console.log('✅ Demo user created');
      console.log('   Email: demo@example.com');
      console.log('   Password: password123');
    }
    
    await connection.end();
    console.log('✅ Database setup completed successfully');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 The username or password is incorrect');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('👉 MySQL server is not running or not reachable');
    } else {
      console.error('Full error:', error);
    }
  }
}

setupDatabase();