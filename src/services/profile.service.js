const SuperAdminProfile = require('../models/SuperAdminProfile');
const MentorProfile = require('../models/MentorProfile');
const StudentProfile = require('../models/StudentProfile');

const getProfile = async (userId, role) => {
  if (role === 'SUPER_ADMIN') {
    return SuperAdminProfile.findOne({ userId });
  } else if (role === 'ADMIN') {
    return MentorProfile.findOne({ userId });
  } else if (role === 'STUDENT') {
    return StudentProfile.findOne({ userId });
  }
  throw new Error('Invalid user role');
};

const updateProfile = async (userId, role, updateData) => {
  let profile = await getProfile(userId, role);
  if (!profile) {
    throw new Error('Profile not found');
  }

  if (role === 'SUPER_ADMIN') {
    const fields = ['name', 'designation'];
    fields.forEach((field) => {
      if (updateData[field] !== undefined) {
        profile[field] = updateData[field];
      }
    });

    if (updateData.settings) {
      profile.settings = {
        ...profile.settings,
        ...updateData.settings
      };
    }
  } else if (role === 'ADMIN') {
    const fields = ['name', 'designation', 'department', 'organization', 'phone'];
    fields.forEach((field) => {
      if (updateData[field] !== undefined) {
        profile[field] = updateData[field];
      }
    });
  } else if (role === 'STUDENT') {
    const fields = ['name', 'year', 'department', 'section', 'cgpa', 'skills', 'phone'];
    fields.forEach((field) => {
      if (updateData[field] !== undefined) {
        profile[field] = updateData[field];
      }
    });
  }

  await profile.save();
  return profile;
};

const updateProfileImage = async (userId, role, imagePath) => {
  let profile = await getProfile(userId, role);
  if (!profile) {
    throw new Error('Profile not found');
  }

  profile.profileImage = imagePath;
  await profile.save();
  return profile;
};

module.exports = {
  getProfile,
  updateProfile,
  updateProfileImage
};
