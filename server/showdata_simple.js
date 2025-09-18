import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function showDatabaseData() {
  console.log('=== Dhan Sathi Database Contents ===\n');

  try {
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
    const [users] = await connection.query('SELECT * FROM users ORDER BY id');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email || 'Not provided'}`);
        console.log(`  Phone: ${user.phone || 'Not provided'}`);
        console.log(`  Location: ${user.location || 'Not provided'}`);
        console.log(`  Created: ${user.created_at}`);
      });
    }

    console.log('\n📊 FARM DATA TABLE:');
    console.log('===================');
    const [farmData] = await connection.query('SELECT * FROM farm_data ORDER BY id');

    if (farmData.length === 0) {
      console.log('No farm data found in the database.');
    } else {
      farmData.forEach((farm, index) => {
        console.log(`\nFarm Record ${index + 1}:`);
        console.log(`  ID: ${farm.id}`);
        console.log(`  User ID: ${farm.user_id}`);
        console.log(`  Total Land: ${farm.total_land} acres`);
        console.log(`  Crop Types: ${farm.crop_types}`);
        console.log(`  Expected Revenue: ₹${farm.expected_revenue}`);
        console.log(`  Active Crops: ${farm.active_crops}`);
        console.log(`  Soil Type: ${farm.soil_type}`);
        console.log(`  Created: ${farm.created_at}`);
        console.log(`  Updated: ${farm.updated_at}`);
      });
    }

    // Show summary
    console.log('\n📈 SUMMARY:');
    console.log('===========');
    console.log(`Total Users: ${users.length}`);
    console.log(`Total Farm Records: ${farmData.length}`);

    await connection.end();
    console.log('\n✅ Database query completed');

  } catch (error) {
    console.error('❌ Error querying database:', error.message);
  }
}

showDatabaseData();