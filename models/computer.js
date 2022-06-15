const mongoose = require('mongoose');

module.exports = {
  Computer: mongoose.model('computer', {
    position: { type: Number, unique: true, required: true },
    name: { type: String, unique: true, required: true },
    type: { type: String, default: 'client', required: true },
    active_model: { type: mongoose.Schema.Types.ObjectId, ref: 'model' },
  }),
};
