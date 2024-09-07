import vscode from 'vscode';

import registerMyArticle from './myArticle';
import registerHistory from './history';

export default function registerFeatures(context: vscode.ExtensionContext) {
  registerMyArticle(context);
  registerHistory(context);
}
