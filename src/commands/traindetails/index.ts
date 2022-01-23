import SuperCommand from '../SuperCommand'
import * as vscode from 'vscode'
import { searchTrainingdetail } from '@/utils/api'

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
    const data=await searchTrainingdetail(tid)
    console.log(data)
    return ``
  }
})