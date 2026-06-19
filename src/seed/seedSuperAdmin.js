const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const User = require('../models/User');
const SuperAdminProfile = require('../models/SuperAdminProfile');

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.SEED_SUPERADMIN_EMAIL || 'superadmin@portal.com';
    const password = process.env.SEED_SUPERADMIN_PASSWORD;
    if (!password) {
      console.error('❌ Set SEED_SUPERADMIN_PASSWORD in the environment before seeding.');
      process.exit(1);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Super Admin user already exists. Seeding skipped.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create Super Admin User
    const superAdmin = await User.create({
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      forcePasswordChange: true,
      invitedAt: new Date()
    });

    // Create Profile
    await SuperAdminProfile.create({
      userId: superAdmin._id,
      name: 'Root Super Admin',
      email,
      designation: 'System Architect',
      settings: {
        emailNotifications: true,
        portalNotifications: true,
        darkMode: true
      }
    });

    console.log('\n🎉 SUCCESS: Super Admin Account Seeded successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
