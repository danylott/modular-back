const mongoose = require('mongoose');

module.exports = {
  Class: mongoose.model('class', {
    name: { type: String, unique: true },
    make: String,
    status: { type: String, default: 'collecting' },
    markup: mongoose.Schema.Types.Mixed,
  }),
};
