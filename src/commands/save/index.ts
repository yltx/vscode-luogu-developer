import * as vscode from 'vscode'
import SuperCommand from '../SuperCommand'
import { parseProblemID, searchProblem } from '@/utils/api'
import { DialogType, promptForOpenOutputChannel } from '@/utils/uiUtils'
import Problem from '@/model/Problem'
import { genProblemHTML } from '@/utils/showProblem'
import { saveProblem } from '@/utils/files';
import * as path from 'path'

export default new SuperCommand({
  onCommand: 'save',
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
    }).then(res => res ? res.toUpperCase() : null)
    if (!pid) {
      await promptForOpenOutputChannel('', DialogType.error)
      return
    }
    globalThis.pid = pid;
    const problem = await searchProblem(pid).then(res => new Problem(res))
    const panel = vscode.window.createWebviewPanel(problem.stringPID, problem.name, vscode.ViewColumn.Two, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(globalThis.resourcesPath), vscode.Uri.file(globalThis.distPath)]
    })
    panel.webview.html=genProblemHTML(panel.webview,problem,false)+`\n<!-- SaveTime:${+new Date()} -->\n<!-- ProblemName:${pid} -->`;
    panel.dispose()
    try{
      saveProblem(pid,panel.webview.html);
    }catch (err){
      vscode.window.showErrorMessage('保存失败')
      throw err
    }
    vscode.window.showInformationMessage('保存成功')
  }
})
