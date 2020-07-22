const { gql } = require('apollo-server');
const classPartials = require('./class');
const recognitionPartials = require('./recognition');

const typeDefs = gql`
  ${classPartials.types}
  ${recognitionPartials.types}

  type Query {
    ${classPartials.queries}
  }
  
  type Mutation {
    ${classPartials.mutations}
    ${recognitionPartials.mutations}
  }
`;

const resolvers = {
  Query: {
    ...classPartials.resolvers.Query,
  },
  Mutation: {
    ...classPartials.resolvers.Mutation,
    ...recognitionPartials.resolvers.Mutation,
  },
};

module.exports = { typeDefs, resolvers };
