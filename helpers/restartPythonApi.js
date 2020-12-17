const { exec } = require('child_process');

async function restartPythonApi() {
  console.info('restart flask-api');
  exec(
    process.env.TERMINAL_COMMAND_TO_RESTART_PYTHON_API,
    (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return false;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      return true;
    }
  );
}

module.exports = { restartPythonApi };
