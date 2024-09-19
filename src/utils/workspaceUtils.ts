import * as vscode from 'vscode';

import fs from 'fs';
import crypto from 'crypto';
import {
  languageList,
  Languages,
  ProblemState,
  stateColor,
  colorStyle,
  fileExtention,
  difficultyID,
  problemset,
  ArticleCategory,
  fileExtToLanguage,
  languageData,
  defaultLanguageVersion
} from '@/utils/shared';
import { isAxiosError } from 'axios';
import { parseProblemID } from './api';
import path from 'path';

export function getSelectedLanguage(
  selected: string = vscode.workspace
    .getConfiguration('luogu')
    .get<string>('defaultLanguage')!
): number {
  return Languages[selected];
}

export function getSelectedDifficulty(selected: string): number {
  return difficultyID[selected];
}

export function getSelectedProblemset(selected: string): string {
  return problemset[selected];
}

export function getStatusText(status: number): string {
  return ProblemState[status];
}

export function getStatusColor(status: number): string {
  return stateColor[status];
}
export function getLanauageFromExt(ext: string) {
  return fileExtention[ext] === undefined
    ? []
    : languageList[fileExtention[ext]];
}

export function getScoreColor(score: number): string {
  return score < 30
    ? 'rgb(231, 76, 60)'
    : score < 80
      ? 'rgb(243, 156, 17)'
      : 'rgb(82, 196, 26)';
}

export function getUsernameColor(color: string): string {
  return colorStyle[color];
}

