require('dotenv').config();
const { Model } = require('../models/model');
const { Computer } = require('../models/computer');
const { errorIfNotAuthenticated } = require('../helpers/authentication');
const { restartPythonApi } = require('../helpers/restartPythonApi');

const types = `
  type Model {
    _id: String
    path: String!
    date_created: String
    classes: [String]
    is_active: Boolean
  }
  type Response {
    success: Boolean
  }
`;
const queries = `
  models: [Model]
`;

const mutations = `
    activateModel(path: String!): Model
    deleteModel(path: String): Response
`;

const resolvers = {
  Query: {
    models: () => {
      return Model.find();
    },
  },
  Mutation: {
    activateModel: async (_, { path }, { me }) => {
      errorIfNotAuthenticated(me);
      const mod = await Model.findOne({ path });
      if (!mod) return null;

      const computer = await Computer.findOne({
        position: +process.env.COMPUTER_POSITION,
      });
      computer.active_model = mod._id;
      computer.save();

      const result = await restartPythonApi();

      if (!result) return null;

      return mod;
    },
    deleteModel: async (_, { path }) => {
      errorIfNotAuthenticated(me);
      const mod = await Model.findOne({ path });
      console.log('delete', mod);
      if (!mod) return null;

      const res = await Model.deleteOne({ path });

      return true;
    },
  },
  Model: {
    is_active: async ({ id }) => {
      const computer = await Computer.findOne({
        position: +process.env.COMPUTER_POSITION,
      });
      return `${computer.active_model}` === `${id}`;
    },
  },
};

module.exports = { types, queries, mutations, resolvers };
