import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function showDatabaseData() {
  console.log('=== Dhan Sathi Database Contents ===\n');

  try {
    // Connect to the database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'nikhith@2675',
      database: process.env.DB_NAME || 'dhan_sathi'
    });

    console.log('✅ Connected to database\n');

    // Show users table data
    console.log('📋 USERS TABLE:');
    console.log('===============');
    const [users] = await connection.query('SELECT id, name, email, phone, location, created_at FROM users ORDER BY id');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.table(users);
    }

    console.log('\n📊 FARM DATA TABLE:');
    console.log('===================');
    const [farmData] = await connection.query(`
      SELECT 
        fd.id,
        fd.user_id,
        u.name as user_name,
        fd.total_land,
        fd.crop_types,
        fd.expected_revenue,
        fd.active_crops,
        fd.soil_type,
        fd.created_at,
        fd.updated_at
      FROM farm_data fd
      JOIN users u ON fd.user_id = u.id
      ORDER BY fd.id
    `);

    if (farmData.length === 0) {
      console.log('No farm data found in the database.');
    } else {
      // Parse JSON fields for better display
      const formattedFarmData = farmData.map(row => ({
        ...row,
        crop_types: JSON.parse(row.crop_types || '[]').join(', ') || 'None',
        active_crops: JSON.parse(row.active_crops || '[]').join(', ') || 'None'
      }));
      console.table(formattedFarmData);
    }

    // Show summary statistics
    console.log('\n📈 SUMMARY STATISTICS:');
    console.log('======================');
    const [userCount] = await connection.query('SELECT COUNT(*) as total_users FROM users');
    const [farmCount] = await connection.query('SELECT COUNT(*) as total_farms FROM farm_data');
    
    console.log(`Total Users: ${userCount[0].total_users}`);
    console.log(`Total Farm Records: ${farmCount[0].total_farms}`);

    // Show recent activity
    console.log('\n🕐 RECENT REGISTRATIONS:');
    console.log('========================');
    const [recentUsers] = await connection.query(`
      SELECT name, email, phone, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (recentUsers.length > 0) {
      console.table(recentUsers);
    } else {
      console.log('No recent registrations.');
    }

    await connection.end();
    console.log('\n✅ Database query completed');

  } catch (error) {
    console.error('❌ Error querying database:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 Check your database credentials in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('👉 Make sure MySQL server is running');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('👉 Database does not exist. Run: node setupdb.js');
    }
  }
}

showDatabaseData();