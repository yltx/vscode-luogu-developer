import SuperCommand from '../SuperCommand'
import { setUID, setClientID, logout, getStatus } from '@/utils/api'
import { UserStatus } from '@/utils/shared'
import luoguStatusBar from '@/views/luoguStatusBar'

import * as vscode from 'vscode'
import { state, globalState } from '@/store/state'

export default new SuperCommand({
  onCommand: 'signout',
  handle: async () => {
    while (!exports.init) { continue; }
    try {
      if (await getStatus() === UserStatus.SignedOut.toString()) {
        vscode.window.showErrorMessage('未登录');
        return;
      }
    } catch (err) {
      console.error(err)
      vscode.window.showErrorMessage(err.toString());
      return;
    }

    globalState.uid.value = undefined;
    globalState.clientID.value = undefined;

    try {
      // await logout()
    } finally {
      await setUID('')
      await setClientID('')
      state.logged.value = false;
      luoguStatusBar.updateStatusBar(UserStatus.SignedOut);
      vscode.window.showInformationMessage('注销成功');
    }
  }
})
