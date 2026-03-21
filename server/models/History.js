const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  summary: String,
  social: String,
  seo: String
}, { timestamps: true });

module.exports = mongoose.model('History', historySchema);