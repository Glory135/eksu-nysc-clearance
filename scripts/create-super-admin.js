const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

async function createSuperAdmin() {
  try {
    console.log("DB: ", process.env.MONGODB_URI)
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10); // Change this password
    
    // Create super admin user (super admins don't need a department)
    const superAdmin = {
      name: 'Super Admin',
      email: 'admin@eksu.edu.ng', // Change this email
      matricNumber: 'ADMIN001',
      password: hashedPassword,
      role: 'super_admin',
      // department: null, // Super admins don't need a department
      accountStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert into database
    const result = await mongoose.connection.collection('users').insertOne(superAdmin);
    console.log('Super admin created successfully!');
    console.log('User ID:', result.insertedId);
    console.log('Email: admin@eksu.edu.ng');
    console.log('Password: admin123');
    console.log('\nPlease change the password after first login!');
    
  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createSuperAdmin();
