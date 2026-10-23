const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'live', 'completed'),
    defaultValue: 'draft',
    allowNull: false
  },
  scheduledFor: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
});

// A Teacher (User) creates many Exams
Exam.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });

module.exports = Exam;
