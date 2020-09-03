require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AuthenticationError, ApolloError } = require('apollo-server');
const { v4 } = require('uuid');

const { User } = require('../models/user');
const { Class } = require('../models/class');
const { Application } = require('../models/application');
const { deleteClassById } = require('../helpers/class');
const { errorIfNotAuthenticated } = require('../helpers/authentication');
const { sendEmail } = require('../helpers/sendEmailHelper');

const types = `
  type User {
    _id: String!
    email: String!
    name: String
    company: String!
    is_admin: Boolean!
    is_confirmed: Boolean!
    classes: [Class]
    applications: [Application]
  }

  type Token {
    token: String!
  }
  
  type UserResponse {
    success: Boolean!
  }
`;
const queries = `
  user: User!
  users: [User]
  userInfo(registration_uuid: String!): User!
`;

const mutations = `
  createUser(email: String!, name: String, company: String!): User!
  createPassword(email: String!, password1: String!, password2: String): User!
  resetPassword(email: String!): User!
  login(email: String!, password: String!): Token!
  deleteUser(id: String!): UserResponse
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
    // eslint-disable-next-line
    userInfo: async (_, { registration_uuid }) => {
      const user = await User.findOne({ registration_uuid }).exec();
      if (!user) {
        throw new ApolloError('Current User was not found - Server error!');
      }
      return user;
    },
  },
  Mutation: {
    // eslint-disable-next-line no-unused-vars
    createUser: async (_, { email, name, company }, { me }) => {
      const currentUser = await User.findOne({ _id: me.id });
      if (!currentUser.is_admin) {
        throw new ApolloError('Only admins can create users!');
      }

      const exists = await User.findOne({ email });
      if (exists) {
        throw new ApolloError(
          'User with this email already exists! Please choose another email!'
        );
      }

      const registrationUuid = v4();
      const user = await User.create({
        email,
        name,
        company,
        registration_uuid: registrationUuid,
        is_admin: false,
      });

      if (!user) {
        throw new ApolloError('User was not created - server error!');
      }

      const to = email;
      const subject = 'Krack Invitation - Please Confirm Your Email';
      const html = `
        Hello, ${name},<br>
        Welcome to Krack, You've been invited to access your new account. 
        Please complete your registration and create a new password
        by the folowing <a target="_blank" href="${process.env
          .CREATE_PASSWORD_PAGE_URL +
          registrationUuid.toString()}/">this link</a><br>
        Thank you,<br>
        Krack Team<br>
        This is an automated email, please do not reply.
      `;
      console.log(to, subject, html);
      sendEmail(to, subject, html);
      return user;
    },
    // eslint-disable-next-line no-unused-vars
    resetPassword: async (_, { email }) => {
      const user = await User.findOne({ email }).exec();

      if (!user) {
        throw new ApolloError('User with current email does not exists');
      }

      const to = email;
      const subject = 'Krack Notification - Please Reset Your Password';
      const html = `
        Hello, ${user.name},<br>
        Create a new password
        by the folowing <a target="_blank" href="${process.env
          .CREATE_PASSWORD_PAGE_URL +
          user.registration_uuid.toString()}/">this link</a><br>
        Thank you,<br>
        Krack Team<br>
        This is an automated email, please do not reply.
      `;
      console.log(to, subject, html);
      sendEmail(to, subject, html);
      return user;
    },
    // eslint-disable-next-line no-unused-vars
    createPassword: async (_, { email, password1, password2 }) => {
      const user = await User.findOne({ email }).exec();

      if (!user) {
        throw new ApolloError(
          'User with current Email does not exists - Server error'
        );
      }

      if (password1 !== password2) {
        throw new ApolloError('Passwords does not match!');
      }
      user.password = password1;
      user.is_confirmed = true;

      return user.save();
    },
    // eslint-disable-next-line no-unused-vars
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email }).exec();

      if (!user) {
        throw new AuthenticationError(`User with this email does not exists`);
      }

      if (!user.is_confirmed) {
        throw new AuthenticationError(
          'Please, confirm at first your email before log in'
        );
      }

      const matchPasswords = bcrypt.compareSync(password, user.password);

      if (!matchPasswords) {
        throw new AuthenticationError(`Password you've entered is incorrect`);
      }

      const token = jwt.sign({ id: user.id }, process.env.PUBLIC_JWT_KEY, {
        expiresIn: process.env.AUTH_TOKEN_EXPIRE_MINUTES
          ? Number(process.env.AUTH_TOKEN_EXPIRE_MINUTES) * 60
          : 24 * 60 * 60 * 15,
      });

      return {
        token,
      };
    },
    deleteUser: async (_, { id }, { me }) => {
      const currentUser = await User.findOne({ _id: me.id });
      if (!currentUser.is_admin) {
        throw new ApolloError('Only admins can delete users!');
      }
      const user = await User.findOne({ _id: id });
      if (!user) return null;
      if (user.is_admin) {
        throw new ApolloError('You cant delete admin like this!');
      }

      const classes = await Class.find({ author: id });
      for (const cls of classes) {
        await deleteClassById(cls._id);
      }
      await Application.deleteMany({ author: id });
      await User.deleteOne({ _id: id });
      return { success: true };
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
