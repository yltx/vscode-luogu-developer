import SuperCommand from '../SuperCommand'
import { logout, getStatus, getErrorMessage } from '@/utils/api'
import { changeCookie } from '@/utils/files';
import { UserStatus } from '@/utils/shared'
import luoguStatusBar from '@/views/luoguStatusBar'

import * as vscode from 'vscode'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
globalThis.luoguPath = path.join(os.homedir(), '.luogu');

export default new SuperCommand({
  onCommand: 'signout',
  handle: async () => {
    while (!globalThis.init) { continue; }
    try {
      if (await getStatus() === UserStatus.SignedOut.toString()) {
        vscode.window.showErrorMessage('未登录');
        return;
      }
    } catch (err) {
      console.error(err)
      vscode.window.showErrorMessage(`${err}`);
      return;
    }
    await fs.stat(globalThis.luoguJSONPath).then(()=>{
      fs.unlink(globalThis.luoguJSONPath)
    }).catch(err=>{
      vscode.window.showErrorMessage('删除文件时出现错误');
      vscode.window.showErrorMessage(err);
    })
    // try {
    //   // await logout()
    // } finally {
    changeCookie({uid:'',clientID:''});
    globalThis.islogged = false;
    luoguStatusBar.updateStatusBar(UserStatus.SignedOut);
    vscode.window.showInformationMessage('注销成功');
    // }
  }
})
