const mongoose = require('mongoose');

module.exports = {
  Recognition: mongoose.model('recognition', {
    positionId: Number,
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'class',
    },
    barcode: String,
    image: String,
    score: Number,
    recognized: {
      model: String,
      size: String,
      color: String,
    },
    response: Map,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
  }),
};
