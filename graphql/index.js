const { gql } = require('apollo-server');
const classPartials = require('./class');
const modelPartials = require('./model');
const recognitionPartials = require('./recognition');
const imagePartials = require('./image');
const userPartials = require('./user');
const applicationPartials = require('./application');
const computerPartials = require('./computer');

const typeDefs = gql`
  ${classPartials.types}
  ${modelPartials.types}
  ${recognitionPartials.types}
  ${imagePartials.types}
  ${userPartials.types}
  ${applicationPartials.types}
  ${computerPartials.types}

  type Query {
    ${classPartials.queries}
    ${modelPartials.queries}
    ${imagePartials.queries}
    ${userPartials.queries}
    ${applicationPartials.queries}
    ${computerPartials.queries}
  }
  
  type Mutation {
    ${classPartials.mutations}
    ${recognitionPartials.mutations}
    ${modelPartials.mutations}
    ${imagePartials.mutations}
    ${userPartials.mutations}
    ${applicationPartials.mutations}
    ${computerPartials.mutations}
  }
`;

const resolvers = {
  Query: {
    ...classPartials.resolvers.Query,
    ...modelPartials.resolvers.Query,
    ...imagePartials.resolvers.Query,
    ...userPartials.resolvers.Query,
    ...applicationPartials.resolvers.Query,
    ...computerPartials.resolvers.Query,
  },
  Mutation: {
    ...classPartials.resolvers.Mutation,
    ...recognitionPartials.resolvers.Mutation,
    ...modelPartials.resolvers.Mutation,
    ...imagePartials.resolvers.Mutation,
    ...userPartials.resolvers.Mutation,
    ...applicationPartials.resolvers.Mutation,
    ...computerPartials.resolvers.Mutation,
  },
  Image: {
    ...imagePartials.resolvers.Image,
  },
  User: {
    ...userPartials.resolvers.User,
  },
  Class: {
    ...classPartials.resolvers.Class,
  },
  Application: {
    ...applicationPartials.resolvers.Application,
  },
  Computer: {
    ...computerPartials.resolvers.Computer,
  },
};

module.exports = { typeDefs, resolvers };
