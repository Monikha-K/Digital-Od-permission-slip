const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/sequelize');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['Admin', 'Student', 'Mentor', 'ClassAdvisor', 'InnovationHead', 'HOD', 'CFI']]
    }
  },
  department: {
    type: DataTypes.STRING(10),
    allowNull: true,
    validate: {
      isIn: [['CSE', 'AIDS', 'ECE', 'EEE', 'MECH', 'CYBER', 'CSBS', 'AIML', 'IT', null]]
    }
  },
  rollNumber:      { type: DataTypes.STRING },
  staffId:         { type: DataTypes.STRING },
  year:            { type: DataTypes.INTEGER },
  profilePhoto:    { type: DataTypes.STRING },
  isClassAdvisor:  { type: DataTypes.BOOLEAN, defaultValue: false },
  advisorYear:     { type: DataTypes.INTEGER },
  approvedODCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  warningCount:    { type: DataTypes.INTEGER, defaultValue: 0 },
  isBlocked:       { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

User.prototype.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User;
