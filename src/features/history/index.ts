import * as vscode from 'vscode';
import historyTreeviewProvider from './treeviewProvider';
import { getStorage, setStorage } from '@/utils/storage';
import {
  getProblemData,
  searchContest,
  searchTrainingdetail
} from '@/utils/api';

const globalStateKey = 'luogu.history';
export default function registerHistory(context: vscode.ExtensionContext) {
  globalThis.luogu.insertHistory = item =>
    void context.globalState.update(globalStateKey, item);
  const view = new historyTreeviewProvider(
    () => getStorage(context, 'history'),
    x => setStorage(context, 'history', x)
  );
  globalThis.luogu.historyTreeviewProvider = view;
  vscode.window.registerTreeDataProvider('luogu.history', view);
  context.subscriptions.push(view);

  context.subscriptions.push(
    vscode.commands.registerCommand('luogu.history.refresh', async () => {
      const items = await getStorage(context, 'history');
      const seen = new Map<string, (typeof items)[number]>();
      for (const item of items) {
        let key: string;
        if (item.type === 'problem')
          key = `pid:${item.pid}${item.contest ? `:contest:${item.contest.contestId}` : ''}`;
        else if (item.type === 'contest') key = `contest:${item.contestId}`;
        else key = `training:${item.trainingId}`;
        seen.set(key, item);
      }
      const refreshed = [...seen.values()];
      for (const item of refreshed) {
        try {
          if (item.type === 'problem') {
            const data = await getProblemData(
              item.pid,
              item.contest?.contestId
            );
            item.title = data.problem.title ?? data.problem.content.name;
          } else if (item.type === 'contest') {
            const data = await searchContest(item.contestId);
            item.title = data.contest.name;
          } else if (item.type === 'training') {
            const data = await searchTrainingdetail(item.trainingId);
            item.title = (data.training as any).name ?? data.training.title;
          }
        } catch {}
      }
      setStorage(context, 'history', refreshed);
      view.refresh();
    }),
    vscode.commands.registerCommand('luogu.history.clear', async () => {
      const result = await vscode.window.showWarningMessage(
        '确定要清空所有浏览记录吗？',
        { modal: true },
        '确定'
      );
      if (result === '确定') {
        view.clear();
      }
    })
  );
}
