const { ApolloServer, gql } = require("apollo-server")
const mongoose = require("mongoose")
const Class = require("./models/class")

const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  type Class {
    name: String
    make: String
    status: String
    markup: [ClassMarkup]
  }

  type ClassMarkup {
    field: String
    x: Float
    y: Float
    w: Float
    h: Float
  }

  type Query {
    classes: [Class]
  }

  input ClassMarkupInput {
    field: String
    x: Float
    y: Float
    w: Float
    h: Float
  }

  type Mutation {
    createClass(name: String, make: String): Class
    updateClass(
      name: String
      make: String
      status: String
      markup: [ClassMarkupInput]
    ): Class
  }
`

const resolvers = {
  Query: {
    classes: () => {
      return Class.find()
    },
  },
  Mutation: {
    createClass: async (_, data) => {
      return Class.create(data)
    },
    updateClass: async (_, { name, make, status, markup }) => {
      const cl = await Class.findOne({ name })
      if (!cl) return null

      if (make) cl.make = make
      if (status) cl.status = status
      if (markup) cl.markup = markup
      return cl.save()
    },
  },
}

const server = new ApolloServer({
  typeDefs,
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
