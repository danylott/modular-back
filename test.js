const util = require("util")
const exec = util.promisify(require("child_process").exec)

async function test() {
  const { stdout, stderr } = await exec(
    "cd /Users/pianist/development/krack-python/ && python3 predict.py --input /Users/pianist/development/krack-back-end/images/last.jpg"
  )
  console.log("stdout:", stdout)
  console.log("stderr:", stderr)
}

test()
