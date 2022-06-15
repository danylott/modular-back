const mongoose = require('mongoose');

module.exports = {
  Application: mongoose.model('application', {
    date_start: { type: String, required: true },
    date_end: { type: String, required: true },
    date_created: { type: String, required: true },
    status: { type: String, default: 'awaiting training' },
    classes: mongoose.Schema.Types.Mixed,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  }),
};
