require("dotenv").config()

const util = require("util")
const exec = util.promisify(require("child_process").exec)

async function test() {
  const curpath = process.cwd()
  const { stdout } = await exec(
    `cd ${process.env.PYTHON_PATH} && python3 predict.py --input ${curpath}/images/last.jpg --save-crop ${curpath}/images/crop.jpg`
  )
  if (stdout === "not_found") {
  } else {
    const [className, score] = stdout.split(" ")
    console.log(className)
  }
}

test()
