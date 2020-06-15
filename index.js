const { ApolloServer, gql } = require("apollo-server")
const mongoose = require("mongoose")
const { classDefs } = require("./models/class")
const { queries, mutations, resolvers } = require("./graphql/class")

const server = new ApolloServer({
  typeDefs: [classDefs, queries, mutations],
  resolvers,
  context: async () => ({
    db: await mongoose.connect("mongodb://localhost:27017/krack", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
  }),
})

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
