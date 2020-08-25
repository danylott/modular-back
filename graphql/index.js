const { gql } = require('apollo-server');
const classPartials = require('./class');
const modelPartials = require('./model');
const recognitionPartials = require('./recognition');
const imagePartials = require('./image');
const userPartials = require('./user');
const applicationPartials = require('./application');

const typeDefs = gql`
  ${classPartials.types}
  ${modelPartials.types}
  ${recognitionPartials.types}
  ${imagePartials.types}
  ${userPartials.types}
  ${applicationPartials.types}

  type Query {
    ${classPartials.queries}
    ${modelPartials.queries}
    ${imagePartials.queries}
    ${userPartials.queries}
    ${applicationPartials.queries}
  }
  
  type Mutation {
    ${classPartials.mutations}
    ${recognitionPartials.mutations}
    ${modelPartials.mutations}
    ${imagePartials.mutations}
    ${userPartials.mutations}
    ${applicationPartials.mutations}
  }
`;

const resolvers = {
  Query: {
    ...classPartials.resolvers.Query,
    ...modelPartials.resolvers.Query,
    ...imagePartials.resolvers.Query,
    ...userPartials.resolvers.Query,
    ...applicationPartials.resolvers.Query,
  },
  Mutation: {
    ...classPartials.resolvers.Mutation,
    ...recognitionPartials.resolvers.Mutation,
    ...modelPartials.resolvers.Mutation,
    ...imagePartials.resolvers.Mutation,
    ...userPartials.resolvers.Mutation,
    ...applicationPartials.resolvers.Mutation,
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
};

module.exports = { typeDefs, resolvers };
