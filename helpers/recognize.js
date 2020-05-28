//AWS
require('dotenv').config();
const AWS = require('aws-sdk');
AWS.config.region = "us-east-1";
const rekognition = new AWS.Rekognition({region: "us-east-1"});
const {COLORS} = require('./constants');

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = {
    modelRecognition: function (detectedWord) {

        for (let index of detectedWord) {
            if (index.Type === 'LINE') {
                index.DetectedText = index.DetectedText.replace("NIKE", "").trim();
                return index.DetectedText;
            }
        }
    },

    brandRecognition: function (detectedWord) {

    },

    colorRecognition: function (detectedWord) {
        for (let index of detectedWord) {
            if (index.Type === 'LINE') {
                if (COLORS.includes(index.DetectedText.toLowerCase())) {
                    return index.DetectedText;
                }

            }
        }
    },

    sizeRecognition: function (detectedWord) {
        for (let index of detectedWord) {
            if (index.DetectedText.toLowerCase().startsWith('eur')) {
                index.DetectedText = index.DetectedText.replace("R", "R ");
                return index.DetectedText;
            }
        }

    },

    //recognize text on given photo/image, might be some random photo also, remember
    awsApiRecognition: function (bitmap) {
        const awsRecognitionData = {};

        return new Promise((resolve, reject) => {
            rekognition.detectText({"Image": {"Bytes": bitmap,}}, (err, data) => {

                if (!err) {
                    // for (let words of data.TextDetections) {
                    //     awsRecognitionData.color = awsRecognitionData.color ? awsRecognitionData.color : module.exports.colorRecognition(words.DetectedText)
                    //     awsRecognitionData.model = awsRecognitionData.model ? awsRecognitionData.model : module.exports.modelRecognition(words.DetectedText)
                    //     awsRecognitionData.size = awsRecognitionData.size ? awsRecognitionData.size : module.exports.sizeRecognition(words.DetectedText)
                    //     awsRecognitionData.brand = awsRecognitionData.brand ? awsRecognitionData.brand : module.exports.brandRecognition(words.DetectedText)
                    // }
                    resolve(data.TextDetections)
                }
                console.log("AWS IF ERROR", err);
                reject()
            });
        })

    }
};

