import vscode from 'vscode';
import * as path from 'path';
import { UserSummary } from 'luogu-api';
import { getUserSvg, getUsernameColor } from './workspaceUtils';

export const getResourceFilePath = (
  webview: vscode.Webview,
  relativePath: string
) => {
  const diskPath = vscode.Uri.file(
    path.join(globalThis.resourcesPath, relativePath)
  );
  return webview.asWebviewUri(diskPath);
};
export const getDistFilePath = (
  webview: vscode.Webview,
  relativePath: string
) => {
  const diskPath = vscode.Uri.file(
    path.join(globalThis.distPath, relativePath)
  );
  return webview.asWebviewUri(diskPath);
};

const HTMLtemplate = function (
  webview: vscode.Webview,
  title: string,
  body: string,
  style: string = '',
  script: string = ''
) {
  return `
        <!DOCTYPE html>
        <html lang="zh-cn">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link rel="stylesheet" href="${getResourceFilePath(
          webview,
          'main.css'
        )}">
        <script src="${webview.asWebviewUri(
          vscode.Uri.file(path.join(globalThis.distPath, 'webview.js'))
        )}"></script>

        <link rel="stylesheet" href="">
        <script defer src=""></script>
        <script defer src=""></script>
        <link rel="stylesheet" href="${getResourceFilePath(
          webview,
          'katex/katex.min.css'
        )}">
        <script>
            const $=globalThis.luogu.jquery;
        </script>
        <style>${style}</style>
        <script type="text/javascript">${script}</script>
        </head>
        <body>
        ${body}
        </body>
        </html>`;
};

export const usernameSpan = function (user: UserSummary) {
  return `
        <a href="https://www.luogu.com.cn/user/${
          user.uid
        }" class="username-span"><span class="username-name" style="color:${getUsernameColor(
          user.color
        )}">${user.name}</span>
        ${getUserSvg(user.ccfLevel)}${
          user.badge
            ? ` <span class="tag" style="background-color:${getUsernameColor(
                user.color
              )}">${user.badge}</span>`
            : ``
        }</a>
    `;
};

export default HTMLtemplate;
