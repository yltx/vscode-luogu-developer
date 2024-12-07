import vscode from 'vscode';
import * as path from 'path';

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
