//AWS
require("dotenv").config()
const AWS = require("aws-sdk")
AWS.config.region = "us-east-1"
const rekognition = new AWS.Rekognition({ region: "us-east-1" })

module.exports = {
  //recognize text on given photo/image, might be some random photo also, remember
  rekognitionDetectText: function (bitmap) {
    return new Promise((resolve, reject) => {
      //console.log("sent")
      rekognition.detectText({ Image: { Bytes: bitmap } }, (err, data) => {
        if (!err) {
          resolve(data.TextDetections)
        } else {
          console.error("AWS recognition error:", err)
          reject()
        }
      })
    })
  },

  textFromMap: function (map, field) {
    if (map.length < 1) return ""

    if (field == "Size") {
      //const allTexts = map.reduce((accum, { Type, DetectedText }) => accum + DetectedText, "")
      //console.log(allTexts)
      return map.find((el) => el.Type == "WORD").DetectedText.replace(/\D/g, "")
    }
    // const line = map.find((el) => el.Type == "WORD").DetectedText
    const line = map[0].DetectedText
    return line.trim()
  },
}
