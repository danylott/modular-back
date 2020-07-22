require('dotenv').config();
const AWS = require('aws-sdk');
const Jimp = require('jimp');
const axios = require('axios');
const { cropImageByCoordinates } = require('./imageCropHelper');
const { Class } = require('../models/class');

AWS.config.region = 'us-east-1';
const rekognition = new AWS.Rekognition({ region: 'us-east-1' });

const recognitionDetectText = (bitmap) => {
  return new Promise((resolve, reject) => {
    // console.log("sent")
    rekognition.detectText({ Image: { Bytes: bitmap } }, (err, data) => {
      if (!err) {
        resolve(data.TextDetections);
      } else {
        console.error('AWS recognition error:', err);
        reject();
      }
    });
  });
};

const textFromMap = (map, field) => {
  if (map.length < 1) return '';

  if (field === 'Size') {
    // const allTexts = map.reduce((accum, { Type, DetectedText }) => accum + DetectedText, "")
    // console.log(allTexts)
    return map.find((el) => el.Type === 'WORD').DetectedText.replace(/\D/g, '');
  }
  // const line = map.find((el) => el.Type == "WORD").DetectedText
  const line = map[0].DetectedText;
  return line.trim();
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
    console.error(clss ? 'markup is not defined for class' : 'class not in DB');
    crop.write('./images/marked.jpg');
    return { found: true, score, model: className };
  }

  const fieldResults = {};
  for (const field of clss.markup) {
    const buffer = await cropImageByCoordinates(
      field,
      crop,
      './images/crop.jpg'
    );
    const map = await recognitionDetectText(buffer);
    const text = textFromMap(map, field.field);
    fieldResults[field.field.toLowerCase()] = text;
    console.info(
      `get text from API for ${field.field}: %dms`,
      new Date() - start
    );
  }
  crop.write('./images/marked.jpg');
  console.log(fieldResults);
  return { found: true, score, class: clss, ...fieldResults };
};

module.exports = { processImage };
