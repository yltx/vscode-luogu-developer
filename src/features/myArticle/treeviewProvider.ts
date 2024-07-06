import { listMyAllArticles } from '@/utils/api';
import { formatTime } from '@/utils/shared';
import { Article } from 'luogu-api';
import * as vscode from 'vscode';
import myArticleFsProvider from './fsProvider';
import { getArticleCategory } from '@/utils/workspaceUtils';

export default class MyArticleTreeviewProvider
  implements vscode.TreeDataProvider<Article>, vscode.Disposable
{
  constructor(private fsProvider: myArticleFsProvider) {
    fsProvider.onDidChangeFile(() => this.refresh());
  }
  getTreeItem(element: Article): vscode.TreeItem {
    return {
      label: element.title,
      collapsibleState: vscode.TreeItemCollapsibleState.None,
      id: element.lid,
      iconPath: new vscode.ThemeIcon(
        element.promoteStatus == 2
          ? 'pass'
          : element.promoteStatus == 3
            ? 'error'
            : element.promoteStatus == 1
              ? 'watch'
              : element.status == 1
                ? 'eye-closed'
                : 'circle-large-outline'
      ),
      tooltip: [
        `${element.lid}·${element.title}`,
        `发布于 ${formatTime(element.time * 1000)} ${getArticleCategory(element.category)}`,
        (element.solutionFor
          ? `关联于题目 ${element.solutionFor.pid}·`
          : element.promoteStatus > 0
            ? `申请为全站推荐·`
            : '') +
          (element.promoteStatus > 0
            ? (element.promoteStatus == 1
                ? '等待审核'
                : element.promoteStatus == 2
                  ? '通过'
                  : '被打回') +
              (element.promoteResult?.updateAt
                ? ` @ ${formatTime(element.promoteResult.updateAt * 1000)}`
                : '')
            : element.status == 1
              ? '隐藏'
              : '公开'),
        ...(element.promoteResult?.rejectReason
          ? ['拒绝原因：' + element.promoteResult.rejectReason]
          : [])
      ].join('\n'),
      command: {
        command: 'vscode.open',
        title: '编辑文章',
        arguments: [this.fsProvider.getUri(element)]
      },
      contextValue: 'luogu.article.articleitem'
    };
  }
  getChildren(element?: Article | undefined): vscode.ProviderResult<Article[]> {
    if (element) return [];
    return listMyAllArticles();
  }
  private _onDidChangeTreeData = new vscode.EventEmitter<
    void | Article | Article[] | null | undefined
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  refresh() {
    this._onDidChangeTreeData.fire();
  }
  dispose() {
    this._onDidChangeTreeData.dispose();
  }
}
