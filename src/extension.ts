// 'use-script'
import * as vscode from 'vscode'
import debug from '@/utils/debug'
import RegisterCommands from '@/commands'
import RegisterViews from '@/views'
import luoguStatusBar from '@/views/luoguStatusBar'
import { UserStatus } from '@/utils/shared'
import * as files from '@/utils/files'
import { fetchHomepage, genCookies } from '@/utils/api'
import path from 'path'
const version = '4.8.1'

globalThis.islogged = false
globalThis.init = false
globalThis.pid = ''

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  debug('initializing luogu-vscode.')
  RegisterCommands(context)
  RegisterViews(context)
  console.log('init luogu-vscode success.')
  files.initFiles(context.extensionPath);
  let clientID = ''
  let uid = ''
  let updated = true
  {
    let tmp = files.initFiles(context.extensionPath);
    if (tmp !== null) {
      vscode.window.showInformationMessage(tmp[0]);
      throw tmp[1];
    }
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
            <li>修复初次启动时配置文件创建失败错误</li>
            <li>部分更新UI，更改了渲染LaTeX的库</li>
        </ol>
    </ul>
    </h2>
  </div>
  </html>
  `
  if (files.configFile.version !== version) {
    const panel = vscode.window.createWebviewPanel('更新说明', 'vscode-luogu v' + version + ' 更新说明', vscode.ViewColumn.Two, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(globalThis.resourcesPath), vscode.Uri.file(globalThis.distPath)]
    })
    panel.webview.html = html
    files.setVersion(version);
  }
  try {
    try {
      const data = await fetchHomepage();
      if (data.currentUser === undefined) {
        vscode.window.showErrorMessage('未登录')
        luoguStatusBar.updateStatusBar(UserStatus.SignedOut)
        globalThis.islogged = false
      } else {
        vscode.window.showInformationMessage('登录成功')
        luoguStatusBar.updateStatusBar(UserStatus.SignedIn)
        globalThis.islogged = true
      }
    } catch (err) {
      vscode.window.showErrorMessage('获取登录信息失败')
      vscode.window.showErrorMessage(`${err}`)
      // vscode.window.showErrorMessage('未登录')
      luoguStatusBar.updateStatusBar(UserStatus.SignedOut)
      globalThis.islogged = false
    }
  } catch (err) {
    console.error(err)
    vscode.window.showInformationMessage('未登录')
    luoguStatusBar.updateStatusBar(UserStatus.SignedOut)
    globalThis.islogged = false
  }
  if (!globalThis.islogged) genCookies();
  globalThis.init = true
  const effectiveDuration = +vscode.workspace.getConfiguration('luogu').get<'integer'>('effectiveDuration')!
  if (effectiveDuration !== -1) {
    files.configFile.savedProblem.forEach(function (item) {
      const html = files.getSavedProblem(item);
      const savetime = +html.match(/<!-- SaveTime:(.*) -->/)![1]
      if ((+new Date() - savetime) / 1000 / 60 / 60 / 24 > effectiveDuration)
        try {
          files.removeSavedProblem(item);
          vscode.window.showInformationMessage(`删除过期题目：${item} 成功`)
          debug(`Delete expired problem exists in ${globalThis.luoguPath + '\\' + item} successfully.`)
        } catch (err) {
          vscode.window.showErrorMessage('删除过期题目失败')
          throw err;
        }
    })
  }
}

export function deactivate(): void { }
