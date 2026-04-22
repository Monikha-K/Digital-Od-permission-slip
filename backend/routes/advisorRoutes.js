const express = require('express');
const router  = express.Router();
const { getProofSubmissions, warnStudent, reportStudent, getMyWarnings } = require('../controllers/advisorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/proof-submissions', protect, authorize('ClassAdvisor'), getProofSubmissions);
router.post('/warn/:odRequestId',   protect, authorize('ClassAdvisor'), warnStudent);
router.post('/report/:odRequestId', protect, authorize('ClassAdvisor'), reportStudent);
router.get('/my-warnings', protect, authorize('Student'), getMyWarnings);

module.exports = router;
