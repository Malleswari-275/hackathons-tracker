const express = require('express');
const profileController = require('../controllers/profile.controller');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const validationHandler = require('../middleware/validationHandler');
const { updateProfileValidator } = require('../validators/profile.validator');

const router = express.Router();

router.use(authMiddleware);

router.get('/me', profileController.getMyProfile);
router.put('/me', updateProfileValidator, validationHandler, profileController.updateMyProfile);
router.post('/me/image', upload.single('image'), profileController.uploadMyProfileImage);

module.exports = router;
