const express = require('express');
const router = express.Router();
const {
  getNearbyCarWashes,
  getAllCarWashes,
  getCarWashById,
  getMyCarWash,
  createCarWash,
  updateCarWash,
  deleteCarWash
} = require('../controllers/carWashController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/nearby', getNearbyCarWashes);
router.get('/provider/my', protect, authorize('provider'), getMyCarWash);
router.get('/:id', getCarWashById);
router.get('/', getAllCarWashes);
router.post('/', protect, authorize('provider'), createCarWash);
router.put('/:id', protect, authorize('provider'), updateCarWash);
router.delete('/:id', protect, authorize('provider'), deleteCarWash);

module.exports = router;
