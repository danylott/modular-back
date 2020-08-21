const { createWriteStream } = require('fs');
const { AuthenticationError } = require('apollo-server');
const { processImage, cropStickerFromImage } = require('../helpers/recognize');
const { startTrainingClasses } = require('../helpers/train');
const { Class } = require('../models/class');
const { User } = require('../models/user');
const { Image } = require('../models/image');

const types = `
  type SuccessResponse {
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
    author: User
    images: [Image]
  }
`;
const queries = `
  class(id: String): Class
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
  cropImage(file: Upload!): SuccessResponse
  trainClasses(classes: [String]!): SuccessResponse
`;

const resolvers = {
  Query: {
    // eslint-disable-next-line no-unused-vars
    class: async (parent, { id }, { me }, _) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const cls = await Class.findById({ _id: id }).exec();
      return cls;
    },
  },
  Mutation: {
    // eslint-disable-next-line no-unused-vars
    createClass: async (_, data, { me }) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      data.author = me.id;
      return Class.create(data);
    },
    // eslint-disable-next-line no-unused-vars
    deleteClass: async (_, data) => {
      await Class.findByIdAndDelete(data.id);
      return true;
    },
    // eslint-disable-next-line no-unused-vars
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
    trainClasses: async (_, { classes }) => {
      console.log('Train on: ', classes);
      return startTrainingClasses({ classes });
    },
  },
  Class: {
    // eslint-disable-next-line no-unused-vars
    author: async ({ author }, _, args, info) => {
      const user = await User.findOne({ _id: author }).exec();
      console.log(user);
      return user;
    },
    // eslint-disable-next-line no-unused-vars
    images: async ({ _id }, _, args, info) => {
      const images = await Image.find({ cls: _id }).exec();
      return images;
    },
  },
};

module.exports = { types, queries, mutations, resolvers };
