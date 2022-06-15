const mongoose = require('mongoose');

module.exports = {
  Class: mongoose.model('class', {
    name: { type: String, unique: true },
    make: String,
    status: { type: String, default: 'collecting' },
    markup: mongoose.Schema.Types.Mixed,
    image_markup_path: { type: String, unique: false, required: false },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  }),
};
