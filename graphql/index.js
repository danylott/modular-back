const { gql } = require('apollo-server');
const classPartials = require('./class');
const modelPartials = require('./model');
const recognitionPartials = require('./recognition');
const imagePartials = require('./image');
const userPartials = require('./user');

const typeDefs = gql`
  ${classPartials.types}
  ${modelPartials.types}
  ${recognitionPartials.types}
  ${imagePartials.types}
  ${userPartials.types}

  type Query {
    ${classPartials.queries}
    ${modelPartials.queries}
    ${imagePartials.queries}
    ${userPartials.queries}
  }
  
  type Mutation {
    ${classPartials.mutations}
    ${recognitionPartials.mutations}
    ${modelPartials.mutations}
    ${imagePartials.mutations}
    ${userPartials.mutations}
  }
`;

const resolvers = {
  Query: {
    ...classPartials.resolvers.Query,
    ...modelPartials.resolvers.Query,
    ...imagePartials.resolvers.Query,
    ...userPartials.resolvers.Query,
  },
  Mutation: {
    ...classPartials.resolvers.Mutation,
    ...recognitionPartials.resolvers.Mutation,
    ...modelPartials.resolvers.Mutation,
    ...imagePartials.resolvers.Mutation,
    ...userPartials.resolvers.Mutation,
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
