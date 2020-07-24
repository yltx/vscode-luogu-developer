import SuperCommand from '../SuperCommand'
import * as vscode from 'vscode'
import { getStatus, setClientID, setUID, searchUser } from '@/utils/api'
import luoguStatusBar from '@/views/luoguStatusBar'
import { UserStatus } from '@/utils/shared'
import { promptForOpenOutputChannelWithResult, DialogType } from '@/utils/uiUtils'
import { state, globalState } from '@/store/state'

export default new SuperCommand({
  onCommand: 'cookieslogin',
  handle: async () => {
    while (!exports.init) { continue; }
    while (true) {
      const keyword = await vscode.window.showInputBox({
        placeHolder: '输入用户名/uid',
        ignoreFocusOut: true
      })
      if (!keyword) {
        return
      }
      const uid = (await searchUser(keyword))['users'][0]['uid']
      if (!uid) {
        const res = await promptForOpenOutputChannelWithResult('用户不存在', DialogType.error)
        if (res?.title === '重试') {
          continue;
        } else {
          break;
        }
      }
      const clientID = await vscode.window.showInputBox({
        placeHolder: '输入 clientID',
        ignoreFocusOut: true,
        password: true
      })
      if (!clientID) {
        return
      }
      try {
        await setClientID(clientID)
        await setUID(uid)
        if (await getStatus() === UserStatus.SignedOut.toString()) {
          state.logged.value = false;
          luoguStatusBar.updateStatusBar(UserStatus.SignedOut)
          const res = await promptForOpenOutputChannelWithResult('登录失败', DialogType.error)
          if (res?.title === '重试') {
            continue;
          } else {
            break;
          }
        } else {
          state.logged.value = true;
          vscode.window.showInformationMessage('登录成功');
          luoguStatusBar.updateStatusBar(UserStatus.SignedIn);
          globalState.clientID.value = clientID;
          globalState.uid.value = uid;
          return;
        }
      } catch (err) {
        console.error(err)
        vscode.window.showErrorMessage(err);
        luoguStatusBar.updateStatusBar(UserStatus.SignedOut)
        const res = await promptForOpenOutputChannelWithResult('登录失败', DialogType.error)
        if (res?.title === '重试') {
          continue;
        } else {
          break;
        }
      }
    }
  }

})
