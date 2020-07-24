require('dotenv').config();
const Jimp = require('jimp');
const axios = require('axios');
const { cropImageByCoordinates } = require('./imageCropHelper');
const { Class } = require('../models/class');

const processImage = async ({ filterClasses }) => {
  const start = new Date();
  const curpath = process.cwd();

  console.info('sent data to Python API');
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

  const fieldResults = {};
  let index = 0;
  for (const field of clss.markup) {
    const path = await cropImageByCoordinates(
      field,
      crop,
      './images/crop.jpg',
      index
    );
    index += 1;

    const { data: rekognizedData } = await axios.post(
      `${process.env.PYTHON_API}rekognize-text/`,
      {
        input: `${curpath}/images/${path}`,
      }
    );
    console.log(
      `get result from python recognition for ${field.field}: `,
      rekognizedData
    );
    //   const map = await recognitionDetectText(buffer);
    //   const text = textFromMap(map, field.field);
    console.log('data.text', rekognizedData.text);
    fieldResults[field.field.toLowerCase()] = rekognizedData.text;
  }
  await crop.writeAsync('./images/marked.jpg');
  // console.log(fieldResults);
  return { found: true, score, class: clss, ...fieldResults };
};

module.exports = { processImage };
