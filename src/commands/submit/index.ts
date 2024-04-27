import SuperCommand from '../SuperCommand';
import * as vscode from 'vscode';
import { UserStatus, Languages } from '@/utils/shared';
import * as path from 'path';
import {
  getSelectedLanguage,
  getLanauageFromExt
} from '@/utils/workspaceUtils';
import { getStatus, parseProblemID, submitCode } from '@/utils/api';
import showRecord from '@/utils/showRecord';

export default new SuperCommand({
  onCommand: 'sumbitCode',
  handle: async () => {
    await globalThis.waitinit;
    const edtior = vscode.window.activeTextEditor;
    if (!edtior) {
      vscode.window.showErrorMessage(
        '您没有打开任何文件，请打开一个文件后重试'
      );
      return;
    }
    try {
      if ((await getStatus()) === UserStatus.SignedOut.toString()) {
        vscode.window.showErrorMessage('您没有登录，请先登录');
        return;
      }
    } catch (err) {
      console.error(err);
      vscode.window.showErrorMessage(`${err}`);
      return;
    }
    const text = edtior.document.getText();
    const filePath = edtior.document.fileName;
    const fileFName = path.parse(filePath).base;
    const fileExt = path.parse(filePath).ext.slice(1);
    console.log(fileExt);
    const languages: string[] = getLanauageFromExt(fileExt);

    console.log(languages);

    const O2 = vscode.workspace
      .getConfiguration('luogu')
      .get<boolean>('alwaysEnableO2')
      ? true
      : await vscode.window
          .showQuickPick(['否', '是'], {
            placeHolder: '是否开启O2优化 (非 C/C++/Pascal 切勿开启)'
          })
          .then(ans => (ans === undefined ? undefined : ans === '是'));
    if (O2 === undefined) {
      return;
    }
    // tslint:disable-next-line: strict-type-predicates
    // const langs = Object.keys(Languages).filter(k => typeof Languages[k as any] === 'number');
    const selectedLanguage = vscode.workspace
      .getConfiguration('luogu')
      .get<string>('defaultLanguage')!;
    const langs: string[] = [];
    if (languages.indexOf(selectedLanguage) !== -1) {
      langs.push(selectedLanguage);
    }
    for (const item in Languages) {
      if (isNaN(Number(item))) {
        if (languages.indexOf(item) !== -1 && item !== selectedLanguage) {
          langs.push(item);
        }
      }
    }
    for (const item in Languages) {
      if (isNaN(Number(item))) {
        if (item === 'Auto' && languages.indexOf(item) === -1) {
          langs.push(item);
        }
      }
    }
    for (const item in Languages) {
      if (isNaN(Number(item))) {
        if (item !== 'Auto' && languages.indexOf(item) === -1) {
          langs.push(item);
        }
      }
    }
    const selected = vscode.workspace
      .getConfiguration('luogu')
      .get<boolean>('showSelectLanguageHint')
      ? await vscode.window.showQuickPick(langs).then(value => {
          if (value === undefined) {
            return undefined;
          }
          const v = getSelectedLanguage(value);
          return v === -1 || !v ? 0 : v;
        })
      : getSelectedLanguage(selectedLanguage);
    if (selected === undefined) {
      return;
    }
    const defaultID = await parseProblemID(fileFName);

    const id =
      vscode.workspace
        .getConfiguration('luogu')
        .get<boolean>('checkFilenameAsProblemID') && defaultID !== ''
        ? defaultID
        : await vscode.window.showInputBox({
            placeHolder: '输入提交到的题目ID',
            ignoreFocusOut: true,
            value: defaultID,
            validateInput: s => (s && s.trim() ? undefined : '输入不能为空')
          });
    if (!id) {
      return;
    }
    let rid: number;
    try {
      vscode.window.showInformationMessage(`${fileFName} 正在提交到 ${id}...`);
      rid = await submitCode(id, text, selected, O2);
      await showRecord(rid as number);
    } catch (err) {
      vscode.window.showInformationMessage('提交失败');
      vscode.window.showErrorMessage(`${err}`);
      console.error(err);
    }
  }
});
