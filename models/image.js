const mongoose = require('mongoose');

module.exports = {
  Image: mongoose.model('image', {
    path: { type: String, unique: true, required: true },
    path_labeled: { type: String, unique: false, required: false },
    path_cropped: { type: String, unique: false, required: false },
    status: { type: String, default: 'awaiting markup', required: true },
    cls: { type: mongoose.Schema.Types.ObjectId, ref: 'class' },
    annotation: mongoose.Schema.Types.Mixed,
  }),
};
