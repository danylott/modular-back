//AWS
require('dotenv').config();
const AWS = require('aws-sdk');
AWS.config.region = "us-east-1";
const rekognition = new AWS.Rekognition({region: "us-east-1"});

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = {
    modelRecognition: function (detectedWord) {
        let model = '';

        for (let index of detectedWord) {
            if (index.Type === 'LINE') {
                model = model.concat(index.DetectedText, ' ');
            }
        }

        return model.toLowerCase().replace(/nike/g, "").trim().toUpperCase();
    },

    colorRecognition: function (detectedWord) {
        let color = [];
        for (let index of detectedWord) {

            if (index.Type === 'LINE') {

                index.DetectedText = index.DetectedText.replace(/(^| ).( |$)/, '');

                color.push(index.DetectedText);
            }
        }

        if (color.length === 2){
            return color[1]
        } else {
            return color[0]
        }
    },

    sizeRecognition: function (detectedWord) {
        let size;
        for (let index of detectedWord) {
            size = (/\d+((.|,)\d+)?/.exec(index.DetectedText));

            if (size && size.input.toLowerCase().includes('eur')) {
                return size[0];
            }

            if (size && size[0] == size.input){
                return size[0];
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

