const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DailyQuote = sequelize.define('DailyQuote', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    defaultValue: 'Dev Whisperer'
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'funny' // 'funny', 'wisdom', 'quote', 'joke'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = DailyQuote;
