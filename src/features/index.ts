import vscode from 'vscode';

import myArticle from './myArticle';
import history from './history';
import viewProblem from './viewProblem';
import login from './login';
import submit from './submit';
import record from './record';
import solution from './solution';
import benben from './benben';
import contest from './contest';

export default function registerFeatures(context: vscode.ExtensionContext) {
  for (const registerFeature of [
    login,
    myArticle,
    history,
    viewProblem,
    submit,
    record,
    solution,
    benben,
    contest
  ])
    registerFeature(context);
}
