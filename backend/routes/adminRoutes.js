const express = require('express');
const router = express.Router();
const { 
  getAllUsers, deleteUser, getDashboardStats,
  getMentorsByDepartment, getClassAdvisorsByDepartmentYear,
  blockUser, unblockUser, getReports
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/users',    protect, authorize('Admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('Admin'), deleteUser);
router.put('/users/:id/block',   protect, authorize('Admin'), blockUser);
router.put('/users/:id/unblock', protect, authorize('Admin'), unblockUser);
router.get('/reports',  protect, authorize('Admin'), getReports);
router.get('/stats',    protect, authorize('Admin'), getDashboardStats);
router.get('/mentors/:department', protect, getMentorsByDepartment);
router.get('/advisors/:department/:year', protect, getClassAdvisorsByDepartmentYear);

module.exports = router;
