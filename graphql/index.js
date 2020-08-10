const { gql } = require('apollo-server');
const classPartials = require('./class');
const modelPartials = require('./model')
const recognitionPartials = require('./recognition');

const typeDefs = gql`
  ${classPartials.types}
  ${modelPartials.types}
  ${recognitionPartials.types}

  type Query {
    ${classPartials.queries}
    ${modelPartials.queries}
  }
  
  type Mutation {
    ${classPartials.mutations}
    ${recognitionPartials.mutations}
    ${modelPartials.mutations}
  }
`;

const resolvers = {
  Query: {
    ...classPartials.resolvers.Query,
    ...modelPartials.resolvers.Query,
  },
  Mutation: {
    ...classPartials.resolvers.Mutation,
    ...recognitionPartials.resolvers.Mutation,
    ...modelPartials.resolvers.Mutation,
  },
};

module.exports = { typeDefs, resolvers };
