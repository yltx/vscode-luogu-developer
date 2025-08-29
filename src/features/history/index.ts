import * as vscode from 'vscode';
import historyTreeviewProvider from './treeviewProvider';
import { getStorage, setStorage } from '@/utils/storage';

const globalStateKey = 'luogu.history';
let deleteClickTimeout: NodeJS.Timeout | null = null;

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
    vscode.commands.registerCommand('luogu.history.delete', async (item) => {
      if (!item) return;
      
      // 双击删除实现
      if (deleteClickTimeout) {
        // 如果存在定时器，说明是双击
        clearTimeout(deleteClickTimeout);
        deleteClickTimeout = null;
        view.removeItem(item);
      } else {
        // 第一次点击，设置定时器
        deleteClickTimeout = setTimeout(() => {
          deleteClickTimeout = null;
        }, 500);
      }
    })
  );
  
  context.subscriptions.push(view);
}