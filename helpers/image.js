require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

const labelImage = async (input, annotation) => {
  const start = new Date();
  const curpath = process.cwd();
  const output = `${input.slice(0, -4)}labeled.png`;

  const { data } = await axios.post(`${process.env.PYTHON_API}label/`, {
    input: `${curpath}/images/${input}`,
    output: `${curpath}/images/${output}`,
    annotation,
  });

  console.info('labeling returns: %dms', new Date() - start);

  if (!data.annotation || !data.width || !data.height) {
    console.log(data.message);
    return { success: false };
  }

  return {
    success: true,
    width: data.width,
    height: data.height,
    annotation: data.annotation,
    output,
  };
};

const cropSticker = async (input, annotation) => {
  const start = new Date();
  const curpath = process.cwd();
  const output = `${input.slice(0, -4)}cropped.png`;

  const { data } = await axios.post(`${process.env.PYTHON_API}crop/`, {
    input: `${curpath}/images/${input}`,
    output: `${curpath}/images/${output}`,
    annotation,
  });

  console.info('cropping returns: %dms', new Date() - start);

  if (!data.output) {
    console.log(data.message);
    return { success: false };
  }

  return { success: true, output };
};

const deleteFileFromStorage = async (path) => {
  const curpath = process.cwd();
  const fullPath = `${curpath}/images/${path}`;
  if (path) {
    fs.access(fullPath, fs.F_OK, (err) => {
      if (err) {
        console.error(err);
        return;
      }

      fs.unlink(fullPath, (e) => {
        console.error(e);
      });
    });
  }
};

module.exports = { labelImage, cropSticker, deleteFileFromStorage };
