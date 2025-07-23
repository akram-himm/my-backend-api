// Migration to add sourceLanguage field to Flashcards table
// Run this with: node migrations/add-source-language.js

require('dotenv').config();
const sequelize = require('../config/database');

async function addSourceLanguageColumn() {
  try {
    console.log('🔄 Starting migration: Adding sourceLanguage column...');
    
    // Add sourceLanguage column using raw query
    await sequelize.query(`
      ALTER TABLE "Flashcards"
      ADD COLUMN IF NOT EXISTS "sourceLanguage" VARCHAR(5) DEFAULT NULL;
    `);
    
    console.log('✅ sourceLanguage column added successfully!');
    
    // Optional: Update existing flashcards to guess sourceLanguage
    console.log('🔄 Updating existing flashcards...');
    
    const [results] = await sequelize.query(`
      UPDATE "Flashcards"
      SET "sourceLanguage" = CASE
        WHEN "front" ~ '[а-яА-Я]' THEN 'ru'
        WHEN "front" ~ '[ñáéíóúÑÁÉÍÓÚ]' THEN 'es'
        WHEN "front" ~ '[àâçèéêëîïôùûüÿÀÂÇÈÉÊËÎÏÔÙÛÜŸ]' THEN 'fr'
        WHEN "front" ~ '[äöüßÄÖÜ]' THEN 'de'
        WHEN "front" ~ '[\u4e00-\u9fff]' THEN 'zh'
        WHEN "front" ~ '[\u3040-\u309f\u30a0-\u30ff]' THEN 'ja'
        WHEN "front" ~ '[\uac00-\ud7af]' THEN 'ko'
        WHEN "front" ~ '[\u0600-\u06ff]' THEN 'ar'
        ELSE 'en'
      END
      WHERE "sourceLanguage" IS NULL;
    `);
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
addSourceLanguageColumn();