const { Op, fn, col, literal } = require('sequelize');
const { User, Department, ODRequest, Warning } = require('../models');

exports.getAllUsers = async (req, res) => {
  try {
    const { role, department } = req.query;
    const where = {};
    if (role)       where.role = role;
    if (department) where.department = department;

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    await User.update({ isBlocked: true }, { where: { id: req.params.id } });
    res.json({ message: 'Student blocked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    await User.update({ isBlocked: false, warningCount: 0 }, { where: { id: req.params.id } });
    res.json({ message: 'Student unblocked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Warning.findAll({
      where: { type: 'report' },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'rollNumber', 'department', 'isBlocked', 'warningCount'] },
        { model: User, as: 'advisor', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents, totalFaculty,
      totalRequests, approvedRequests,
      pendingRequests, rejectedRequests
    ] = await Promise.all([
      User.count({ where: { role: 'Student' } }),
      User.count({ where: { role: { [Op.in]: ['Mentor', 'ClassAdvisor'] } } }),
      ODRequest.count(),
      ODRequest.count({ where: { finalStatus: 'Approved' } }),
      ODRequest.count({ where: { finalStatus: 'Pending' } }),
      ODRequest.count({ where: { finalStatus: 'Rejected' } })
    ]);

    const requestsByDepartment = await ODRequest.findAll({
      attributes: ['department', [fn('COUNT', col('id')), 'count']],
      group: ['department'],
      raw: true
    });

    res.json({
      totalStudents, totalFaculty,
      totalRequests, approvedRequests,
      pendingRequests, rejectedRequests,
      requestsByDepartment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMentorsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const mentors = await User.findAll({
      where: {
        department,
        role: { [Op.in]: ['Mentor', 'ClassAdvisor'] }
      },
      attributes: ['id', 'name', 'staffId', 'role']
    });
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClassAdvisorsByDepartmentYear = async (req, res) => {
  try {
    const { department, year } = req.params;
    const advisors = await User.findAll({
      where: {
        department,
        isClassAdvisor: true,
        advisorYear: parseInt(year)
      },
      attributes: ['id', 'name', 'staffId']
    });
    res.json(advisors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
