const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6, // Enforce minimum password length
    select: false, // Do not return password by default when querying users
  },
  country: {
    type: String,
    required: [true, 'Please add a country'],
  },
  // Optional: Add role later for RBAC
  // role: {
  //   type: String,
  //   enum: ['User', 'Manager', 'Admin'],
  //   default: 'User',
  // },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// We will add pre-save hook for password hashing later if needed,
// but often hashing is handled in the route/controller logic before saving.

module.exports = mongoose.model('User', UserSchema);
