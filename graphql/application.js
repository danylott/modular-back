require('dotenv').config();
const { AuthenticationError } = require('apollo-server');

const { Application } = require('../models/application');

const types = `
  type Application {
    _id: String
    date_start: String!
    date_end: String!
    classes: [String!]!
    date_created: String!
  }
`;
const queries = `
    applications: [Application]!
`;

const mutations = `
    createApplication(date_start: String!, date_end: String!, classes: [String!]!): Application!
`;

const resolvers = {
  Query: {
    // eslint-disable-next-line no-unused-vars
    applications: async (parent, args, { me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const applications = await Application.find().exec();
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
        date_start,
        date_end,
        classes,
        date_created: new Date().toString(),
      });
      return application;
    },
  },
};

module.exports = { types, queries, mutations, resolvers };
