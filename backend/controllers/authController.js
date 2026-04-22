const jwt = require('jsonwebtoken');
const { User, Department, ODRequest } = require('../models');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
  try {
    const {
      name, email, password, role, department,
      rollNumber, staffId, year, isClassAdvisor, advisorYear
    } = req.body;

    if (['Admin', 'HOD', 'InnovationHead', 'CFI'].includes(role)) {
      return res.status(400).json({ message: 'Cannot register this role' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const resolvedRole = role === 'Faculty'
      ? (isClassAdvisor === 'true' || isClassAdvisor === true ? 'ClassAdvisor' : 'Mentor')
      : role;

    const userData = {
      name, email, password,
      role: resolvedRole,
      department,
      profilePhoto: req.file ? req.file.path : null
    };

    if (role === 'Student') {
      userData.rollNumber = rollNumber;
      userData.year = parseInt(year);
    } else {
      userData.staffId = staffId;
      if (resolvedRole === 'ClassAdvisor') {
        userData.isClassAdvisor = true;
        userData.advisorYear = parseInt(advisorYear);
      }
    }

    const user = await User.create(userData);
    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    res.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        role: user.role, department: user.department,
        rollNumber: user.rollNumber, year: user.year,
        staffId: user.staffId, isClassAdvisor: user.isClassAdvisor,
        advisorYear: user.advisorYear, profilePhoto: user.profilePhoto,
        approvedODCount: user.approvedODCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, password } = req.body;

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(400).json({ message: 'Email already in use' });
    }

    const updates = {};
    if (name)  updates.name  = name;
    if (email) updates.email = email;
    if (password) updates.password = password;
    if (req.file) updates.profilePhoto = req.file.path;

    await user.update(updates);

    const updated = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'Student') {
      const approvedCount = await ODRequest.count({
        where: { studentId: user.id, finalStatus: 'Approved' }
      });
      if (user.approvedODCount !== approvedCount) {
        await user.update({ approvedODCount: approvedCount });
      }
      return res.json({ ...user.toJSON(), approvedODCount: approvedCount });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
