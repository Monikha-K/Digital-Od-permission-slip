const { Op } = require('sequelize');
const { ODRequest, User, Department, Document, Approval } = require('../models');

const APPROVAL_FLOW = ['mentor', 'classAdvisor', 'innovationHead', 'hod', 'cfi'];

const roleToApprovalKey = {
  Mentor:          'mentor',
  ClassAdvisor:    'classAdvisor',
  InnovationHead:  'innovationHead',
  HOD:             'hod',
  CFI:             'cfi'
};

const studentInclude = {
  model: User, as: 'student',
  attributes: ['id', 'name', 'rollNumber', 'year', 'profilePhoto']
};
const mentorInclude  = { model: User, as: 'mentor',       attributes: ['id', 'name'] };
const advisorInclude = { model: User, as: 'classAdvisor', attributes: ['id', 'name'] };
const docInclude     = { model: Document, as: 'documents' };
const appInclude     = { model: Approval,  as: 'approvals' };

// ── Create OD Request ──────────────────────────────────────────────────────
exports.createODRequest = async (req, res) => {
  try {
    const student = await User.findByPk(req.user.id);
    if (student.isBlocked) {
      return res.status(403).json({ message: 'You are blocked from applying for OD. Please contact your class advisor or admin.' });
    }
    if (student.approvedODCount >= 10) {
      return res.status(400).json({ message: 'Maximum OD limit reached' });
    }

    const { eventName, collegeName, department, year, fromDate, toDate, mentor, classAdvisor, description, days } = req.body;

    const dept = await Department.findOne({ where: { name: department } });
    if (!dept) return res.status(404).json({ message: `Department not found: ${department}` });

    const resolvedToDate = toDate || fromDate;

    const odRequest = await ODRequest.create({
      studentId:        req.user.id,
      mentorId:         mentor,
      advisorId:        classAdvisor,
      innovationHeadId: dept.innovationHeadId,
      hodId:            dept.hodId,
      cfiId:            dept.cfiId,
      department, year: parseInt(year),
      eventName, collegeName, fromDate, toDate: resolvedToDate, description
    });

    await Document.create({
      odRequestId:          odRequest.id,
      registrationFormPath: req.files?.registrationForm?.[0]?.path || null,
      paymentProofPath:     req.files?.paymentProof?.[0]?.path     || null,
      posterPath:           req.files?.eventPoster?.[0]?.path      || null
    });

    for (const role of APPROVAL_FLOW) {
      await Approval.create({ odRequestId: odRequest.id, role, status: 'Pending' });
    }

    res.status(201).json(odRequest);
  } catch (error) {
    console.error('createODRequest error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ── Student: my requests ───────────────────────────────────────────────────
exports.getMyODRequests = async (req, res) => {
  try {
    const requests = await ODRequest.findAll({
      where: { studentId: req.user.id },
      include: [mentorInclude, advisorInclude, docInclude, appInclude],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Faculty: pending requests ──────────────────────────────────────────────
exports.getPendingRequests = async (req, res) => {
  try {
    const { role, id } = req.user;
    const approvalKey = roleToApprovalKey[role];
    if (!approvalKey) return res.status(403).json({ message: 'Invalid role' });

    const myIndex = APPROVAL_FLOW.indexOf(approvalKey);

    // Find all OD requests assigned to this faculty member
    const fieldMap = {
      mentor:          'mentorId',
      classAdvisor:    'advisorId',
      innovationHead:  'innovationHeadId',
      hod:             'hodId',
      cfi:             'cfiId'
    };

    const requests = await ODRequest.findAll({
      where: { [fieldMap[approvalKey]]: id, finalStatus: 'Pending' },
      include: [studentInclude, mentorInclude, advisorInclude, docInclude, appInclude],
      order: [['createdAt', 'DESC']]
    });

    // Filter: all previous steps approved AND this step still pending
    const pending = requests.filter(r => {
      const approvals = r.approvals || [];
      const getStatus = (key) => approvals.find(a => a.role === key)?.status || 'Pending';

      for (let i = 0; i < myIndex; i++) {
        if (getStatus(APPROVAL_FLOW[i]) !== 'Approved') return false;
      }
      return getStatus(approvalKey) === 'Pending';
    });

    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Faculty: all requests assigned to them ─────────────────────────────────
exports.getFacultyRequests = async (req, res) => {
  try {
    const { role, id } = req.user;

    // ClassAdvisor can filter by their role: as mentor or as advisor
    if (role === 'ClassAdvisor') {
      const asRole = req.query.as; // 'mentor' | 'advisor' | undefined (both)
      let where;
      if (asRole === 'mentor')  where = { mentorId: id };
      else if (asRole === 'advisor') where = { advisorId: id };
      else where = { [Op.or]: [{ mentorId: id }, { advisorId: id }] };

      const requests = await ODRequest.findAll({
        where,
        include: [studentInclude, mentorInclude, advisorInclude, docInclude, appInclude],
        order: [['createdAt', 'DESC']]
      });
      return res.json(requests);
    }

    const fieldMap = {
      Mentor:         'mentorId',
      InnovationHead: 'innovationHeadId',
      HOD:            'hodId',
      CFI:            'cfiId'
    };

    const field = fieldMap[role];
    if (!field) return res.status(403).json({ message: 'Invalid role' });

    const requests = await ODRequest.findAll({
      where: { [field]: id },
      include: [studentInclude, mentorInclude, advisorInclude, docInclude, appInclude],
      order: [['createdAt', 'DESC']]
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Approve / Reject ───────────────────────────────────────────────────────
exports.approveRejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    const { role, id: userId } = req.user;

    let approvalKey = roleToApprovalKey[role];
    if (!approvalKey) return res.status(403).json({ message: 'Invalid role' });

    const request = await ODRequest.findByPk(id, { include: [appInclude] });
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.finalStatus !== 'Pending') {
      return res.status(400).json({ message: `Request already ${request.finalStatus.toLowerCase()}` });
    }

    // ClassAdvisor may act as mentor if they were assigned as mentorId
    if (role === 'ClassAdvisor' && Number(request.mentorId) === Number(userId)) {
      approvalKey = 'mentor';
    }

    const getApproval = (key) => request.approvals.find(a => a.role === key);
    const myIndex = APPROVAL_FLOW.indexOf(approvalKey);

    // For APPROVAL only: verify all previous steps are approved
    // For REJECTION: any assigned faculty can reject at any time
    if (action === 'approve') {
      for (let i = 0; i < myIndex; i++) {
        const prev = getApproval(APPROVAL_FLOW[i]);
        if (!prev || prev.status !== 'Approved') {
          return res.status(400).json({ message: 'Previous approval step not completed yet' });
        }
      }
    }

    const myApproval = getApproval(approvalKey);
    if (!myApproval || myApproval.status !== 'Pending') {
      return res.status(400).json({ message: 'You have already acted on this request' });
    }
    await myApproval.update({
      status:     action === 'approve' ? 'Approved' : 'Rejected',
      remark:     reason || null,
      actionDate: new Date()
    });

    if (action === 'reject') {
      await request.update({ finalStatus: 'Rejected' });
    } else if (approvalKey === 'cfi') {
      await request.update({ finalStatus: 'Approved' });
      await User.increment('approvedODCount', { where: { id: request.studentId } });
    }

    const updated = await ODRequest.findByPk(id, {
      include: [studentInclude, mentorInclude, advisorInclude, docInclude, appInclude]
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Upload Proof ───────────────────────────────────────────────────────────
exports.uploadProof = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await ODRequest.findByPk(id, { include: [docInclude] });

    if (!request || request.studentId !== req.user.id) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (request.finalStatus !== 'Approved') {
      return res.status(400).json({ message: 'Can only upload proof for approved OD' });
    }
    if (new Date() <= new Date(request.toDate)) {
      return res.status(400).json({ message: 'Can only upload proof after OD end date' });
    }

    await request.documents.update({
      geoTagPhotoPath: req.files?.geoTaggedPhoto?.[0]?.path || null,
      certificatePath: req.files?.certificate?.[0]?.path    || null,
      proofUploadedAt: new Date()
    });

    res.json(await ODRequest.findByPk(id, { include: [docInclude, appInclude] }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Admin: all requests ────────────────────────────────────────────────────
exports.getAllRequests = async (req, res) => {
  try {
    const { department, status } = req.query;
    const where = {};
    if (department) where.department = department;
    if (status)     where.finalStatus = status;

    const requests = await ODRequest.findAll({
      where,
      include: [studentInclude, mentorInclude, advisorInclude, docInclude, appInclude],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
