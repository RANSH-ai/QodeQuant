const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ArenaQuestion = sequelize.define('ArenaQuestion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  track: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false,
  },
  level: {
    type: DataTypes.INTEGER, // 1-10 (Roman I to X)
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'easy',
  },
  orderIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  expectedOutput: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
  },
  professorName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  institution: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = ArenaQuestion;
