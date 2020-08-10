const mongoose = require('mongoose');

module.exports = {
  Model: mongoose.model('model', {
    path: { type: String, unique: true },
    classes: [String],
    date_created: { type: String, unique: true },
    is_active: { type: Boolean, default: false },
  }),
};
