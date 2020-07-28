require('dotenv').config();
const Jimp = require('jimp');
const axios = require('axios');
const { cropImageByCoordinates } = require('./imageCropHelper');
const { Class } = require('../models/class');

const cropStickerFromImage = async ({ filterClasses }) => {
  const start = new Date();
  const curpath = process.cwd();

  const { data } = await axios.post(process.env.PYTHON_API, {
    input: `${curpath}/images/input.jpg`,
    save_crop: `${curpath}/images/crop.jpg`,
    filter_classes: filterClasses,
  });

  console.info('recognition returns: %dms', new Date() - start);

  if (!data.found) {
    console.log(data.message);
    return { success: false };
  }

  const { className, score } = data;
  console.log('found sticker: ', className);
  return { success: true };
};

const processImage = async ({ filterClasses }) => {
  const start = new Date();
  const curpath = process.cwd();

  const { data } = await axios.post(process.env.PYTHON_API, {
    input: `${curpath}/images/input.jpg`,
    save_crop: `${curpath}/images/crop.jpg`,
    filter_classes: filterClasses,
  });

  console.info('recognition returns: %dms', new Date() - start);

  if (!data.found) {
    console.log(data.message);
    return { found: false };
  }

  const { className, score } = data;
  console.log('found sticker: ', className);
  const clss = await Class.findOne({ name: className });

  const crop = await Jimp.read('./images/crop.jpg');
  if (!clss || !clss.markup) {
    console.info(clss ? 'markup is not defined for class' : 'class not in DB');
    await crop.writeAsync('./images/marked.jpg');
    return { found: true, score, model: className };
  }

  let index = 0;
  const fieldResults = {};
  for (const field of clss.markup) {
    const image_name = await cropImageByCoordinates(
      field,
      crop,
      './images/crop.jpg',
      index
    );

    const { data:rekognizeData } = await axios.post(`${process.env.PYTHON_API}rekognize-text/`, {
      input: `${curpath}/images/${image_name}`,
    });

    fieldResults[field.field.toLowerCase()] = rekognizeData.text;
    console.info(
      `get text from python API for ${field.field}: %dms`,
      new Date() - start
    );
  }
  await crop.writeAsync('./images/marked.jpg');
  console.log(fieldResults);
  return { found: true, score, class: clss, ...fieldResults };
};

module.exports = { processImage, cropStickerFromImage };
