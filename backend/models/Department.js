const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Department = sequelize.define('Department', {
  id:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    validate: {
      isIn: [['CSE', 'AIDS', 'ECE', 'EEE', 'MECH', 'CYBER', 'CSBS', 'AIML', 'IT']]
    }
  },
  hodId:            { type: DataTypes.INTEGER },
  innovationHeadId: { type: DataTypes.INTEGER },
  cfiId:            { type: DataTypes.INTEGER }
}, { timestamps: true });

module.exports = Department;
