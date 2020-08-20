require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server');

const { User } = require('../models/user');
const { Class } = require('../models/class');

const types = `
  type User {
    _id: String!
    email: String!
    name: String
    company: String!
    is_admin: Boolean!
    classes: [Class]
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
    user: async (parent, _, { me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const user = await User.findById({ _id: me.id }).exec();
      return user;
    },
    // eslint-disable-next-line no-unused-vars
    users: async (parent, args, { me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const users = await User.find().exec();
      return users;
    },
  },
  Mutation: {
    // eslint-disable-next-line no-unused-vars
    createUser: async (parent, { email, name, company, password }, _, info) => {
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
    login: async (parent, { email, password }, _, info) => {
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
    // eslint-disable-next-line no-unused-vars
    classes: async ({ id }, args, _, info) => {
      const user = await User.findById({ _id: id });
      if (user.is_admin) {
        const cls = await Class.find().exec();
        return cls;
      }
      const cls = await Class.find({ author: id }).exec();
      return cls;
    },
  },
};

module.exports = { types, queries, mutations, resolvers };
