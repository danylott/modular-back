const request = require("request");
const {apiUrlForBarCode, apiUrlPostWithBody} = require('./constants');

module.exports = {

    //get request by bar code
    curlGetByBarCode: async function (barCode) {

        return new Promise((resolve, reject) => {
            request.get(`${apiUrlForBarCode}${barCode}`, (err, response, body) => {
                if (!err && response.statusCode === 200) {
                    resolve(JSON.parse(body));
                }
                reject(err);
            });
        });
    },

    //example of post request {"model":"ETEL","brand":"KRACK","color":"NEGRO","size":"36"}
    curlPostWithParams: async function (data) {

        return new Promise((resolve, reject) => {
            request.post({
                url: `${apiUrlPostWithBody}`,
                form: {model: data.model, brand: data.brand, color: data.color, size: data.size}
            }, (err, response, body) => {
                if (!err && response.statusCode === 200) {
                    resolve(JSON.parse(body));
                } else if (!err && response.statusCode === 404) {
                    resolve(JSON.parse(body));
                }
                reject(err);
            });
        });
    },

};