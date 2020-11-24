require('dotenv').config();
const { Model } = require('../models/model');
const { errorIfNotAuthenticated } = require('../helpers/authentication');

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
`

const resolvers = {
  Query: {
    models: () => {
      return Model.find();
    },
  },
  Mutation: {
    activateModel: async (_, { path }, { me }) => {
      errorIfNotAuthenticated(me);
      const mod = await  Model.findOne({ path });
      if (!mod) return null;
  
      const old = await Model.findOne({ is_active: true });
      if (!old) return null;
  
      mod.is_active = true;
      old.is_active = false;
      old.save();

      const { exec } = require('child_process');
      console.info('restart flask-api');
      exec(process.env.TERMINAL_COMMAND_TO_RESTART_PYTHON_API, (err, stdout, stderr) => {
          if (err) {
              СЃonsole.error(err);
              return {success: false};
          } else {
              console.log(`stdout: ${stdout}`);
              console.log(`stderr: ${stderr}`);
          }
      });
      
      return mod.save();
    },
    deleteModel: async (_, { path }) => {
      errorIfNotAuthenticated(me);
      const mod = await Model.findOne({path})
      console.log('delete', mod);
      if(!mod) return null;

      const res = await Model.deleteOne({path})

      return true;
    }
  },
};

module.exports = { types, queries, mutations, resolvers };