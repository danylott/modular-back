require('dotenv').config();
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

  if (!data.annotation) {
    console.log(data.message);
    return { success: false };
  }

  return { success: true, annotation: data.annotation, output };
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

module.exports = { labelImage, cropSticker };
