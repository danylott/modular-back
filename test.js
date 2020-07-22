require('dotenv').config();
const Jimp = require('jimp');
const mongoose = require('mongoose');
// const util = require('util');
// const exec = util.promisify(require('child_process').exec);

const { Class } = require('./models/class');
const { cropImageByCoordinates } = require('./helpers/imageCropHelper');
const { recognitionDetectText, textFromMap } = require('./helpers/recognize');

async function test2() {
  await mongoose.connect(`mongodb://localhost:27017/${process.env.MONGO_DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const clss = await Class.findOne({ name: 'newbalance' });
  const crop = await Jimp.read('./images/crop.jpg');
  const fieldResults = {};
  for (const field of clss.markup) {
    const buffer = await cropImageByCoordinates(
      field,
      crop,
      './images/crop.jpg'
    );
    const map = await recognitionDetectText(buffer);
    console.log(field.field, map);
    const text = textFromMap(map, field.field);
    fieldResults[field.field.toLowerCase()] = text;
  }
  console.log(fieldResults);
  crop.write('./images/marked.jpg');

  mongoose.connection.close();

  // var start = new Date()
  // const clss = await Class.findOne({ name: "mare" })
  // let textResults = []
  // for (const field of clss.markup) {
  //   const bitmap = await cropImageByCoordinates(field, "./images/crop.jpg")
  //   textResults.push({
  //     field: field.field,
  //     bitmap,
  //   })
  // }
  // await Promise.all([
  //   await recognitionDetectText(textResults[0].bitmap),
  //   await recognitionDetectText(textResults[1].bitmap),
  //   await recognitionDetectText(textResults[2].bitmap),
  // ]).then((maps) => {
  //   for (let map of maps) {
  //     //textFromCroppedImage.push(index)
  //   }
  // })
  // var end = new Date() - start
  // console.info("Execution time: %dms", end)
}

// async function test() {
//   const curpath = process.cwd();
//   const { stdout } = await exec(
//     `cd ${process.env.PYTHON_PATH} && python3 predict.py --input ${curpath}/images/last.jpg --save-crop ${curpath}/images/crop.jpg`
//   );
//   if (stdout === 'not_found') {
//   } else {
//     const [className, score] = stdout.split(' ');
//     console.log(className);
//   }
// }

test2();
