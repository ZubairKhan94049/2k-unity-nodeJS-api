const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the Notification model using the schema
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
