const { ApolloError } = require('apollo-server');

const errorIfNotAuthenticated = (me) => {
  if (!me) {
    throw new ApolloError('You are not authenticated');
  }
};

module.exports = { errorIfNotAuthenticated };
