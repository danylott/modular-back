//AWS
require('dotenv').config();

const AWS = require('aws-sdk');
AWS.config.region = "us-east-1";
const rekognition = new AWS.Rekognition({region: "us-east-1"});
const a = 322;

module.exports = {
    modelRecognition: function (detectedWord) {
        //matching on two word or colon, only mark has colon on this pic
        if (detectedWord.toLowerCase().includes("msrca") || detectedWord.toLowerCase().includes("macs") || detectedWord.toLowerCase().includes(":")) {
            detectedWord = detectedWord.split(":");
            if (detectedWord[1].includes("1)")) {
                detectedWord[1] = detectedWord[1].replace("1)", "");
            }

            if (detectedWord[1].includes("0)")) {
                detectedWord[1] = detectedWord[1].replace("0)", "");
            }
            return detectedWord[1].trim();
        }
    },

    brandRecognition: function (detectedWord) {
        if (detectedWord.toLowerCase().includes("krack")) {
            return detectedWord;
        }
    },

    colorRecognition: function (detectedWord) {
        if (detectedWord.toLowerCase() === "negro") {
            return detectedWord;
        }
    },

    sizeRecognition: function (detectedWord) {
        if (/^\s*([234][0-9])\s*$/.test(detectedWord)) {
            return detectedWord;
        }
    },

    //get text from image and recognize it, return if we have match
    awsApiRecognition: function (bitmap) {
        const awsRecognitionData = {};

        return new Promise((resolve, reject) => {
            rekognition.detectText({"Image": {"Bytes": bitmap,}}, (err, data) => {

                if (!err) {
                    for (let words of data.TextDetections) {
                        awsRecognitionData.color = awsRecognitionData.color ? awsRecognitionData.color : module.exports.colorRecognition(words.DetectedText)
                        awsRecognitionData.model = awsRecognitionData.model ? awsRecognitionData.model : module.exports.modelRecognition(words.DetectedText)
                        awsRecognitionData.size = awsRecognitionData.size ? awsRecognitionData.size : module.exports.sizeRecognition(words.DetectedText)
                        awsRecognitionData.brand = awsRecognitionData.brand ? awsRecognitionData.brand : module.exports.brandRecognition(words.DetectedText)
                    }


                    resolve(awsRecognitionData)
                }

                reject()
            });
        })

    }
};

