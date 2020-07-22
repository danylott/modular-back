const { gql } = require('apollo-server');
const { Recognition } = require('../models/recognition');

const mutations = gql`
  type Mutation {
    getLastRecognition(createdAfterDate: Int!): [Class]
  }
`;

const resolvers = {
  Mutation: {
    getLastRecognition: async (_, { createdAfterDate }) =>
      Recognition.findOne({ createdAt: { $gt: new Date(createdAfterDate) } }),
  },
};

module.exports = { mutations, resolvers };
