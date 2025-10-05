import * as vscode from 'vscode';
import { getDistFilePath } from '@/utils/html';
import { ContestData } from 'luogu-api';
import useWebviewResponseHandle from '@/utils/webviewResponse';
import { getRanklist, searchContest } from '@/utils/api';

export default function showContestWebview(data: ContestData) {
  const panel = vscode.window.createWebviewPanel(
    'contest',
    `${data.contest.id} ${data.contest.name}`,
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.file(globalThis.resourcesPath),
        vscode.Uri.file(globalThis.distPath)
      ],
      enableCommandUris: ['luogu.searchProblem']
    }
  );
  panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script type="application/json" id="lentille-context">${JSON.stringify(data)}</script>
    </head>
    <body>
    <script defer src=${getDistFilePath(panel.webview, 'webview-contest.js')}></script>
    <div id="app"></div>
    </body>
    </html>
  `;
  useWebviewResponseHandle(panel.webview, {
    ContestRanklist: ({ page }) => getRanklist(data.contest.id, page),
    ContestReload: async () => {
      const fresh = await searchContest(data.contest.id);
      return fresh;
    }
  });
}
