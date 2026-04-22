const sequelize = require('./sequelize');

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected');
    const { syncModels } = require('../models');
    await syncModels();
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
