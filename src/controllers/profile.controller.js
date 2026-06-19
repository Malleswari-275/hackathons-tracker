const profileService = require('../services/profile.service');
const { sendSuccess, sendError } = require('../utils/helpers');

const getMyProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user._id, req.user.role);
    return sendSuccess(res, 'Profile retrieved successfully', profile);
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const profile = await profileService.updateProfile(req.user._id, req.user.role, req.body);
    return sendSuccess(res, 'Profile updated successfully', profile);
  } catch (error) {
    next(error);
  }
};

const uploadMyProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded or file format invalid', 400);
    }

    // Relative path or file URL structure
    const imagePath = `/uploads/${req.file.filename}`;
    const profile = await profileService.updateProfileImage(req.user._id, req.user.role, imagePath);

    return sendSuccess(res, 'Profile image uploaded successfully', {
      profileImage: imagePath,
      profile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadMyProfileImage
};
