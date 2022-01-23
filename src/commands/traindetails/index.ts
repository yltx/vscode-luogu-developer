import SuperCommand from '../SuperCommand'
import * as vscode from 'vscode'
import { searchTrainingdetail } from '@/utils/api'
import { showTrainDetails } from '@/utils/showTrainDetails'

export default new SuperCommand({
  onCommand: 'traindetails',
  handle: async () => {
    let defaultID = exports.tid
    const tid = await vscode.window.showInputBox({
      placeHolder: '输入题单编号',
      value: defaultID,
      ignoreFocusOut: true
    }).then(res => res ? res.toUpperCase() : null)
    if (!tid) {
      return
    }
    exports.tid = tid
    try{
      const data = await searchTrainingdetail(tid)
      console.log(data)
      const panel = vscode.window.createWebviewPanel('题单详情',`${1}`,vscode.ViewColumn.Two,{
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(exports.resourcesPath.value)]
      })
      panel.webview.html = await showTrainDetails(tid)
    } catch(err) {
        vscode.window.showErrorMessage('打开失败')
        vscode.window.showErrorMessage(`${err}`)
        throw(err)
    }
  }
})