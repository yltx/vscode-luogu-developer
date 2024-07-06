import {
  deleteArticle as deleteArticle,
  editArticle,
  getMyArticle,
  listMyAllArticles
} from '@/utils/api';
import { isAxiosError } from 'axios';
import { Article } from 'luogu-api';
import * as vscode from 'vscode';

export default class myArticleFsProvider
  implements vscode.FileSystemProvider, vscode.Disposable
{
  protected _onDidChangeFile = new vscode.EventEmitter<
    vscode.FileChangeEvent[]
  >();
  onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> =
    this._onDidChangeFile.event;

  constructor(public readonly scheme: string) {}
  watch(): vscode.Disposable {
    return { dispose() {} };
  }
  createDirectory() {
    throw vscode.FileSystemError.Unavailable('Not supported');
  }
  async delete(uri: vscode.Uri) {
    try {
      await deleteArticle(uri.query);
      this._onDidChangeFile.fire([
        { type: vscode.FileChangeType.Deleted, uri }
      ]);
    } catch (e) {
      throw Object.assign(vscode.FileSystemError.FileNotFound(uri), {
        cause: e
      });
    }
  }
  async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
    if (uri.query === '')
      return { type: vscode.FileType.Directory, size: 0, ctime: 0, mtime: 0 };
    try {
      const res = (await getMyArticle(uri.query)).currentData.article;
      return {
        type: vscode.FileType.File,
        size: res.content.length,
        ctime: res.time,
        mtime: 0
      };
    } catch (e) {
      throw Object.assign(
        isAxiosError(e) && (e.code === '404' || e.code === '403')
          ? vscode.FileSystemError.FileNotFound(uri)
          : vscode.FileSystemError.Unavailable(uri),
        { cause: e }
      );
    }
  }
  async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
    if (uri.query !== '') throw vscode.FileSystemError.FileNotADirectory(uri);
    else
      return listMyAllArticles().then(res =>
        res.map(x => [x.lid, vscode.FileType.File])
      );
  }
  async readFile(uri: vscode.Uri) {
    try {
      return new TextEncoder().encode(
        (await getMyArticle(uri.query)).currentData.article.content
      );
    } catch (e) {
      throw Object.assign(
        isAxiosError(e) && (e.code === '404' || e.code === '403')
          ? vscode.FileSystemError.FileNotFound(uri)
          : vscode.FileSystemError.Unavailable(uri),
        { cause: e }
      );
    }
  }
  async writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    options: { readonly create: boolean; readonly overwrite: boolean }
  ) {
    if (uri.query === '') throw vscode.FileSystemError.FileIsADirectory(uri);
    if (!options.overwrite) return;
    try {
      const res = (await getMyArticle(uri.query)).currentData.article;
      if (res.promoteStatus === 2)
        if (
          (await vscode.window.showWarningMessage(
            '保存操作会导致题解重新审核。',
            '继续',
            '取消'
          )) !== '继续'
        )
          throw 'Canceled';
      await editArticle(uri.query, {
        title: res.title,
        solutionFor: res.solutionFor?.pid ?? null,
        category: res.category,
        status: res.status,
        content: new TextDecoder().decode(content)
      });
      this._onDidChangeFile.fire([
        { type: vscode.FileChangeType.Changed, uri }
      ]);
    } catch (e) {
      if (e === 'Canceled') throw e;
      throw Object.assign(
        isAxiosError(e) && (e.code === '404' || e.code === '403')
          ? vscode.FileSystemError.FileNotFound(uri)
          : vscode.FileSystemError.Unavailable(uri),
        { cause: e }
      );
    }
  }
  rename() {
    throw vscode.FileSystemError.Unavailable('Not supported');
  }
  dispose() {
    this._onDidChangeFile.dispose();
  }
  getUri(article: Article) {
    return vscode.Uri.from({
      scheme: this.scheme,
      query: article.lid,
      path: `/${article.title}.md`
    });
  }
}
