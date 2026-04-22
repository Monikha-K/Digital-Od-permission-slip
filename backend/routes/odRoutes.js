const express = require('express');
const router = express.Router();
const { 
  createODRequest, 
  getMyODRequests, 
  getPendingRequests,
  getFacultyRequests, 
  approveRejectRequest, 
  uploadProof,
  getAllRequests 
} = require('../controllers/odController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, authorize('Student'), upload.fields([
  { name: 'registrationForm', maxCount: 1 },
  { name: 'paymentProof', maxCount: 1 },
  { name: 'eventPoster', maxCount: 1 }
]), createODRequest);

router.get('/my-requests', protect, authorize('Student'), getMyODRequests);
router.get('/pending', protect, authorize('Mentor', 'ClassAdvisor', 'InnovationHead', 'HOD', 'CFI'), getPendingRequests);
router.get('/faculty-requests', protect, authorize('Mentor', 'ClassAdvisor', 'InnovationHead', 'HOD', 'CFI'), getFacultyRequests);
router.get('/all', protect, authorize('Admin'), getAllRequests);
router.put('/:id/action', protect, authorize('Mentor', 'ClassAdvisor', 'InnovationHead', 'HOD', 'CFI'), approveRejectRequest);
router.put('/:id/proof', protect, authorize('Student'), upload.fields([
  { name: 'geoTaggedPhoto', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), uploadProof);

module.exports = router;
