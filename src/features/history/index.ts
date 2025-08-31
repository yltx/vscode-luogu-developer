import * as vscode from 'vscode';
import historyTreeviewProvider from './treeviewProvider';
import { getStorage, setStorage } from '@/utils/storage';

const globalStateKey = 'luogu.history';

export default function registerHistory(context: vscode.ExtensionContext) {
  globalThis.luogu.insertHistory = item =>
    void context.globalState.update(globalStateKey, item);
  const view = new historyTreeviewProvider(
    () => getStorage(context, 'history'),
    x => setStorage(context, 'history', x)
  );
  globalThis.luogu.historyTreeviewProvider = view;
  vscode.window.registerTreeDataProvider('luogu.history', view);

  // 注册删除历史记录命令
  context.subscriptions.push(
    vscode.commands.registerCommand('luogu.history.delete', async item => {
      if (!item) return;
      view.removeItem(item);
    })
  );

  context.subscriptions.push(view);
}
