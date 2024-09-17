import { submitCode } from '@/utils/api';
import showRecord from '@/utils/showRecord';
import {
  askForLanguage,
  askForPid,
  guessProblemId,
  processAxiosError
} from '@/utils/workspaceUtils';
import * as vscode from 'vscode';

export default function registerSubmitFeature(
  context: vscode.ExtensionContext
) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'luogu.sumbitCode',
      async (
        problem?:
          | import('@/features/history/historyItem').ProblemHistoryItem
          | { pid: string; cid?: number }
      ) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showErrorMessage(
            '您没有打开任何文件，请打开一个文件后重试'
          );
          return false;
        }
        if (!problem)
          if (
            !(problem = await askForPid(
              guessProblemId(editor.document.fileName)
            ))
          )
            return false;
        if ('type' in problem)
          problem = { pid: problem.pid, cid: problem.contest?.contestId };
        const lang = await askForLanguage(
          editor.document.fileName.split('.').pop()!
        );
        if (lang === undefined) return false;
        vscode.window.showInformationMessage('正在提交……');
        try {
          const rid = await submitCode(
            problem,
            editor.document.getText(),
            lang.id,
            lang.O2
          );
          showRecord(rid);
          return true;
        } catch (e) {
          processAxiosError('提交代码')(e);
          return new Error('Error when submit', { cause: e });
        }
      }
    )
  );
}
