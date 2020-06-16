const { gql } = require("apollo-server")
const { Class } = require("../models/class")
const { createWriteStream } = require("fs")

const queries = gql`
  type Query {
    classes: [Class]
  }
`
const mutations = gql`
  type FindResponse {
    found: Boolean!
    class: Class
    make: String
    color: String
    size: String
    model: String
  }

  type Mutation {
    createClass(name: String, make: String): Class
    updateClass(
      name: String
      make: String
      status: String
      markup: [ClassMarkupInput]
    ): Class
    findOnImage(file: Upload!): FindResponse
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
    findOnImage: async (parent, { file }) => {
      const { createReadStream, filename, mimetype, encoding } = await file
      const stream = createReadStream()
      const path = `images/test.jpg`
      await new Promise((resolve, reject) =>
        stream
          .pipe(createWriteStream(path))
          .on("finish", resolve)
          .on("error", reject)
      )
      return { found: false, make: filename }
    },
  },
}

module.exports = { queries, mutations, resolvers }
