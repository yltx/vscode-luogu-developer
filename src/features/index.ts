import vscode from 'vscode';

import myArticle from './myArticle';
import history from './history';
import viewProblem from './viewProblem';
import login from './login';

export default function registerFeatures(context: vscode.ExtensionContext) {
  for (const registerFeature of [login, myArticle, history, viewProblem])
    registerFeature(context);
}
