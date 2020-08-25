const mongoose = require('mongoose');

module.exports = {
  Application: mongoose.model('application', {
    date_start: { type: String, required: true },
    date_end: { type: String, required: true },
    date_created: { type: String, required: true },
    classes: mongoose.Schema.Types.Mixed,
  }),
};
