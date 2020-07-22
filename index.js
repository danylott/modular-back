require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');

const { typeDefs, resolvers } = require('./graphql');
const rabbitMq = require('./helpers/rabbitMq');

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
    });
    server.listen().then(({ url }) => {
      console.log(`🚀  Server ready at ${url}`);
    });
  });
