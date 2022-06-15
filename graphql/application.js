require('dotenv').config();
const { errorIfNotAuthenticated } = require('../helpers/authentication');

const { Application } = require('../models/application');
const { User } = require('../models/user');

const types = `
  type Application {
    _id: String
    date_start: String!
    date_end: String!
    classes: [String!]!
    date_created: String!
    status: String
    author: User
  }
  type ApplicationResponse {
    success: Boolean!
  }
`;
const queries = `
    applications: [Application]!
`;

const mutations = `
    createApplication(date_start: String!, date_end: String!, classes: [String!]!): Application!
    deleteApplication(id: String!): ApplicationResponse!
`;

const resolvers = {
  Query: {
    // eslint-disable-next-line no-unused-vars
    applications: async (_, __, { me }) => {
      errorIfNotAuthenticated(me);
      const applications = await Application.find()
        .sort('-date_created')
        .exec();
      return applications;
    },
  },
  Mutation: {
    // eslint-disable-next-line
    createApplication: async (_, { date_start, date_end, classes }, { me }) => {
      errorIfNotAuthenticated(me);

      // eslint-disable-next-line camelcase
      const application = await Application.create({
        date_start: new Date(date_start).toDateString(),
        date_end: new Date(date_end).toDateString(),
        classes,
        author: me.id,
        date_created: new Date().toLocaleString(),
      });
      return application;
    },
    // eslint-disable-next-line
    deleteApplication: async (_, { id }, { me }) => {
      errorIfNotAuthenticated(me);

      const result = await Application.deleteOne({ _id: id });
      if (result) {
        return {
          success: true,
        };
      }
      return {
        success: false,
      };
    },
  },
  Application: {
    // eslint-disable-next-line no-unused-vars
    author: async ({ author }) => {
      const user = await User.findOne({ _id: author }).exec();
      return user;
    },
  },
};

module.exports = { types, queries, mutations, resolvers };