export function getUserSvg(ccfLevel: number): string {
  if (ccfLevel === 0) {
    return '';
  }
  const green = `#52c41a`;
  const blue = `#3498db`;
  const gold = `#ffc116`;
  const color =
    ccfLevel >= 3 && ccfLevel <= 5
      ? green
      : ccfLevel >= 6 && ccfLevel <= 7
        ? blue
        : gold;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="${color}" style="margin-bottom: -3px;"><path d="M16 8C16 6.84375 15.25 5.84375 14.1875 5.4375C14.6562 4.4375 14.4688 3.1875 13.6562 2.34375C12.8125 1.53125 11.5625 1.34375 10.5625 1.8125C10.1562 0.75 9.15625 0 8 0C6.8125 0 5.8125 0.75 5.40625 1.8125C4.40625 1.34375 3.15625 1.53125 2.34375 2.34375C1.5 3.1875 1.3125 4.4375 1.78125 5.4375C0.71875 5.84375 0 6.84375 0 8C0 9.1875 0.71875 10.1875 1.78125 10.5938C1.3125 11.5938 1.5 12.8438 2.34375 13.6562C3.15625 14.5 4.40625 14.6875 5.40625 14.2188C5.8125 15.2812 6.8125 16 8 16C9.15625 16 10.1562 15.2812 10.5625 14.2188C11.5938 14.6875 12.8125 14.5 13.6562 13.6562C14.4688 12.8438 14.6562 11.5938 14.1875 10.5938C15.25 10.1875 16 9.1875 16 8ZM11.4688 6.625L7.375 10.6875C7.21875 10.8438 7 10.8125 6.875 10.6875L4.5 8.3125C4.375 8.1875 4.375 7.96875 4.5 7.8125L5.3125 7C5.46875 6.875 5.6875 6.875 5.8125 7.03125L7.125 8.34375L10.1562 5.34375C10.3125 5.1875 10.5312 5.1875 10.6562 5.34375L11.4688 6.15625C11.5938 6.28125 11.5938 6.5 11.4688 6.625Z"></path></svg>`;
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
}
export const cookieString = (c: Cookie) =>
  `_uid=${c.uid};__client_id=${c.clientID}`;
export function praseCookie(cookie: string[] | undefined) {
  const s: { uid?: number; clientID?: string } = {};
  if (cookie)
    for (const cookie_info of cookie) {
      if (cookie_info.match('_uid')?.index == 0) {
        const match_res = cookie_info.match('(?<==).*?(?=;)');
        if (match_res) s.uid = +match_res[0];
      }
      if (cookie_info.match('__client_id')?.index == 0) {
        const match_res = cookie_info.match('(?<==).*?(?=;)');
        if (match_res) s.clientID = match_res[0];
      }
    }
  return s;
}

export function getArticleCategory(x: number) {
  return ArticleCategory[x - 1];
}

export function processAxiosError(verb?: string) {
  if (verb === undefined) verb = '操作';
  return (x: unknown) => {
    if (isAxiosError(x) && x.response?.data)
      vscode.window.showErrorMessage(
        verb + '时出现错误：' + x.response.data.errorMessage
      );
    else if (x instanceof Error)
      vscode.window.showErrorMessage(verb + '时出现错误：' + x.message);
    else
      vscode.window.showErrorMessage(verb + '时出现错误，前往控制台查看详情。');
    console.error('Error when ' + verb, x);
  };
}

function matchCph(src: string) {
  const srcFileName = path.basename(src);
  const cphConfigPath = path.join(
    path.dirname(src),
    '.cph',
    `.${srcFileName}_${crypto.createHash('md5').update(src).digest('hex')}.prob`
  );
  try {
    const urlStr = JSON.parse(fs.readFileSync(cphConfigPath).toString()).url;
    if (typeof urlStr !== 'string') return undefined;
    const url = new URL(urlStr);
    if (
      url.host !== 'www.luogu.com.cn' ||
      !/^\/problem\/\w+$/.test(url.pathname)
    )
      return undefined;
    const cid = url.searchParams.get('contestId') ?? undefined;
    if (cid !== undefined && !/^\d+$/.test(cid)) return undefined;
    return {
      pid: url.pathname.slice(9),
      cid: cid ? +cid : undefined
    };
  } catch {
    return undefined;
  }
}

export function guessProblemId(src: string) {
  const x1 = matchCph(src);
  if (x1) return x1;
  const x2 = parseProblemID(path.basename(src));
  if (x2) return { pid: x2 };
  return undefined;
}

const pidValidate = /^\w+( \d+)?$/;
export async function askForPid(defaultPid?: { pid: string; cid?: number }) {
  const defaultStr =
    defaultPid &&
    defaultPid?.pid + (defaultPid.cid ? ` ${defaultPid.cid}` : '');
  const res = await vscode.window.showInputBox({
    title: '输入题目编号和比赛编号',
    placeHolder:
      '题目编号和比赛编号间用空格分隔，不属于比赛则不填写比赛编号。大小写错误可能导致奇怪问题！',
    validateInput: s => (pidValidate.test(s) ? undefined : '格式错误'),
    ignoreFocusOut: true,
    value: defaultStr
  });
  if (res === undefined) return undefined;
  const [pid, cid] = res.split(' ');
  return { pid, cid: cid ? parseInt(cid) : undefined };
}

export async function askForLanguage(fileExt: string) {
  // shit anyscript
  let nowLangStr: undefined | keyof typeof languageData = undefined;
  for (;;) {
    if (nowLangStr === undefined) {
      const guessedLanguage =
        fileExt in fileExtToLanguage
          ? (fileExtToLanguage[fileExt] as keyof typeof languageData)
          : undefined;
      if (
        guessedLanguage &&
        vscode.workspace
          .getConfiguration('luogu')
          .get('alwaysUseDefaultLanguageVersion', false)
      ) {
        nowLangStr = guessedLanguage;
        continue;
      }
      const quickPick = vscode.window.createQuickPick();
      quickPick.title = '选择语言';
      quickPick.ignoreFocusOut = true;
      quickPick.items = Object.keys(languageData).map(x => ({ label: x }));
      if (guessedLanguage !== undefined)
        quickPick.activeItems = [
          quickPick.items.find(x => x.label === guessedLanguage)!
        ];
      quickPick.show();
      const res = await new Promise<string | undefined>(resolve => {
        quickPick.onDidChangeSelection(item => resolve(item[0].label));
        quickPick.onDidHide(() => resolve(undefined));
      });
      quickPick.dispose();
      if (res === undefined) return undefined;
      nowLangStr = res as keyof typeof languageData;
    } else {
      const nowLangData = languageData[nowLangStr];
      if ('id' in nowLangData) return { id: nowLangData.id };
      const defaultVersion = (vscode.workspace
        .getConfiguration('luogu')
        .get('defaultLanguageVersion', {})[nowLangStr] ??
        defaultLanguageVersion[nowLangStr]) as string;
      if (
        nowLangData[defaultVersion] &&
        vscode.workspace
          .getConfiguration('luogu')
          .get('alwaysUseDefaultLanguageVersion', false)
      )
        return nowLangData[defaultVersion] as { id: number; O2?: true };
      const quickPick = vscode.window.createQuickPick();
      (quickPick.title = `选择 ${nowLangStr} 版本`),
        (quickPick.ignoreFocusOut = true),
        (quickPick.placeholder = '按下 Esc 选择其他语言');
      quickPick.items = Object.keys(nowLangData).map(x => ({ label: x }));
      const defaultIndex = quickPick.items.findIndex(
        x => x.label === defaultVersion
      );
      if (defaultIndex === -1)
        vscode.window.showWarningMessage(
          `${nowLangStr} 的默认语言版本设置无效！`
        );
      else quickPick.activeItems = [quickPick.items[defaultIndex]];
      quickPick.show();
      const res = await new Promise<string | undefined>(resolve => {
        quickPick.onDidChangeSelection(item => resolve(item[0].label));
        quickPick.onDidHide(() => resolve(undefined));
      });
      quickPick.dispose();
      if (res === undefined) {
        nowLangStr = undefined;
        continue;
      }
      console.assert(res in nowLangData);
      return nowLangData[res] as { id: number; O2?: true };
    }
  }
}
