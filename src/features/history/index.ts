import * as vscode from 'vscode';
import historyTreeviewProvider from './treeviewProvider';
import HistoryItem from './historyItem';

const globalStateKey = 'luogu.history';
export default function registerHistory(context: vscode.ExtensionContext) {
  globalThis.luogu.insertHistory = item =>
    void context.globalState.update(globalStateKey, item);
  const view = new historyTreeviewProvider(() =>
    context.globalState.get<HistoryItem[]>(globalStateKey, [])
  );
  vscode.window.registerTreeDataProvider('luogu.history', view);
  context.subscriptions.push(view);
}
