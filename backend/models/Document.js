const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Document = sequelize.define('Document', {
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  odRequestId:          { type: DataTypes.INTEGER, allowNull: false },
  registrationFormPath: { type: DataTypes.STRING },
  paymentProofPath:     { type: DataTypes.STRING },
  posterPath:           { type: DataTypes.STRING },
  geoTagPhotoPath:      { type: DataTypes.STRING },
  certificatePath:      { type: DataTypes.STRING },
  proofUploadedAt:      { type: DataTypes.DATE }
}, { timestamps: true });

module.exports = Document;
