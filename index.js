require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');

const { classDefs } = require('./models/class');
const { queries, mutations, resolvers } = require('./graphql/class');

const rabbitMq = require('./helpers/rabbitMq');

mongoose
  .connect(`mongodb://localhost:27017/${process.env.MONGO_DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    rabbitMq.init(process.env.RABBIT_MQ_URL).then(() => rabbitMq.startAll());

    const server = new ApolloServer({
      typeDefs: [classDefs, queries, mutations],
      resolvers,
    });
    server.listen().then(({ url }) => {
      console.log(`🚀  Server ready at ${url}`);
    });
  });
