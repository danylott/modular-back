const request = require('request');

module.exports = {
  // get request by bar code
  async curlGetByBarCode(barCode) {
    return new Promise((resolve, reject) => {
      request.get(
        `${process.env.GET_API_URL}${barCode}`,
        (err, response, body) => {
          if (!err && response.statusCode === 200) {
            resolve(JSON.parse(body));
          } else if (!err && response.statusCode === 404) {
            resolve(JSON.parse(body));
          }
          reject(err);
        }
      );
    });
  },

  // example of post request {"model":"ETEL","brand":"KRACK","color":"NEGRO","size":"36"}
  async curlPostWithParams(data) {
    return new Promise((resolve, reject) => {
      request.post(
        {
          url: `${process.env.POST_API_URL}`,
          form: {
            model: data.model,
            brand: data.brand,
            color: data.color,
            size: data.size,
          },
        },
        (err, response, body) => {
          if (!err && response.statusCode === 200) {
            resolve(JSON.parse(body));
          } else if (!err && response.statusCode === 404) {
            resolve(JSON.parse(body));
          }
          reject(err);
        }
      );
    });
  },
};
