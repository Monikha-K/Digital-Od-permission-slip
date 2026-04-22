const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Warning = sequelize.define('Warning', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId:   { type: DataTypes.INTEGER, allowNull: false },
  advisorId:   { type: DataTypes.INTEGER, allowNull: false },
  odRequestId: { type: DataTypes.INTEGER, allowNull: false },
  type:        { type: DataTypes.ENUM('warn', 'report'), allowNull: false },
  message:     { type: DataTypes.TEXT, allowNull: false },
  isRead:      { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true });

module.exports = Warning;
