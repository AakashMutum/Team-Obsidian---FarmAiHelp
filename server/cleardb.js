import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function clearDatabase() {
  console.log('⚠️  WARNING: This will delete all user data!');
  console.log('Are you sure you want to clear the database? (This script will proceed automatically)');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'nikhith@2675',
      database: process.env.DB_NAME || 'dhan_sathi'
    });

    console.log('✅ Connected to database');

    // Clear farm_data first (due to foreign key constraint)
    console.log('🗑️  Clearing farm_data table...');
    await connection.query('DELETE FROM farm_data');
    
    // Clear users table
    console.log('🗑️  Clearing users table...');
    await connection.query('DELETE FROM users');
    
    // Reset auto-increment counters
    await connection.query('ALTER TABLE users AUTO_INCREMENT = 1');
    await connection.query('ALTER TABLE farm_data AUTO_INCREMENT = 1');
    
    console.log('✅ Database cleared successfully');
    console.log('ℹ️  You can now register new users without conflicts');

    await connection.end();

  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
  }
}

clearDatabase();