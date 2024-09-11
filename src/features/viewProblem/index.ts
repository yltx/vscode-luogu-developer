import { getProblemData } from '@/utils/api';
import { processAxiosError } from '@/utils/workspaceUtils';
import * as vscode from 'vscode';
import showProblemWebview from './webview';

async function askForPid() {
  const res = await vscode.window.showInputBox({
    title: '输入题目编号和比赛编号',
    placeHolder: '题目编号和比赛编号间用空格分隔，不属于比赛则不填写比赛编号',
    validateInput: s => (/^\w+( \d+)?$/.test(s) ? undefined : '格式错误'),
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
