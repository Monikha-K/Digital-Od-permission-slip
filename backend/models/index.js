const sequelize = require('../config/sequelize');
const User       = require('./User');
const Department = require('./Department');
const ODRequest  = require('./ODRequest');
const Document   = require('./Document');
const Approval   = require('./Approval');
const Warning    = require('./Warning');

// ── User ↔ Department ──────────────────────────────────────────────────────
Department.belongsTo(User, { as: 'hod',            foreignKey: 'hodId' });
Department.belongsTo(User, { as: 'innovationHead',  foreignKey: 'innovationHeadId' });
Department.belongsTo(User, { as: 'cfi',             foreignKey: 'cfiId' });

// ── ODRequest ↔ User ───────────────────────────────────────────────────────
ODRequest.belongsTo(User, { as: 'student',       foreignKey: 'studentId' });
ODRequest.belongsTo(User, { as: 'mentor',        foreignKey: 'mentorId' });
ODRequest.belongsTo(User, { as: 'classAdvisor',  foreignKey: 'advisorId' });
ODRequest.belongsTo(User, { as: 'innovHead',     foreignKey: 'innovationHeadId' });
ODRequest.belongsTo(User, { as: 'hodUser',       foreignKey: 'hodId' });
ODRequest.belongsTo(User, { as: 'cfiUser',       foreignKey: 'cfiId' });

User.hasMany(ODRequest, { foreignKey: 'studentId', as: 'odRequests' });

// ── ODRequest ↔ Document ───────────────────────────────────────────────────
ODRequest.hasOne(Document,   { foreignKey: 'odRequestId', as: 'documents' });
Document.belongsTo(ODRequest, { foreignKey: 'odRequestId' });

// ── ODRequest ↔ Approval ───────────────────────────────────────────────────
ODRequest.hasMany(Approval,   { foreignKey: 'odRequestId', as: 'approvals' });
Approval.belongsTo(ODRequest, { foreignKey: 'odRequestId' });

// ── Warning ────────────────────────────────────────────────────────────────
Warning.belongsTo(User,      { as: 'student', foreignKey: 'studentId' });
Warning.belongsTo(User,      { as: 'advisor', foreignKey: 'advisorId' });
Warning.belongsTo(ODRequest, { foreignKey: 'odRequestId' });
User.hasMany(Warning, { foreignKey: 'studentId', as: 'warnings' });

const syncModels = async () => {
  await sequelize.sync({ alter: true });
  console.log('All tables synced');
};

module.exports = { User, Department, ODRequest, Document, Approval, Warning, syncModels };
