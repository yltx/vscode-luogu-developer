import * as vscode from 'vscode'
import debug from '@/utils/debug'

import RegisterCommands from '@/commands'
import RegisterViews from '@/views'
import luoguStatusBar from '@/views/luoguStatusBar'
import { UserStatus } from '@/utils/shared'
import { state, context as stateContext, globalState } from '@/store/state'
import { setClientID, setUID, fetchHomepage } from '@/utils/api'
import * as path from 'path'
import { getVersion, getUserToken } from './utils/compatible'
const VERSION = '4.4.7'

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  debug('initializing luogu-vscode.')
  RegisterCommands(context)
  RegisterViews(context)
  stateContext.value = context;
  console.log('init luogu-vscode success.')
  exports.rootPath = context.extensionPath
  exports.resourcesPath = path.join(exports.rootPath, 'resources')

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>vscode-luogu v${VERSION} 更新说明</title>
  </head>
  <div>
    <h1>置顶说明</h1>
    <h2>
    <ul>
    <li>Added user communication group(QQ):1141066631</li>
    <li>本插件为正版，Luogu On VSCode为盗版</li>
    </ul>
    </h2>
    <h1>本次更新</h1>
    <h2>
    <ul>
    <li>Fix:
    <ol>
    <li>深色主题题解配色</li>
    </ol>
    </li>
    <li>Add:
    <ol>
    <li>查看比赛</li>
    <li>根据文件后缀名识别提交语言</li>
    </ol>
    </li>
    </ul>
    </h2>
  </div>
  </html>
  `

  if (getVersion() !== VERSION) {
    const panel = vscode.window.createWebviewPanel('更新说明', 'vscode-luogu' + VERSION + ' 更新说明', vscode.ViewColumn.Two, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(exports.resourcesPath)]
    })
    panel.webview.html = html
  }
  globalState.version.value = VERSION;

  const token = getUserToken()
  if (token) {
    try {
      await setClientID(token.clientID)
      await setUID(token.uid)
      try {
        const data = await fetchHomepage();
        if (data.currentUser === undefined) {
          vscode.window.showErrorMessage('未登录')
          luoguStatusBar.updateStatusBar(UserStatus.SignedOut)
          state.logged.value = false
        } else {
          vscode.window.showInformationMessage('登录成功')
          luoguStatusBar.updateStatusBar(UserStatus.SignedIn)
          state.logged.value = true
        }
      } catch (err) {
        vscode.window.showErrorMessage('获取登录信息失败')
        vscode.window.showErrorMessage(err)
        // vscode.window.showErrorMessage('未登录')
        luoguStatusBar.updateStatusBar(UserStatus.SignedOut)
        state.logged.value = false
      }
    } catch (err) {
      console.error(err)
      vscode.window.showInformationMessage('未登录')
      luoguStatusBar.updateStatusBar(UserStatus.SignedOut)
      state.logged.value = false
    }
  } else {
    vscode.window.showInformationMessage('未登录')
    luoguStatusBar.updateStatusBar(UserStatus.SignedOut)
    state.logged.value = false
  }
  state.initialed.value = true
  exports.init = true
  console.log(exports.rootPath)
}

export function deactivate(): void {
  // Do nothing.
}
