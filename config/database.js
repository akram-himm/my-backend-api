const { Sequelize } = require('sequelize');
require('dotenv').config();

// Utiliser SQLite pour le développement local
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

module.exports = sequelize;
