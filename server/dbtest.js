import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabaseConnection() {
  console.log('Testing database connection...');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`User: ${process.env.DB_USER}`);
  console.log(`Database: ${process.env.DB_NAME}`);

  try {
    // Try to connect to MySQL server without database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
    
    console.log('✅ Successfully connected to MySQL server');
    
    // Check if database exists
    const [rows] = await connection.query(`SHOW DATABASES LIKE '${process.env.DB_NAME}'`);
    if (Array.isArray(rows) && rows.length > 0) {
      console.log(`✅ Database '${process.env.DB_NAME}' exists`);
      
      // Connect with database
      await connection.query(`USE ${process.env.DB_NAME}`);
      
      // Check users table
      const [userTables] = await connection.query(`SHOW TABLES LIKE 'users'`);
      if (Array.isArray(userTables) && userTables.length > 0) {
        console.log('✅ Users table exists');
        
        // Check user count
        const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
        console.log(`ℹ️ Users in database: ${userCount[0].count}`);
      } else {
        console.log('❌ Users table does not exist');
      }
    } else {
      console.log(`❌ Database '${process.env.DB_NAME}' does not exist`);
    }
    
    await connection.end();
    console.log('Database connection test completed');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 The username or password is incorrect');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('👉 MySQL server is not running or not reachable');
    }
  }
}

checkDatabaseConnection();