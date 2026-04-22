const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ODRequest = sequelize.define('ODRequest', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId:   { type: DataTypes.INTEGER, allowNull: false },
  mentorId:    { type: DataTypes.INTEGER, allowNull: false },
  advisorId:   { type: DataTypes.INTEGER, allowNull: false },
  innovationHeadId: { type: DataTypes.INTEGER },
  hodId:       { type: DataTypes.INTEGER },
  cfiId:       { type: DataTypes.INTEGER },
  department:  { type: DataTypes.STRING, allowNull: false },
  year:        { type: DataTypes.INTEGER, allowNull: false },
  eventName:   { type: DataTypes.STRING, allowNull: false },
  collegeName: { type: DataTypes.STRING, allowNull: false },
  fromDate:    { type: DataTypes.DATEONLY, allowNull: false },
  toDate:      { type: DataTypes.DATEONLY, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  finalStatus: {
    type: DataTypes.STRING(10),
    defaultValue: 'Pending',
    validate: { isIn: [['Pending', 'Approved', 'Rejected']] }
  }
}, { timestamps: true });

module.exports = ODRequest;
