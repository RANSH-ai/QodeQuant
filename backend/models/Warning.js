const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Exam = require('./Exam');

const Warning = sequelize.define('Warning', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  warningType: {
    type: DataTypes.STRING, // e.g., 'TAB_SWITCH', 'MINIMIZE', 'FACE_NOT_FOUND', 'MULTIPLE_FACES'
    allowNull: false,
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'low',
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  snapshotUrl: {
    type: DataTypes.STRING, // Optional: in case we ever want to save an image link later
    allowNull: true,
  }
}, {
  timestamps: false, // We only need the custom 'timestamp' field
});

// A Warning belongs to a Student (User) and an Exam
Warning.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
Warning.belongsTo(Exam, { foreignKey: 'examId' });

module.exports = Warning;
