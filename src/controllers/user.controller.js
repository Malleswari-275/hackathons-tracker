const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/helpers');

const createAdmin = async (req, res, next) => {
  try {
    const result = await userService.createAdmin(req.body, req.user._id);
    return sendSuccess(res, 'Admin user created successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

const editAdmin = async (req, res, next) => {
  try {
    const profile = await userService.editAdmin(req.params.id, req.body);
    return sendSuccess(res, 'Admin profile updated successfully', profile);
  } catch (error) {
    next(error);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const result = await userService.createStudent(req.body, req.user._id);
    return sendSuccess(res, 'Student user created successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const profile = await userService.updateStudent(req.params.id, req.body);
    return sendSuccess(res, 'Student profile updated successfully', profile);
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const result = await userService.toggleUserStatus(req.params.id, status);
    return sendSuccess(res, `User account is now ${status}`, result);
  } catch (error) {
    next(error);
  }
};

const listAdmins = async (req, res, next) => {
  try {
    const admins = await userService.listAdmins();
    return sendSuccess(res, 'Admin accounts retrieved successfully', admins);
  } catch (error) {
    next(error);
  }
};

const listStudents = async (req, res, next) => {
  try {
    const students = await userService.listStudents();
    return sendSuccess(res, 'Student accounts retrieved successfully', students);
  } catch (error) {
    next(error);
  }
};

const resetUserPassword = async (req, res, next) => {
  try {
    const result = await userService.resetUserPassword(req.params.id);
    return sendSuccess(res, 'User password reset successfully. New credentials dispatched via email.', result);
  } catch (error) {
    next(error);
  }
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
