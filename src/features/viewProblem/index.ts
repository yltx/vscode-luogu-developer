import { getProblemData } from '@/utils/api';
import {
  askForPid,
  guessProblemId,
  processAxiosError
} from '@/utils/workspaceUtils';
import * as vscode from 'vscode';
import showProblemWebview from './webview';

export default function registerViewProblem(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'luogu.searchProblem',
      async (id?: { pid: string; cid?: number }) => {
        if (!id) {
          const guessed =
            vscode.window.activeTextEditor &&
            guessProblemId(vscode.window.activeTextEditor.document.fileName);
          if (
            guessed &&
            vscode.workspace
              .getConfiguration('luogu')
              .get('guessProblemID', false)
          )
            id = guessed;
          else if (!(id = await askForPid(guessed))) return false;
        }
        return await getProblemData(id.pid, id.cid)
          .then(problemDetails => {
            globalThis.luogu.historyTreeviewProvider.addItem({
              type: 'problem',
              pid: problemDetails.problem.pid,
              contest: problemDetails.contest
                ? {
                    contestId: problemDetails.contest.id,
                    title: problemDetails.contest.name
                  }
                : undefined,
              title: problemDetails.problem.title
            });
            showProblemWebview(problemDetails);
            return true;
          })
          .catch((e: unknown) => {
            processAxiosError('查找题目')(e);
            return new Error('Error when fetch problem', { cause: e });
          });
      }
    )
  );
}
