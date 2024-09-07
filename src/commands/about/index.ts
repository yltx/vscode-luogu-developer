import SuperCommand from '../SuperCommand';
import * as vscode from 'vscode';

export default new SuperCommand({
  onCommand: 'about',
  handle: async () => {
    await globalThis.luogu.waitinit;
    vscode.window.showInformationMessage(
      '欢迎使用 vscode-luogu \n\n 开发者：himself65 引领天下 YanWQmonad FangZeLi andyli 宝硕'
    );
  }
});
