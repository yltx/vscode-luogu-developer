import vscode from 'vscode';

import myArticle from './myArticle';
import history from './history';
import viewProblem from './viewProblem';
import login from './login';
import submit from './submit';

export default function registerFeatures(context: vscode.ExtensionContext) {
  for (const registerFeature of [
    login,
    myArticle,
    history,
    viewProblem,
    submit
  ])
    registerFeature(context);
}
