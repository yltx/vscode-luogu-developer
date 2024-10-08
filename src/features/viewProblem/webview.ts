import { getDistFilePath } from '@/utils/html';
import { ProblemData } from 'luogu-api';
import * as vscode from 'vscode';
import useWebviewResponseHandle from '@/utils/webviewResponse';
import { checkCPH, sendCphMessage } from './cph';

export default function showProblemWebview(data: ProblemData) {
  const panel = vscode.window.createWebviewPanel(
    'problem',
    `${data.problem.pid} ${data.problem.title}`,
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
  useWebviewResponseHandle(panel.webview, {
    checkCph: checkCPH,
    jumpToCph: () => sendCphMessage(data),
    searchSolution: () =>
      vscode.commands.executeCommand('luogu.solution', data.problem.pid)
  });
  panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script type="application/json" id="lentille-context">${JSON.stringify(data)}</script>
    </head>
    <body>
    <script defer src=${getDistFilePath(panel.webview, 'webview-viewProblem.js')}></script>
    <div id="app"></div>
    </body>
    </html>
  `;
}
