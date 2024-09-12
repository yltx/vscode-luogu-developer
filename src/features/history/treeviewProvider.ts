import * as vscode from 'vscode';
import HistoryItem from './historyItem';

export default class historyTreeviewProvider
  implements vscode.TreeDataProvider<HistoryItem>, vscode.Disposable
{
  constructor(
    protected getStorage: () => MaybeThenable<HistoryItem[]>,
    protected setStorage: (items: HistoryItem[]) => void
  ) {}
  getTreeItem(element: HistoryItem): vscode.TreeItem {
    if (element.type === 'problem')
      return {
        label:
          `${element.pid} ${element.title}` +
          (element.contest ? ` · ${element.contest.contestId}` : ``),
        command: {
          command: 'luogu.searchProblem',
          title: '打开题目',
          arguments: [{ pid: element.pid, cid: element.contest?.contestId }]
        },
        iconPath: new vscode.ThemeIcon('notebook'),
        tooltip: new vscode.MarkdownString(
          `[${element.pid}](https://www.luogu.com.cn/problem/${element.pid}${element.contest ? `?contestId=${element.contest.contestId}` : ``}) ${element.title}  \n` +
            (element.contest
              ? `关联于比赛 [${element.contest.contestId}](https://www.luogu.com.cn/contest/${element.contest.contestId}) ${element.contest.title}`
              : '')
        ),
        contextValue: 'luogu.history.problemItem'
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
  async getChildren() {
    return (await this.getStorage()).reverse();
  }
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  refresh() {
    this._onDidChangeTreeData.fire();
  }
  dispose() {
    this._onDidChangeTreeData.dispose();
  }
  async addItem(item: HistoryItem) {
    const dat = (await this.getStorage()).filter(
      x => JSON.stringify(x) !== JSON.stringify(item)
    );
    dat.push(item);
    const maxLength =
      vscode.workspace
        .getConfiguration('luogu')
        .get<number>('maxHistoryLength') ?? 256;
    if (dat.length > maxLength) dat.splice(0, dat.length - maxLength);
    this.setStorage(dat);
    this.refresh();
  }
}
