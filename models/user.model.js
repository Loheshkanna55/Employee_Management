const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['employee', 'admin'],
    default: 'employee'
  },
  department: {
    type: String,
    required: true
  },
  position: {
    type: String,
    default: 'Staff'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  contactNumber: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: '/images/default-avatar.png'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);