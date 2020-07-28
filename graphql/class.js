const { createWriteStream } = require('fs');
const { processImage, cropStickerFromImage } = require('../helpers/recognize');
const { Class } = require('../models/class');

const types = `
  type CropResponse {
    success: Boolean!
  }

  type FindResponse {
    found: Boolean!
    class: Class
    score: Float
    color: String
    size: String
    model: String
  }

  type ClassMarkup {
    field: String
    x: Float
    y: Float
    w: Float
    h: Float
  }

  input ClassMarkupInput {
    field: String
    x: Float
    y: Float
    w: Float
    h: Float
  }
  
  type Class {
    _id: String
    name: String!
    make: String
    status: String
    markup: [ClassMarkup]
  }
`;
const queries = `
  classes: [Class]
`;

const mutations = `
  createClass(name: String, make: String): Class
  deleteClass(id: String): Boolean
  updateClass(
    name: String
    make: String
    status: String
    markup: [ClassMarkupInput]
  ): Class
  findOnImage(file: Upload!): FindResponse
  cropImage(file: Upload!): CropResponse
`;

const resolvers = {
  Query: {
    classes: () => {
      return Class.find();
    },
  },
  Mutation: {
    createClass: async (_, data) => {
      return Class.create(data);
    },
    deleteClass: async (_, data) => {
      await Class.findByIdAndDelete(data.id);
      return true;
    },
    updateClass: async (_, { name, make, status, markup }) => {
      const cl = await Class.findOne({ name });
      if (!cl) return null;

      if (make) cl.make = make;
      if (status) cl.status = status;
      if (markup) cl.markup = markup;
      return cl.save();
    },
    findOnImage: async (parent, { file }) => {
      const { createReadStream } = await file;
      const stream = createReadStream();
      const path = `images/input.jpg`;
      await new Promise((resolve, reject) =>
        stream
          .pipe(createWriteStream(path))
          .on('finish', resolve)
          .on('error', reject)
      );
      return processImage({ filterClasses: null });
    },
    cropImage: async (parent, { file }) => {
      console.log('cropImage');
      const { createReadStream } = await file;
      const stream = createReadStream();
      const path = `images/input.jpg`;
      await new Promise((resolve, reject) =>
        stream
          .pipe(createWriteStream(path))
          .on('finish', resolve)
          .on('error', reject)
      );
      return cropStickerFromImage({ filterClasses: null });
    },
  },
};

module.exports = { types, queries, mutations, resolvers };
