import * as vscode from 'vscode';
import HistoryItem from './historyItem';
export default class historyTreeviewProvider
  implements vscode.TreeDataProvider<HistoryItem>, vscode.Disposable
{
  constructor(protected readStorage: () => MaybeThenable<HistoryItem[]>) {}
  getTreeItem(element: HistoryItem): vscode.TreeItem {
    if (element.type === 'problem')
      return {
        label: `${element.pid} ${element.title}`
      };
    if (element.type === 'contest')
      return {
        label: `${element.title}`
      };
    if (element.type === 'training')
      return {
        label: `${element.title}`
      };
    throw new TypeError('Unknown history element type', { cause: element });
  }
  getChildren() {
    return this.readStorage();
  }
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  refresh() {
    this._onDidChangeTreeData.fire();
  }
  dispose() {
    this._onDidChangeTreeData.dispose();
  }
}
