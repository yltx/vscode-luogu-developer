import SuperCommand from '../SuperCommand';
import {
  searchUser,
  fetchFollowedBenben,
  getStatus,
  loadUserIcon,
  fetchUserBenben,
  fetchAllBenben,
  postBenben,
  deleteBenben
} from '@/utils/api';
import { getDistFilePath } from '@/utils/html';
import { UserStatus } from '@/utils/shared';
import * as vscode from 'vscode';
import { BenbenData } from '@w/webviewMessage';
import { getUsernameColor } from '@/utils/workspaceUtils';
import useWebviewResponseHandle from '@/utils/webviewResponse';
import { Activity, UserSummary } from 'luogu-api';
import { configFile } from '@/utils/files';
import { isError } from 'lodash';

async function getFollowedBenben(
  page = 1,
  userinfoCache?: Map<number, UserSummary>
) {
  const res = await fetchFollowedBenben(page);
  res.data = res.data.filter(x => x.type === 1);
  const users = await Promise.all(
    res.data.map(async x => {
      const d =
        userinfoCache?.get(x.uid) ||
        (await searchUser(x.uid.toString())).users[0];
      if (!d) throw Error('Load userinfo failed.');
      return d;
    })
  );
  const images = await Promise.all(res.data.map(x => loadUserIcon(x.uid)));
  return Array.from<unknown, BenbenData>(
    { length: res.data.length },
    (_, i) => ({
      user: {
        icon: images[i].toString('base64'),
        uid: users[i].uid,
        name: users[i].name,
        ccfLevel: users[i].ccfLevel,
        color: getUsernameColor(users[i].color),
        badge: users[i].badge || undefined
      },
      time: (time => {
        // from UTF-8 to local time
        const t = new Date(time);
        return (
          t.getTime() - 8 * 60 * 60 * 1000 + t.getTimezoneOffset() * 60 * 1000
        );
      })(res.data[i].time.date),
      comment: res.data[i].comment,
      id: -1
    })
  );
}
async function getUserBenben(page = 1, user?: number) {
  const res = (await fetchUserBenben(page, user)).feeds.result;
  return await Promise.all(
    Object.keys(res)
      .sort((x, y) => +x - +y)
      .map(x => res[x] as Activity)
      .filter(d => d.type == 1)
      .map<Promise<BenbenData>>(async d => ({
        comment: d.content,
        time: d.time * 1000,
        user: {
          uid: d.user.uid,
          badge: d.user.badge || undefined,
          name: d.user.name,
          color: getUsernameColor(d.user.color),
          ccfLevel: d.user.ccfLevel,
          icon: (await loadUserIcon(d.user.uid)).toString('base64'),
          isMe: d.user.uid === +configFile.uid
        },
        id: d.id
      }))
  );
}
async function getAllBenben(page = 1) {
  const res = (await fetchAllBenben(page)).feeds.result;
  return await Promise.all(
    Object.keys(res)
      .sort((x, y) => +x - +y)
      .map(x => res[x] as Activity)
      .filter(d => d.type == 1)
      .map<Promise<BenbenData>>(async d => ({
        comment: d.content,
        time: d.time * 1000,
        user: {
          uid: d.user.uid,
          badge: d.user.badge || undefined,
          name: d.user.name,
          color: getUsernameColor(d.user.color),
          ccfLevel: d.user.ccfLevel,
          icon: (await loadUserIcon(d.user.uid)).toString('base64'),
          isMe: d.user.uid === +configFile.uid
        },
        id: d.id
      }))
  );
}

async function getMode() {
  interface PickUID extends vscode.QuickPickItem {
    label: `用户 ${string} 的动态`;
    id: string;
  }
  interface PickMe extends vscode.QuickPickItem {
    label: '我发布的';
  }
  interface PickFollowed extends vscode.QuickPickItem {
    label: '我关注的';
  }
  interface PickAll extends vscode.QuickPickItem {
    label: '全网动态';
  }
  const input = vscode.window.createQuickPick<
    PickMe | PickAll | PickFollowed | PickUID
  >();
  input.placeholder = '输入一个用户名/UID，或从下方选择一项';
  input.items = [
    { label: '我发布的' },
    { label: '我关注的' },
    { label: '全网动态' }
  ];
  input.onDidChangeValue(s => {
    if (s === '')
      input.items = [
        { label: '我发布的' },
        { label: '我关注的' },
        { label: '全网动态' }
      ];
    else input.items = [{ label: `用户 ${s} 的动态`, id: s }];
  });
  return new Promise<string | 0 | 1 | 2 | undefined>(resolve => {
    input.onDidChangeSelection(e => {
      resolve(
        e[0].label === '全网动态'
          ? 0
          : e[0].label === '我关注的'
            ? 1
            : e[0].label === '我发布的'
              ? 2
              : e[0].id
      );
    });
    input.onDidHide(() => resolve(undefined));
    input.show();
  }).then(x => {
    input.dispose();
    return x;
  });
}

export default new SuperCommand({
  onCommand: 'benben',
  handle: async () => {
    while (!globalThis.init) {
      continue;
    }
    try {
      if ((await getStatus()) === UserStatus.SignedOut.toString()) {
        vscode.window.showErrorMessage('未登录');
        return;
      }
    } catch (err) {
      console.error(err);
      vscode.window.showErrorMessage(`${err}`);
      return;
    }
    const mode = await getMode();
    if (mode === undefined) return;
    const user =
      typeof mode === 'string' ? (await searchUser(mode)).users[0] : undefined;
    if (user === null) {
      vscode.window.showErrorMessage('用户不存在');
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      `benben`,
      `犇犇 - ${mode === 0 ? '全网动态' : mode === 1 ? '我关注的' : mode === 2 ? '我发布的' : `${user!.name} 的动态`}`,
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(globalThis.resourcesPath),
          vscode.Uri.file(globalThis.distPath)
        ]
      }
    );
    const userinfoCache =
      mode === '我关注的' ? new Map<number, UserSummary>() : undefined;
    const initHTML = () => {
      panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
        <script defer src=${getDistFilePath(panel.webview, 'benben.js')}></script>
        <div id="app"></div>
        </body>
        </html>
    `;
    };
    useWebviewResponseHandle(panel.webview, {
      BenbenUpdate: data => {
        if (mode === 1) return getFollowedBenben(data.page, userinfoCache);
        else if (mode === 2) return getUserBenben(data.page);
        else if (mode === 0) return getAllBenben(data.page);
        else return getUserBenben(data.page, user!.uid);
      },
      BenbenSend: async data => {
        try {
          const res = await postBenben(data.comment);
          if (res.status !== 200) throw res;
        } catch (err) {
          vscode.window.showErrorMessage(
            `发送犇犇失败：${(err as unknown as { message: string }).message}`
          );
          throw new Error((err as unknown as { message: string }).message, {
            cause: isError(err) ? err : undefined
          });
        }
      },
      BenbenDelete: async data => {
        try {
          const res = await deleteBenben(data.id);
          if (res.status !== 200) throw res;
        } catch (err) {
          vscode.window.showErrorMessage(
            `发送犇犇失败：${(err as unknown as { message: string }).message}`
          );
          throw new Error((err as unknown as { message: string }).message, {
            cause: isError(err) ? err : undefined
          });
        }
      }
    });
    initHTML();
  }
});
