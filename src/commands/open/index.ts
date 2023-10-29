import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs/promises'
import * as vscode from 'vscode'
import SuperCommand from '../SuperCommand'
import { getErrorMessage, parseProblemID } from '@/utils/api'
globalThis.luoguProblemPath = path.join(os.homedir(), '.luoguProblems')

export default new SuperCommand({
  onCommand: 'open',
  handle: async () => {
    while (!globalThis.init) { continue; }
    const edtior = vscode.window.activeTextEditor;
    let defaultID = '';
    if (edtior) {
      defaultID = await parseProblemID(path.parse(edtior.document.fileName).base);
      defaultID = defaultID.toUpperCase();
    }
    if (defaultID === '') {
      defaultID = globalThis.pid;
    }
    const pid = (vscode.workspace.getConfiguration('luogu').get<boolean>('checkFilenameAsProblemID') && defaultID !== '') ? defaultID : await vscode.window.showInputBox({
      placeHolder: '输入题号',
      value: defaultID,
      ignoreFocusOut: true
    }).then(res => res ? res.toUpperCase() : null);
    if (!pid) {
      return;
    }
    globalThis.pid = pid;
    const filename = pid + '.html'
    globalThis.luoguProblems = path.join(globalThis.luoguProblemPath, filename)
    if(!await fs.stat(globalThis.luoguProblems).catch(err => {
      vscode.window.showErrorMessage('此题未在本地保存')
      return false;
    })) return;
    
    await fs.readFile(globalThis.luoguProblems).then(
      r=>{
        let html = r.toString();
        const problemname = html.match(/<title>(.*)<\/title>/)![1]
        const panel = vscode.window.createWebviewPanel(pid, problemname, vscode.ViewColumn.Two, {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [vscode.Uri.file(globalThis.resourcesPath)]
        })
        panel.webview.html = html
      }
    ).catch(err => {
      vscode.window.showErrorMessage('打开失败')
      vscode.window.showErrorMessage(getErrorMessage(err))
      console.error(err)
    })
      

  }
})
