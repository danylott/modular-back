require('dotenv').config();
const axios = require('axios');
const { deleteImageFromStorage, deleteFileFromStorage } = require('./image');
const { Image } = require('../models/image');
const { Class } = require('../models/class');

const createClassMarkup = async (input, markup) => {
  const start = new Date();
  const curpath = process.cwd();
  const output = `${input.slice(0, -4)}marked.png`;

  const { data } = await axios.post(`${process.env.PYTHON_API}markup/`, {
    input: `${curpath}/images/${input}`,
    output: `${curpath}/images/${output}`,
    markup,
  });

  console.info('markup returns: %dms', new Date() - start);

  if (!data.success) {
    console.log(data.message);
    return { success: false };
  }

  return { success: true, output };
};

const deleteClassById = async (id) => {
  const cls = await Class.findOne({ _id: id });
  const images = await Image.find({ cls: id });
  images.forEach((image) => {
    deleteImageFromStorage(image);
  });
  deleteFileFromStorage(cls.image_markup_path);
  await Image.deleteMany({ cls: id });
  await Class.deleteOne({ _id: id });
};

module.exports = { createClassMarkup, deleteClassById };
