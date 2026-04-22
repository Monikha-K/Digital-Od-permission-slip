const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.PG_DATABASE || 'od_permission_system',
  process.env.PG_USER     || 'postgres',
  process.env.PG_PASSWORD || 'postgres',
  {
    host:    process.env.PG_HOST || 'localhost',
    dialect: 'postgres',
    logging: false
  }
);

module.exports = sequelize;
