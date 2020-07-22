const { Recognition } = require('../models/recognition');

const types = `
  type RecognizedTexts {
    model: String
    size: String
    color: String
  }
  
  type Recognition {
    _id: String
    positionId: Int
    classId: String
    barcode: String
    image: String
    score: Float
    recognized: RecognizedTexts
    createdAt: String
    updatedAt: String
  }
`;

const mutations = `
  lastRecognition(createdAfterDate: String): Recognition
`;

const resolvers = {
  Mutation: {
    lastRecognition: (_, { createdAfterDate }) =>
      Recognition.findOne({ createdAt: { $gt: new Date(createdAfterDate) } }),
  },
};

module.exports = { types, mutations, resolvers };
