require('dotenv').config();
const axios = require('axios');

const startTrainingClasses = async (classes) => {
  const start = new Date();
  const curpath = process.cwd();

  const { data } = await axios.post(`${process.env.PYTHON_API}train/`, {
    save_config: `${curpath}/models/config.py`,
    save_model: `${curpath}/models/model.pth`,
    classes,
  });

  console.info('recognition returns: %dms', new Date() - start);

    const { exec } = require('child_process');
    console.info('restart flask-api');
    exec(process.env.TERMINAL_COMMAND_TO_RESTART_PYTHON_API, (err, stdout, stderr) => {
        if (err) {
            сonsole.error(err)
            return {success: false}
        } else {
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        }
        });

    if (!data) {
        return {success: false}
    } else {
        return {success: true}
    }
}

module.exports = { startTrainingClasses };
