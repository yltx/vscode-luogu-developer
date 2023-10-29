import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs'
import * as vscode from 'vscode'
import SuperCommand from '../SuperCommand'
import { searchProblem } from '@/utils/api'
import { DialogType, promptForOpenOutputChannel } from '@/utils/uiUtils'
import Problem from '@/model/Problem'
import { generateProblemHTML } from '@/utils/showProblem'
globalThis.luoguProblemPath = path.join(os.homedir(), '.luoguProblems')

export default new SuperCommand({
  onCommand: 'save',
  handle: async () => {
    while (!globalThis.init) { continue; }
    const pid = await vscode.window.showInputBox({
      placeHolder: '输入题号',
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
      localResourceRoots: [vscode.Uri.file(globalThis.resourcesPath)]
    })
    const html = generateProblemHTML(panel.webview, problem, false) + `\n<!-- SaveTime:${+new Date()} -->\n<!-- ProblemName:${pid} -->`
    panel.dispose()
    const filename = pid + '.html'
    globalThis.luoguProblems = path.join(globalThis.luoguProblemPath, filename)
    if (!fs.existsSync(globalThis.luoguProblemPath)) {
      try {
        fs.mkdirSync(globalThis.luoguProblemPath)
      } catch (err) {
        vscode.window.showErrorMessage('创建题目保存路径失败')
        vscode.window.showErrorMessage(`${err}`)
        console.error(err)
        return
      }
    }
    try {
      fs.writeFileSync(globalThis.luoguProblems, html)
    } catch (err) {
      vscode.window.showErrorMessage('保存失败')
      vscode.window.showErrorMessage(`${err}`)
      console.error(err)
      return
    }
    vscode.window.showInformationMessage('保存成功\n存储路径：' + globalThis.luoguProblems)
  }
})
