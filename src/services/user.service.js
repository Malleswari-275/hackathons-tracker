const bcrypt = require('bcrypt');
const User = require('../models/User');
const MentorProfile = require('../models/MentorProfile');
const StudentProfile = require('../models/StudentProfile');
const { generateRandomPassword } = require('../utils/helpers');
const { sendEmail } = require('../config/mailer');
const { getCredentialsEmail } = require('../templates/emailTemplates');

const createAdmin = async (adminData, creatorId) => {
  const existingUser = await User.findOne({ email: adminData.email.toLowerCase() });
  if (existingUser) {
    throw new Error('A user with this email address already exists');
  }

  const temporaryPassword = generateRandomPassword();
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(temporaryPassword, salt);

  // Create User
  const newUser = await User.create({
    email: adminData.email.toLowerCase(),
    passwordHash,
    role: 'ADMIN',
    status: 'INVITED',
    forcePasswordChange: true,
    createdBy: creatorId,
    invitedAt: new Date()
  });

  // Create Mentor Profile
  await MentorProfile.create({
    userId: newUser._id,
    employeeId: adminData.employeeId,
    name: adminData.name,
    email: adminData.email.toLowerCase(),
    designation: adminData.designation,
    department: adminData.department,
    organization: adminData.organization,
    phone: adminData.phone,
    profileImage: adminData.profileImage || '',
    status: 'ACTIVE'
  });

  // Send credentials
  const mailTemplates = getCredentialsEmail(newUser.email, temporaryPassword, 'ADMIN');
  await sendEmail({
    to: newUser.email,
    ...mailTemplates
  });

  return {
    _id: newUser._id,
    email: newUser.email,
    role: newUser.role,
    status: newUser.status,
    temporaryPassword
  };
};

const editAdmin = async (adminId, updateData) => {
  const profile = await MentorProfile.findOne({ userId: adminId });
  if (!profile) {
    throw new Error('Admin profile not found');
  }

  // Edit fields
  const fields = ['name', 'designation', 'department', 'organization', 'phone', 'profileImage'];
  fields.forEach((field) => {
    if (updateData[field] !== undefined) {
      profile[field] = updateData[field];
    }
  });

  await profile.save();
  return profile;
};

const createStudent = async (studentData, creatorId) => {
  const existingUser = await User.findOne({ email: studentData.email.toLowerCase() });
  if (existingUser) {
    throw new Error('A user with this email address already exists');
  }

  // Roll number check
  const existingRoll = await StudentProfile.findOne({ rollNumber: studentData.rollNumber });
  if (existingRoll) {
    throw new Error('A student with this roll number already exists');
  }

  const temporaryPassword = generateRandomPassword();
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(temporaryPassword, salt);

  // Create User
  const newUser = await User.create({
    email: studentData.email.toLowerCase(),
    passwordHash,
    role: 'STUDENT',
    status: 'INVITED',
    forcePasswordChange: true,
    createdBy: creatorId,
    invitedAt: new Date()
  });

  // Create Student Profile
  await StudentProfile.create({
    userId: newUser._id,
    rollNumber: studentData.rollNumber,
    name: studentData.name,
    email: studentData.email.toLowerCase(),
    year: studentData.year,
    department: studentData.department,
    section: studentData.section,
    cgpa: studentData.cgpa || 0,
    skills: studentData.skills || [],
    phone: studentData.phone,
    profileImage: studentData.profileImage || '',
    status: 'ACTIVE',
    createdBy: creatorId
  });

  // Send credentials
  const mailTemplates = getCredentialsEmail(newUser.email, temporaryPassword, 'STUDENT');
  await sendEmail({
    to: newUser.email,
    ...mailTemplates
  });

  return {
    _id: newUser._id,
    email: newUser.email,
    role: newUser.role,
    status: newUser.status,
    temporaryPassword
  };
};

const updateStudent = async (studentId, updateData) => {
  const profile = await StudentProfile.findOne({ userId: studentId });
  if (!profile) {
    throw new Error('Student profile not found');
  }

  // Update rollNumber check
  if (updateData.rollNumber && updateData.rollNumber !== profile.rollNumber) {
    const rollExists = await StudentProfile.findOne({ rollNumber: updateData.rollNumber });
    if (rollExists) {
      throw new Error('A student with this roll number already exists');
    }
    profile.rollNumber = updateData.rollNumber;
  }

  const fields = ['name', 'year', 'department', 'section', 'cgpa', 'skills', 'phone', 'profileImage'];
  fields.forEach((field) => {
    if (updateData[field] !== undefined) {
      profile[field] = updateData[field];
    }
  });

  await profile.save();
  return profile;
};

const toggleUserStatus = async (userId, targetStatus) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!['ACTIVE', 'BLOCKED'].includes(targetStatus)) {
    throw new Error('Invalid status value');
  }

  user.status = targetStatus;
  await user.save();

  // Sync status to profiles
  if (user.role === 'ADMIN') {
    await MentorProfile.updateOne({ userId }, { status: targetStatus });
  } else if (user.role === 'STUDENT') {
    await StudentProfile.updateOne({ userId }, { status: targetStatus });
  }

  return { userId: user._id, status: user.status };
};

const listAdmins = async () => {
  return MentorProfile.find().populate('userId', 'email role status lastLoginAt');
};

const listStudents = async () => {
  return StudentProfile.find().populate('userId', 'email role status lastLoginAt');
};

const resetUserPassword = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const temporaryPassword = generateRandomPassword();
  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(temporaryPassword, salt);
  user.forcePasswordChange = true;
  await user.save();

  // Send email
  const mailTemplates = getCredentialsEmail(user.email, temporaryPassword, user.role);
  await sendEmail({
    to: user.email,
    ...mailTemplates
  });

  return { success: true, temporaryPassword };
};

module.exports = {
  createAdmin,
  editAdmin,
  createStudent,
  updateStudent,
  toggleUserStatus,
  listAdmins,
  listStudents,
  resetUserPassword
};
