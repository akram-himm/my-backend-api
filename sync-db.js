// Sync database schema
// Run this with: node sync-db.js

require('dotenv').config();
const sequelize = require('./config/database');
const { User, Flashcard } = require('./models');

async function syncDatabase() {
  try {
    console.log('🔄 Synchronizing database schema...');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database synchronized successfully!');
    
    // Show current schema
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'Flashcards'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Current Flashcards table schema:');
    results.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

// Run the sync
syncDatabase();