const { AuthenticationError } = require('apollo-server');

const errorIfNotAuthenticated = (me) => {
  if (!me) {
    throw new AuthenticationError('You are not authenticated');
  }
};

module.exports = { errorIfNotAuthenticated };
