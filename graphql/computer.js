require('dotenv').config();

const { Model } = require('../models/model');
const { Computer } = require('../models/computer');

const { errorIfNotAuthenticated } = require('../helpers/authentication');

const types = `
  type Computer {
    _id: String!
    position: Float!
    name: String!
    type: String!
    active_model: Model!
  }

  type ComputerResponse {
    success: Boolean!
  }
`;

const queries = `
    computers: [Computer!]!
`;

const mutations = `
    createComputer(name: String!, position: Float!, type: String, active_model_id: String): Computer!
    deleteComputer(position: Float!): ComputerResponse!
`;

const resolvers = {
  Query: {
    // eslint-disable-next-line no-unused-vars
    computers: async (parent, args, { me }, info) => {
      errorIfNotAuthenticated(me);
      return await Computer.find().exec();
    },
  },
  Mutation: {
    // eslint-disable-next-line
    createComputer: async (_, { name, position, type, active_model_id }, { me }) => {
      errorIfNotAuthenticated(me);
      return await Computer.create({
        name,
        position,
        type,
        active_model: active_model_id,
      });
    },
    deleteComputer: async (_, { position }, { me }) => {
      errorIfNotAuthenticated(me);

      const computer = await Computer.findOne({ position });
      if (!computer) {
        return { success: false };
      }
      await Computer.deleteOne({ position });

      return { success: true };
    },
  },
  Computer: {
    // eslint-disable-next-line no-unused-vars
    active_model: async ({ active_model }) => {
      return await Model.findOne({ _id: active_model }).exec();
    },
  },
};

module.exports = { types, queries, mutations, resolvers };
