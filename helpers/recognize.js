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
            if (index.Type === 'LINE' && index.DetectedText.length > 2) {

                //for nike, nike models always has word {nike} in model
                if (index.DetectedText.toLowerCase().includes('nike')) {
                    index.DetectedText = index.DetectedText.replace("NIKE", "").trim();
                    return index.DetectedText;
                } else {
                    let model = (/\d+((.|,)\d+)?/.exec(index.DetectedText));
                    if (model){
                        return model[0]
                    }
                }

            }
        }
    },

    colorRecognition: function (detectedWord) {
        for (let index of detectedWord) {
            if (index.Type === 'LINE') {
                index.DetectedText = index.DetectedText.replace(/(^| ).( |$)/, '');
                if (COLORS.includes(index.DetectedText.toLowerCase())) {
                    return index.DetectedText;
                }

                //check for whitespace, example BLACK BLACK
                if (/\s/.test(index.DetectedText)) {
                    index.DetectedText = index.DetectedText.split(' ');
                    if (COLORS.includes(index.DetectedText[0].toLowerCase())) {
                        return index.DetectedText[0];
                    }
                }
            }
        }
    },

    sizeRecognition: function (detectedWord) {
        for (let index of detectedWord) {
            let size = (/\d+((.|,)\d+)?/.exec(index.DetectedText));

            if (size && size[0] > 30) {
                return size[0]
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

