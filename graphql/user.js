require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server');
const { errorIfNotAuthenticated } = require('../helpers/authentication');

const { User } = require('../models/user');
const { Class } = require('../models/class');
const { Application } = require('../models/application');

const types = `
  type User {
    _id: String!
    email: String!
    name: String
    company: String!
    is_admin: Boolean!
    classes: [Class]
    applications: [Application]
  }

  type Token {
    token: String!
  }
`;
const queries = `
  user: User!
  users: [User]
`;

const mutations = `
  createUser(email: String!, name: String, company: String!, password: String!): User!
  login(email: String!, password: String!): Token!
`;

const resolvers = {
  Query: {
    // eslint-disable-next-line no-unused-vars
    user: async (_, __, { me }) => {
      errorIfNotAuthenticated(me);
      const user = await User.findById({ _id: me.id }).exec();
      return user;
    },
    // eslint-disable-next-line no-unused-vars
    users: async (_, __, { me }) => {
      errorIfNotAuthenticated(me);
      const users = await User.find().exec();
      return users;
    },
  },
  Mutation: {
    // eslint-disable-next-line no-unused-vars
    createUser: async (_, { email, name, company, password }) => {
      const user = await User.create({
        email,
        name,
        company,
        password,
        is_admin: false,
      });
      return user;
    },
    // eslint-disable-next-line no-unused-vars
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email }).exec();

      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      const matchPasswords = bcrypt.compareSync(password, user.password);

      if (!matchPasswords) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = jwt.sign({ id: user.id }, process.env.PUBLIC_JWT_KEY, {
        expiresIn: 24 * 10 * 60,
      });

      return {
        token,
      };
    },
  },
  User: {
    classes: async ({ id }) => {
      const user = await User.findById({ _id: id });
      if (user.is_admin) {
        const cls = await Class.find()
          .collation({ locale: 'en', strength: 2 })
          .sort({ name: 1 })
          .exec();
        return cls;
      }
      const cls = await Class.find({ author: id })
        .collation({ locale: 'en', strength: 2 })
        .sort({ name: 1 })
        .exec();
      return cls;
    },
    applications: async ({ id }) => {
      const user = await User.findById({ _id: id });
      if (user.is_admin) {
        const cls = await Application.find()
          .sort('-date_created')
          .exec();
        return cls;
      }
      const cls = await Application.find({ author: id })
        .sort('-date_created')
        .exec();
      return cls;
    },
  },
};

module.exports = { types, queries, mutations, resolvers };
