// 'use-script'
import * as vscode from 'vscode'
import debug from '@/utils/debug'
import RegisterCommands from '@/commands'
import RegisterViews from '@/views'
import luoguStatusBar from '@/views/luoguStatusBar'
import { UserStatus } from '@/utils/shared'
import { setClientID, setUID, fetchHomepage } from '@/utils/api'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
const luoguCsrfToken = 'CsrfToken.json'
const luoguJSONName = 'luogu.json'
const luoguUIDName = 'uid.json'
const version = '4.5.11'
export let resourcesPath = { value: '' }

exports.luoguPath = path.join(os.homedir(), '.luogu')
exports.luoguJSONPath = path.join(exports.luoguPath, luoguJSONName)
exports.luoguCsrfTokenPath = path.join(exports.luoguPath, luoguCsrfToken)
exports.luoguUidPath = path.join(exports.luoguPath, luoguUIDName)
exports.islogged = false
exports.init = false
exports.pid = ''
exports.luoguProblemPath = path.join(os.homedir(), '.luoguProblems')

export async function activate (context: vscode.ExtensionContext): Promise<void> {
  debug('initializing luogu-vscode.')
  RegisterCommands(context)
  RegisterViews(context)
  console.log('init luogu-vscode success.')
  exports.rootPath = context.extensionPath
  resourcesPath.value = path.join(exports.rootPath, 'resources')
  const versionPath = path.join(exports.luoguPath, 'version')
  if (!fs.existsSync(exports.luoguPath)) {
    try {
      fs.mkdirSync(exports.luoguPath)
    } catch (err) {
      vscode.window.showErrorMessage('创建 .luogu 目录失败')
      throw err
    }
  }
  let clientID = ''
  let uid = ''
  let updated = true
  if (fs.existsSync(exports.luoguCsrfTokenPath)) {
    clientID = fs.readFileSync(exports.luoguCsrfTokenPath).toString()
    fs.unlinkSync(exports.luoguCsrfTokenPath)
    updated = false
  }
  if (fs.existsSync(exports.luoguUidPath)) {
    uid = fs.readFileSync(exports.luoguUidPath).toString()
    fs.unlinkSync(exports.luoguUidPath)
    updated = false
  }
  if (!updated) {
    fs.writeFileSync(exports.luoguJSONPath, JSON.stringify({ 'uid': uid, 'clientID': clientID }))
  }
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>vscode-luogu v${version} 更新说明</title>
  </head>
  <div>
    <h1>置顶说明</h1>
    <h2>
    <ul>
    <li>用户跤流群(QQ)： 1141066631</li>
    <li>由于 vscode 的扩展不支持用一个版本号重复发布，所以如果在刚发布后就发现问题可能会以发布 .vsix 的形式在群中更新。所以建议添加群。</li>
    <li>以及，在群里直接反馈 bug 效率会较在 github 上发布 issue 效率更高。</li>
    </ul>
    </h2>
    <h1>本次更新</h1>
    <h2>
    <ul>
    <ol>
    <li>添加了显示冬日绘板的功能。</li>
    </ol>
    </ul>
    </h2>
    <h2>为了能在冬日绘板上抢到一块地方维护vscode-luogu的宣传图标（还在制作中，可以洛谷私信/qq私聊引领天下了解详细信息），现向所有vscode-luogu用户征集token。由于我们沿袭去年传统，今年仍和 犇犇犇犇 合作，所以token请提交至https://www.luogu.com.cn/blog/12cow/paintBoard，并注明来源：vscode-luogu。如果您觉得vscode-luogu的体验还彳亍，确实为您在一定程度上提高了做题效率，还请提供一些token帮助我们宣传。</h2>
    <h2>您的支持是我们开发的最大动力。</h2>
  </div>
  </html>
  `
  if (fs.existsSync(versionPath)) {
    if (fs.readFileSync(versionPath).toString() !== version) {
      const panel = vscode.window.createWebviewPanel('更新说明', 'vscode-luogu v' + version + ' 更新说明', vscode.ViewColumn.Two, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(exports.resourcesPath.value)]
      })
      panel.webview.html = html
    }
  } else {
    const panel = vscode.window.createWebviewPanel('更新说明', 'vscode-luogu' + version + ' 更新说明', vscode.ViewColumn.Two, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(exports.resourcesPath.value)]
    })
    panel.webview.html = html
  }
  fs.writeFileSync(versionPath, version)
  if (fs.existsSync(exports.luoguJSONPath)) {
    try {
      const jsonData = JSON.parse(fs.readFileSync(exports.luoguJSONPath).toString())
      const clientID = jsonData.clientID
      const uid = jsonData.uid
      await setClientID(clientID)
      await setUID(uid)
      try {
        const data = await fetchHomepage();
        if (data.currentUser === undefined) {
          vscode.window.showErrorMessage('未登录')
          luoguStatusBar.updateStatusBar(UserStatus.SignedOut)
          exports.islogged = false
        } else {
          vscode.window.showInformationMessage('登录成功')
          luoguStatusBar.updateStatusBar(UserStatus.SignedIn)
          exports.islogged = true
        }
      } catch (err) {
        vscode.window.showErrorMessage('获取登录信息失败')
        vscode.window.showErrorMessage(`${err}`)
        // vscode.window.showErrorMessage('未登录')
        luoguStatusBar.updateStatusBar(UserStatus.SignedOut)
        exports.islogged = false
      }
    } catch (err) {
      console.error(err)
      vscode.window.showInformationMessage('未登录')
      luoguStatusBar.updateStatusBar(UserStatus.SignedOut)
      exports.islogged = false
    }
  } else {
    vscode.window.showInformationMessage('未登录')
    luoguStatusBar.updateStatusBar(UserStatus.SignedOut)
    exports.islogged = false
  }
  exports.init = true
  console.log(exports.rootPath)
  if (!fs.existsSync(exports.luoguProblemPath)) {
    try {
      fs.mkdirSync(exports.luoguProblemPath)
    } catch (err) {
      vscode.window.showErrorMessage('创建题目保存路径失败')
      vscode.window.showErrorMessage(`${err}`)
      console.error(err)
      return
    }
  }
  const effectiveDuration = +vscode.workspace.getConfiguration('luogu').get<'integer'>('effectiveDuration')!
  if (effectiveDuration !== -1) {
    let files = fs.readdirSync(exports.luoguProblemPath);
    console.log(files)
    files.forEach(function (item: any) {
      const html = fs.readFileSync(exports.luoguProblemPath + '\\' + item).toString()
      const savetime = +html.match(/<!-- SaveTime:(.*) -->/)![1]
      console.log(savetime)
      if ((+new Date() - savetime) / 1000 / 60 / 60 / 24 > effectiveDuration) {
        const pid = html.match(/<!-- ProblemName:(.*) -->/)![1]
        try {
          fs.unlinkSync(exports.luoguProblemPath + '\\' + item)
          vscode.window.showInformationMessage(`删除过期题目：${pid} 成功`)
          debug(`Delete expired problem exists in ${exports.luoguProblemPath + '\\' + item} successfully.`)
        } catch (err) {
          vscode.window.showErrorMessage('删除过期题目失败')
          vscode.window.showErrorMessage(`${err}`)
          console.log(err)
        }
      }
    })
  }
  /*if (fs.existsSync(exports.luoguJSONPath)) {

  }*/
}

export function deactivate (): void {
  // Do nothing.
}