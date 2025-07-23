// Migration to add language (targetLanguage) field to Flashcards table
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('🔄 Starting migration: Adding language column...');
      
      // Add language column for target language
      await queryInterface.addColumn('Flashcards', 'language', {
        type: DataTypes.STRING(5),
        allowNull: true,
        defaultValue: 'fr'
      });
      
      console.log('✅ language column added successfully!');
      
      // Update existing flashcards to have a default language
      await queryInterface.sequelize.query(`
        UPDATE "Flashcards"
        SET "language" = 'fr'
        WHERE "language" IS NULL;
      `);
      
      console.log('✅ Updated existing flashcards with default language');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Flashcards', 'language');
  }
};