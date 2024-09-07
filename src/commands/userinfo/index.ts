import SuperCommand from '../SuperCommand';
import { fetch3kHomepage } from '@/utils/api';
import { needLogin } from '@/utils/uiUtils';
import * as vscode from 'vscode';

export default new SuperCommand({
  onCommand: 'userInfo',
  handle: async () => {
    await globalThis.luogu.waitinit;
    try {
      const data = await fetch3kHomepage();
      if (data.currentUser === undefined) {
        needLogin();
        return;
      }
      vscode.window.showInformationMessage(data.currentUser.name);
    } catch (err) {
      vscode.window.showErrorMessage('获取登录信息失败');
      vscode.window.showErrorMessage(`${err}`);
    }
  }
});
