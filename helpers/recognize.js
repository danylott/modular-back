//AWS
require('dotenv').config();
const AWS = require('aws-sdk');
AWS.config.region = "us-east-1";
const rekognition = new AWS.Rekognition({region: "us-east-1"});
const {COLORS, BRANDS, MODELS} = require('./constants');

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = {
    modelRecognition: function (detectedWord) {
        for (let model of MODELS) {
            if (detectedWord.toLowerCase().includes(model)) {
                return model.capitalize();
            }
        }
    },

    brandRecognition: function (detectedWord) {
        for (let brand of BRANDS) {
            if (detectedWord.toLowerCase().includes(brand)) {
                return brand.capitalize();
            }
        }
    },

    colorRecognition: function (detectedWord) {
        for (let color of COLORS) {
            if (detectedWord.toLowerCase().includes(color)) {
                return color.capitalize();
            }
        }
    },

    sizeRecognition: function (detectedWord) {
        if (/^\s*([234][0-9])\s*$/.test(detectedWord)) {
            return detectedWord;
        }
    },

    //recognize text on given photo/image, might be some random photo also, remember
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
                console.log("AWS IF ERROR", err);
                reject()
            });
        })

    }
};

