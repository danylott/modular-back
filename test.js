require("dotenv").config()
const Jimp = require("jimp")
const { Class } = require("./models/class")
const { cropImageByCoordinates } = require("./helpers/imageCropHelper")
const { rekognitionDetectText, textFromMap } = require("./helpers/recognize")
const util = require("util")
const exec = util.promisify(require("child_process").exec)
const mongoose = require("mongoose")

async function test2() {
  await mongoose.connect(`mongodb://localhost:27017/${process.env.MONGO_DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  const clss = await Class.findOne({ name: "newbalance" })
  let crop = await Jimp.read("./images/crop.jpg")
  const fieldResults = {}
  for (const field of clss.markup) {
    let buffer = await cropImageByCoordinates(field, crop, "./images/crop.jpg")
    const map = await rekognitionDetectText(buffer)
    console.log(field.field, map)
    const text = textFromMap(map, field.field)
    fieldResults[field.field.toLowerCase()] = text
  }
  console.log(fieldResults)
  crop.write("./images/marked.jpg")

  mongoose.connection.close()

  //var start = new Date()
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
  //   await rekognitionDetectText(textResults[0].bitmap),
  //   await rekognitionDetectText(textResults[1].bitmap),
  //   await rekognitionDetectText(textResults[2].bitmap),
  // ]).then((maps) => {
  //   for (let map of maps) {
  //     //textFromCroppedImage.push(index)
  //   }
  // })
  // var end = new Date() - start
  // console.info("Execution time: %dms", end)
}

async function test() {
  const curpath = process.cwd()
  const { stdout } = await exec(
    `cd ${process.env.PYTHON_PATH} && python3 predict.py --input ${curpath}/images/last.jpg --save-crop ${curpath}/images/crop.jpg`
  )
  if (stdout === "not_found") {
  } else {
    const [className, score] = stdout.split(" ")
    console.log(className)
  }
}

test2()
