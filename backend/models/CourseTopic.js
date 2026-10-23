const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CourseTopic = sequelize.define('CourseTopic', {
  courseId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.STRING
  },
  summary: {
    type: DataTypes.TEXT
  },
  videoUrl: {
    type: DataTypes.STRING
  },
  locked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = CourseTopic;
