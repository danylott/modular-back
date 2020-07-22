require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');

const { classDefs } = require('./models/class');
const classTypeDefs = require('./graphql/class');
const recognitionTypeDefs = require('./graphql/recognition');

const rabbitMq = require('./helpers/rabbitMq');

mongoose
  .connect(`mongodb://localhost:27017/${process.env.MONGO_DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    rabbitMq.init(process.env.RABBIT_MQ_URL).then(() => rabbitMq.startAll());

    const server = new ApolloServer({
      typeDefs: [
        classDefs,
        classTypeDefs.queries,
        classTypeDefs.mutations,
        recognitionTypeDefs.mutations,
      ],
      resolvers: {
        ...classTypeDefs.resolvers,
        ...recognitionTypeDefs.resolvers,
      },
    });
    server.listen().then(({ url }) => {
      console.log(`🚀  Server ready at ${url}`);
    });
  });
