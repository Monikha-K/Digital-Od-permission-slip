const { Op } = require('sequelize');
const { ODRequest, User, Document, Approval, Warning } = require('../models');

const studentInclude = { model: User, as: 'student', attributes: ['id', 'name', 'rollNumber', 'year', 'warningCount', 'isBlocked'] };
const docInclude     = { model: Document, as: 'documents' };
const appInclude     = { model: Approval, as: 'approvals' };

// GET /advisor/proof-submissions — all approved ODs where this user is the classAdvisor
exports.getProofSubmissions = async (req, res) => {
  try {
    const requests = await ODRequest.findAll({
      where: { advisorId: req.user.id, finalStatus: 'Approved' },
      include: [studentInclude, docInclude, appInclude],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /advisor/warn/:odRequestId
exports.warnStudent = async (req, res) => {
  try {
    const { odRequestId } = req.params;
    const { message } = req.body;

    const odRequest = await ODRequest.findByPk(odRequestId, { include: [studentInclude] });
    if (!odRequest) return res.status(404).json({ message: 'OD request not found' });
    if (Number(odRequest.advisorId) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const student = await User.findByPk(odRequest.studentId);
    if (student.warningCount >= 3) {
      return res.status(400).json({ message: 'Student already has 3 warnings. Use Report instead.' });
    }

    await Warning.create({
      studentId:   odRequest.studentId,
      advisorId:   req.user.id,
      odRequestId: odRequest.id,
      type:        'warn',
      message:     message || 'Please submit your proof documents.'
    });

    await student.increment('warningCount');
    const updated = await User.findByPk(student.id, { attributes: ['id', 'warningCount'] });
    res.json({ message: 'Warning sent', warningCount: updated.warningCount });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /advisor/report/:odRequestId
exports.reportStudent = async (req, res) => {
  try {
    const { odRequestId } = req.params;
    const { message } = req.body;

    const odRequest = await ODRequest.findByPk(odRequestId, { include: [studentInclude] });
    if (!odRequest) return res.status(404).json({ message: 'OD request not found' });
    if (Number(odRequest.advisorId) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const student = await User.findByPk(odRequest.studentId);
    if (student.warningCount < 3) {
      return res.status(400).json({ message: 'Student must have 3 warnings before reporting' });
    }

    await Warning.create({
      studentId:   odRequest.studentId,
      advisorId:   req.user.id,
      odRequestId: odRequest.id,
      type:        'report',
      message:     message || 'Reported to admin for non-compliance.'
    });

    res.json({ message: 'Report submitted to admin' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET /advisor/warnings/student — student fetches their own warnings
exports.getMyWarnings = async (req, res) => {
  try {
    const warnings = await Warning.findAll({
      where: { studentId: req.user.id },
      include: [{ model: User, as: 'advisor', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });
    // Mark all as read
    await Warning.update({ isRead: true }, { where: { studentId: req.user.id, isRead: false } });
    res.json(warnings);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
