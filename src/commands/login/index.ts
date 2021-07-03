import { login, unlock, getClientID, getUID, fetchHomepage, setUID, setClientID } from '@/utils/api'
import SuperCommand from '../SuperCommand'
import luoguStatusBar from '@/views/luoguStatusBar'
import { UserStatus } from '@/utils/shared'
import { getUserCaptcha } from '@/utils/captcha'
import { debug } from '@/utils/debug'
import * as vscode from 'vscode'
import { DialogType, promptForOpenOutputChannelWithResult } from '@/utils/uiUtils'
import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs'

const luoguJSONName = 'luogu.json';
exports.luoguPath = path.join(os.homedir(), '.luogu');
exports.luoguJSONPath = path.join(exports.luoguPath, luoguJSONName);

export default new SuperCommand({
  onCommand: 'signin',
  handle: async () => {
    while (!exports.init) { continue; }
    const data = await fetchHomepage()
    if (data.currentUser !== undefined) {
      const result = await vscode.window.showInformationMessage(`您已登录用户 ${data.currentUser.name}，是否继续？`, { title: '是' }, { title: '否' })
      if (result?.title === '否') {
        return
      } else {
        exports.islogged = false;
        luoguStatusBar.updateStatusBar(UserStatus.SignedOut);
      }
    } else {
      await setUID('')
      await setClientID('')
    }
    let continued = true
    while (continued) {
      continued = false
      const username = await vscode.window.showInputBox({
        placeHolder: '输入用户名',
        ignoreFocusOut: true
      })
      if (!username) {
        return
      }
      const password = await vscode.window.showInputBox({
        placeHolder: '输入密码',
        ignoreFocusOut: true,
        password: true
      })
      if (!password) {
        return
      }
      while (true) {
        const captcha = await getUserCaptcha()
        if (!captcha) {
          debug('No captcha text')
          return;
        }
        let clientID:string | null
        try{
          const r1 = await login(username, password, captcha)
          let resp:string | null
          if (r1.locked) {
            const code = await vscode.window.showInputBox({
              placeHolder: '输入2FA验证码',
              ignoreFocusOut: true
            })
            if (!code) {
              return
            }
            const r2 = await unlock(code)
            resp = r2
          } else {
            resp = r1
          }
          console.log(resp)
          exports.init = true
          vscode.window.showInformationMessage('登录成功');
          exports.islogged = true;
          try {
            fs.writeFileSync(exports.luoguJSONPath, JSON.stringify({ 'uid': await getUID(), 'clientID': clientID = await getClientID() }))
          } catch (error) {
            vscode.window.showErrorMessage('写入文件时出现错误')
            vscode.window.showErrorMessage(error)
          }
          luoguStatusBar.updateStatusBar(UserStatus.SignedIn);
          break;
        } catch (err) {
          console.log(err)
          exports.init = true
          if (err.response) {
            if (err.response.data.errorMessage === '验证码错误') {
              const res = await promptForOpenOutputChannelWithResult(err.response.data.errorMessage, DialogType.error)
              if (res?.title === '重试') {
                continue;
              } else {
                break;
              }
            }
            const res = await promptForOpenOutputChannelWithResult(err.response.data.errorMessage, DialogType.error)
            if (res?.title === '重试') {
              continued = true
              break
            } else {
              break;
            }
          }
        }
      }
    }
  }
})
