require('dotenv').config();
const { createWriteStream } = require('fs');
const { AuthenticationError } = require('apollo-server');

const { Class } = require('../models/class');
const { Image } = require('../models/image');

const types = `
  type Image {
    _id: String
    path: String!
    status: String!
    annotation: [Float]
    cls: Class!
  }
`;
const queries = `
    images: [Image!]!
`;

const mutations = `
    createImage(file: Upload!, cls_id: String!): Image!
    createAnnotation(id: String!, annotation: [Float]!): Image!
`;

const resolvers = {
  Query: {
    // eslint-disable-next-line no-unused-vars
    images: async (parent, args, { me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const images = await Image.find().exec();
      return images;
    },
  },
  Mutation: {
    // eslint-disable-next-line no-unused-vars
    createImage: async (parent, { file, clsId }, { me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }

      const { createReadStream } = await file;
      const stream = createReadStream();
      const path = `classes/image${+new Date()}.jpg`;
      await new Promise((resolve, reject) =>
        stream
          .pipe(createWriteStream(`images/${path}`))
          .on('finish', resolve)
          .on('error', reject)
      );

      const image = await Image.create({ path, cls: clsId });
      return image;
    },
    // eslint-disable-next-line no-unused-vars
    createAnnotation: async (parent, { id, annotation }, { me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }

      console.log(id);
      const image = await Image.findOne({ _id: id });
      image.annotation = annotation;
      image.status = 'confirmed';
      image.save();
      return image;
    },
  },
  Image: {
    // eslint-disable-next-line no-unused-vars
    cls: async ({ cls }, args, _, info) => {
      console.log(cls);
      const classObject = await Class.findOne({ _id: cls }).exec();
      console.log(classObject);
      return classObject;
    },
  },
};

module.exports = { types, queries, mutations, resolvers };
