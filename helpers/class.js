require('dotenv').config();
const axios = require('axios');

const createClassMarkup = async (input, markup) => {
  const start = new Date();
  const curpath = process.cwd();
  const output = `${input.slice(0, -4)}marked.png`;

  const { data } = await axios.post(`${process.env.PYTHON_API}markup/`, {
    input: `${curpath}/images/${input}`,
    output: `${curpath}/images/${output}`,
    markup,
  });

  console.info('markup returns: %dms', new Date() - start);

  if (!data.success) {
    console.log(data.message);
    return { success: false };
  }

  return { success: true, output };
};

module.exports = { createClassMarkup };
