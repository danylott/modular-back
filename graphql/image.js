require('dotenv').config();
const { createWriteStream } = require('fs');
const { AuthenticationError } = require('apollo-server');

const { Class } = require('../models/class');
const { Image } = require('../models/image');

const { labelImage, cropSticker } = require('../helpers/image');

const types = `
  type Image {
    _id: String
    path: String!
    path_labeled: String
    path_cropped: String
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
    createSticker(id: String!): Image!
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
    // eslint-disable-next-line
    createImage: async (parent, { file, cls_id }, { me }, info) => {
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
      // eslint-disable-next-line camelcase
      const image = await Image.create({ path, cls: cls_id });
      return image;
    },
    // eslint-disable-next-line no-unused-vars
    createAnnotation: async (parent, { id, annotation }, { me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }

      const image = await Image.findOne({ _id: id });
      if (!image) {
        return null;
      }
      const data = await labelImage(image.path, annotation);
      if (!data.success) {
        console.log('ERROR WHILE LABELING IMAGE');
        return image;
      }
      image.annotation = data.annotation;
      image.path_labeled = data.output;
      image.status = 'confirmed';
      image.save();
      // console.log('Image: ', image);
      return image;
    },
    // eslint-disable-next-line no-unused-vars
    createSticker: async (parent, { id }, { me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }

      const image = await Image.findOne({ _id: id });
      if (!image || !image.annotation) {
        return null;
      }

      const data = await cropSticker(image.path, image.annotation);
      if (!data.success) {
        console.log('ERROR WHILE CROPPING IMAGE');
        return image;
      }
      image.path_cropped = data.output;
      image.save();
      // TODO - change status of class - to HAS TEXT MARKUP
      console.log('Image class: ', image.cls);
      return image;
    },
  },
  Image: {
    // eslint-disable-next-line no-unused-vars
    cls: async ({ cls }, args, _, info) => {
      const classObject = await Class.findOne({ _id: cls }).exec();
      return classObject;
    },
  },
};

module.exports = { types, queries, mutations, resolvers };
