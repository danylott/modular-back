const { gql } = require("apollo-server")
const { Class } = require("../models/class")
const { createWriteStream } = require("fs")
const util = require("util")
const exec = util.promisify(require("child_process").exec)

const queries = gql`
  type Query {
    classes: [Class]
  }
`
const mutations = gql`
  type FindResponse {
    found: Boolean!
    class: Class
    score: Float
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
      const { createReadStream, filename, mimetype } = await file
      const stream = createReadStream()
      const path = `images/last.jpg`
      await new Promise((resolve, reject) =>
        stream
          .pipe(createWriteStream(path))
          .on("finish", resolve)
          .on("error", reject)
      )
      const curpath = process.cwd()
      const { stdout } = await exec(
        `cd ${process.env.PYTHON_PATH} && python3 predict.py --input ${curpath}/images/last.jpg --save-crop ${curpath}/images/crop.jpg`
      )
      if (stdout === "not_found") {
        return { found: false }
      } else {
        const [className, score] = stdout.split(" ")
        console.log(className)
        return { found: true, score }
      }
    },
  },
}

module.exports = { queries, mutations, resolvers }
