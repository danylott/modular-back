require('dotenv').config();
const { ApolloServer, AuthenticationError } = require('apollo-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { typeDefs, resolvers } = require('./graphql');
const rabbitMq = require('./helpers/rabbitMq');

const getUser = async (req) => {
  const { token } = req.headers;

  if (token) {
    try {
      return await jwt.verify(token, process.env.PUBLIC_JWT_KEY);
    } catch (e) {
      throw new AuthenticationError('Invalid Token');
    }
  }
  return null;
};

mongoose
  .connect(`mongodb://localhost:27017/${process.env.MONGO_DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    rabbitMq.init(process.env.RABBIT_MQ_URL).then(() => rabbitMq.startAll());

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async ({ req }) => {
        if (req) {
          const me = await getUser(req);

          return {
            me,
          };
        }
        const me = null;
        return {
          me,
        };
      },
    });
    server.listen().then(({ url }) => {
      console.log(`🚀  Server ready at ${url}`);
    });
  });
