const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Approval = sequelize.define('Approval', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  odRequestId: { type: DataTypes.INTEGER, allowNull: false },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: { isIn: [['mentor', 'classAdvisor', 'innovationHead', 'hod', 'cfi']] }
  },
  status: {
    type: DataTypes.STRING(10),
    defaultValue: 'Pending',
    validate: { isIn: [['Pending', 'Approved', 'Rejected']] }
  },
  remark:     { type: DataTypes.TEXT },
  actionDate: { type: DataTypes.DATE }
}, { timestamps: true });

module.exports = Approval;
