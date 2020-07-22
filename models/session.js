const mongoose = require('mongoose');

module.exports = {
  Session: mongoose.model('session', {
    positionId: Number,
    supplier: String,
    brands: [String],
    classes: [String],
    inProgress: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
  }),
};
