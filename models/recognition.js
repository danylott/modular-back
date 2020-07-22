const mongoose = require('mongoose');

module.exports = {
  Recognition: mongoose.model('recognition', {
    positionId: Number,
    classId: mongoose.Schema.Types.ObjectId,
    barcode: String,
    image: String,
    score: Number,
    recognized: Map,
    response: Map,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
  }),
};
