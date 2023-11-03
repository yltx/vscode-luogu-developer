import * as path from 'path'
import * as vscode from 'vscode'
import SuperCommand from '../SuperCommand'
import { getErrorMessage, parseProblemID } from '@/utils/api'
import { config, getSavedProblem } from '@/utils/files'

export default new SuperCommand({
  onCommand: 'open',
  handle: async () => {
    while (!globalThis.init) { continue; }
    const edtior = vscode.window.activeTextEditor;
    let fileNameID = '';
    if (edtior) {
      fileNameID = await parseProblemID(path.parse(edtior.document.fileName).base);
      fileNameID = fileNameID.toUpperCase();
    }
    const pid = (vscode.workspace.getConfiguration('luogu').get<boolean>('checkFilenameAsProblemID') && fileNameID !== '') ? fileNameID : await vscode.window.showInputBox({
      placeHolder: '输入题号',
      value: globalThis.pid,
      ignoreFocusOut: true
    }).then(res => res ? res.toUpperCase() : null);
    if (!pid) {
      return;
    }
    let html: string;
    try {
      html = getSavedProblem(pid);
    } catch (err) {
      vscode.window.showErrorMessage('打开题目失败')
      throw err;
    }

    const problemname = html.match(/<title>(.*)<\/title>/)![1];
    const panel = vscode.window.createWebviewPanel(pid, problemname, vscode.ViewColumn.Two, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(globalThis.resourcesPath), vscode.Uri.file(globalThis.distPath)]
    });
    panel.webview.html = html;
  }
})
