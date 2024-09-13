import { getProblemData } from '@/utils/api';
import { processAxiosError } from '@/utils/workspaceUtils';
import * as vscode from 'vscode';
import showProblemWebview from './webview';

const pidValidate = /^\w+( \d+)?$/;
async function askForPid() {
  const res = await vscode.window.showInputBox({
    title: '输入题目编号和比赛编号',
    placeHolder:
      '题目编号和比赛编号间用空格分隔，不属于比赛则不填写比赛编号。大小写错误可能导致奇怪问题！',
    validateInput: s => (pidValidate.test(s) ? undefined : '格式错误'),
    ignoreFocusOut: true
  });
  if (res === undefined) return undefined;
  const [pid, cid] = res.split(' ');
  return { pid, cid: cid ? parseInt(cid) : undefined };
}

export default function registerViewProblem(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'luogu.searchProblem',
      async (id?: { pid: string; cid?: number }) => {
        if (!id) if (!(id = await askForPid())) return false;
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
            return e;
          });
      }
    )
  );
}
