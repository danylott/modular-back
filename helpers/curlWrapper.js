const request = require("request");
const {apiUrlForBarCode} = require('./constants');

module.exports = {

    curlGetByBarCode: async function (barCode) {

        return new Promise((resolve, reject) => {
            request.get(`${apiUrlForBarCode}${barCode}`, (err, response, body) => {
                if (!err && response.statusCode === 200) {
                    resolve(JSON.parse(body));
                }
                reject(err);
            });
        });
    }

};