require('dotenv').config();
const { AuthenticationError } = require('apollo-server');

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
    applications: async (parent, args, { me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const applications = await Application.find()
        .sort('-date_created')
        .exec();
      return applications;
    },
  },
  Mutation: {
    // eslint-disable-next-line
    createApplication: async (parent, { date_start, date_end, classes }, { me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }

      // eslint-disable-next-line camelcase
      const application = await Application.create({
        date_start: new Date(date_start).toLocaleString(),
        date_end: new Date(date_end).toLocaleString(),
        classes,
        author: me.id,
        date_created: new Date().toLocaleString(),
      });
      return application;
    },
    // eslint-disable-next-line
    deleteApplication: async (parent, { id }, { me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }

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
    author: async ({ author }, _, args, info) => {
      const user = await User.findOne({ _id: author }).exec();
      return user;
    },
  },
};

module.exports = { types, queries, mutations, resolvers };
