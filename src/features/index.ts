import vscode from 'vscode';

import registerMyArticle from './myArticle';

export default function registerFeatures(context: vscode.ExtensionContext) {
  registerMyArticle(context);
}
