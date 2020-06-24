const { gql } = require("apollo-server")
const { Class } = require("../models/class")
const { createWriteStream } = require("fs")
const util = require("util")
const exec = util.promisify(require("child_process").exec)
const { cropImageByCoordinates } = require("../helpers/imageCropHelper")
const { rekognitionDetectText, textFromMap } = require("../helpers/recognize")
const Jimp = require("jimp")

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
    updateClass(name: String, make: String, status: String, markup: [ClassMarkupInput]): Class
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
      const path = `images/demo.jpg`
      await new Promise((resolve, reject) =>
        stream.pipe(createWriteStream(path)).on("finish", resolve).on("error", reject)
      )
      const curpath = process.cwd()
      const { stdout } = await exec(
        `cd ${process.env.PYTHON_PATH} && python3 predict.py --input ${curpath}/images/demo.jpg --save-crop ${curpath}/images/crop.jpg`
      )
      if (stdout.includes("not_found")) {
        console.error("sticker not found")
        return { found: false }
      }

      const [className, score] = stdout.split(" ")
      console.log("found sticker: ", className)
      const clss = await Class.findOne({ name: className })

      let crop = await Jimp.read("./images/crop.jpg")
      if (!clss) {
        console.error("class not in DB")
        crop.write("./images/marked.jpg")
        return { found: true, score, model: className }
      }
      const fieldResults = {}
      for (const field of clss.markup) {
        let buffer = await cropImageByCoordinates(field, crop, "./images/crop.jpg")
        const map = await rekognitionDetectText(buffer)
        const text = textFromMap(map, field.field)
        fieldResults[field.field.toLowerCase()] = text
      }
      crop.write("./images/marked.jpg")
      console.log(fieldResults)
      return { found: true, score, class: clss, ...fieldResults }
    },
  },
}

module.exports = { queries, mutations, resolvers }
