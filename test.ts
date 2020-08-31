import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
const luoguCsrfToken = 'CsrfToken.json'
const luoguJSONName = 'luogu.json'
const luoguUIDName = 'uid.json'
exports.luoguPath = path.join(os.homedir(), '.luogu')
exports.luoguJSONPath = path.join(exports.luoguPath, luoguJSONName)
exports.luoguCsrfTokenPath = path.join(exports.luoguPath, luoguCsrfToken)
exports.luoguUidPath = path.join(exports.luoguPath, luoguUIDName)
exports.islogged = false
exports.init = false
exports.pid = ''
exports.luoguProblemPath = path.join(os.homedir(), '.luoguProblems')
if (!fs.existsSync(exports.luoguProblemPath)) {
  try {
    fs.mkdirSync(exports.luoguProblemPath)
  } catch (err) {
    console.error(err)
  }
}
let files = fs.readdirSync(exports.luoguProblemPath);
console.log(files)
const effectiveDuration = 3
files.forEach(function (item: any) {
  const html = fs.readFileSync(exports.luoguProblemPath + '\\' + item).toString()
  const savetime = +html.match(/<!-- SaveTime:(.*) -->/)![1]
  console.log(savetime)
  console.log((+new Date() - savetime) / 1000 / 60 / 60 / 24)
  console.log(exports.luoguProblemPath + '\\' + item)
  /*if ((+new Date() - savetime) / 1000 / 60 / 60 / 24 > effectiveDuration) {
    const pid = item.match(/(*.).html/)
    try {
      fs.unlinkSync(exports.luoguProblemPath + '\\' + item)
    } catch (err) {
      console.log(err)
    }
  }*/
  const pid = html.match(/<!-- ProblemName:(.*) -->/)![1]
  console.log(pid)
})
// const date = +new Date('2020/8/31 17:00.000')
// console.log((+new Date() - date) / 1000 / 60)
