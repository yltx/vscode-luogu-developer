import SuperCommand from '../SuperCommand';
import * as vscode from 'vscode';
import { searchTrainingdetail } from '@/utils/api';
import { showTrainDetails } from '@/utils/showTrainDetails';

export default new SuperCommand({
  onCommand: 'traindetails',
  handle: async () => {
    const defaultID = globalThis.tid;
    const tid = await vscode.window
      .showInputBox({
        placeHolder: '输入题单编号',
        value: defaultID,
        ignoreFocusOut: true
      })
      .then(res => (res ? res.toUpperCase() : null));
    if (!tid) {
      return;
    }
    globalThis.tid = tid;
    try {
      const data = await searchTrainingdetail(+tid);
      // console.log(data)
      const panel = vscode.window.createWebviewPanel(
        '题单详情',
        `${data['training']['title']}`,
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            vscode.Uri.file(globalThis.resourcesPath),
            vscode.Uri.file(globalThis.distPath)
          ]
        }
      );
      const html = await showTrainDetails(panel.webview, +tid);
      panel.webview.html = html;
      panel.webview.onDidReceiveMessage(async message => {
        if (message.type === 'open') {
          console.log('pid:', message.data);
          vscode.commands.executeCommand('luogu.searchProblem', {
            pid: message.data
          });
        }
      });
    } catch (err) {
      vscode.window.showErrorMessage('打开失败');
      vscode.window.showErrorMessage(`${err}`);
      throw err;
    }
  }
});
