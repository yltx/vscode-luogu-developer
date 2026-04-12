import * as vscode from 'vscode';
import { getDistFilePath } from '@/utils/html';
import useWebviewResponseHandle from '@/utils/webviewResponse';
import {
  checkCookie,
  genLoginCookie,
  getCaptcha,
  getLoginCaptcha,
  login,
  searchUser,
  sendMail2fa,
  syncLogin,
  unlock
} from '@/utils/api';
import { isAxiosError } from 'axios';
import { promisify } from 'util';

export default async function showLoginView() {
  const panel = vscode.window.createWebviewPanel(
    'luogu.loginPanel',
    `洛谷 - 登录`,
    vscode.ViewColumn.Active,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.file(globalThis.resourcesPath),
        vscode.Uri.file(globalThis.distPath)
      ]
    }
  );
  let cookie = await genLoginCookie();
  let syncToken: string | undefined;
  let successful = false;
  useWebviewResponseHandle(panel.webview, {
    NeedLoginCaptcha: async () => ({
      captchaImage: (await getLoginCaptcha(cookie)).toString(
        'base64'
      )
    }),
    Need2faCaptcha: async () => ({
      captchaImage: (await getCaptcha(cookie)).toString('base64')
    }),
    PasswordLogin: data =>
      login(data.username, data.password, data.captcha, {
        ...cookie,
        uid: 0
      })
        .then(async x => {
          cookie = {
            uid: x.uid ?? cookie.uid,
            clientID: x.clientID ?? cookie.clientID,
            extraCookies: x.extraCookies
          };
          syncToken = x.syncToken;
          if (x.locked) return { type: '2fa' as const };
          cookie = await syncLogin(x.syncToken, cookie);
          return { type: undefined };
        })
        .then(x => {
          if (x.type === undefined) (successful = true), panel.dispose();
          return x;
        })
        .catch(err => {
          if (isAxiosError(err) && err.response)
            vscode.window.showErrorMessage(err.response.data.errorMessage);
          else {
            console.error('Login failed', err);
            if (err instanceof Error)
              vscode.window.showErrorMessage('Login failed', err.message);
            else vscode.window.showErrorMessage('Login failed');
          }
          return { type: 'error' };
        }),
    CookieLogin: async data => {
      const r = await checkCookie(data);
      if (r) {
        cookie = data;
        successful = true;
        panel.dispose();
      } else vscode.window.showErrorMessage('验证失败。');
      return { type: r ? undefined : 'error' };
    },
    clearLoginCookie: async () =>
      void ((cookie = await genLoginCookie()), (syncToken = undefined)),
    SendMailCode: async ({ captcha }) =>
      sendMail2fa(captcha, cookie)
        .then(
          () => (
            vscode.window.showInformationMessage('发送成功'),
            {
              type: undefined
            }
          )
        )
        .catch(err => {
          if (!isAxiosError(err) || !err.response)
            throw new Error('Unknown Error', { cause: err });
          vscode.window.showErrorMessage(
            '发送验证码时出现错误：' + err.response.data.errorMessage
          );
          return { type: 'error' };
        }),
    '2fa': async ({ code }) =>
      await unlock(code, cookie)
        .then(async () => {
          if (syncToken) cookie = await syncLogin(syncToken, cookie);
          successful = true;
          panel.dispose();
          return { type: undefined };
        })
        .catch(err => {
          if (isAxiosError(err) && err.response)
            vscode.window.showErrorMessage(err.response.data.errorMessage);
          else {
            console.error('Check 2fa failed', err);
            if (err instanceof Error)
              vscode.window.showErrorMessage('Check 2fa failed', err.message);
            else vscode.window.showErrorMessage('Check 2fa failed');
          }
          return { type: 'error' };
        })
  });
  panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
        <script defer src=${getDistFilePath(panel.webview, 'webview-login.js')}></script>
        <div id="app"></div>
        </body>
        </html>
    `;
  await promisify(panel.onDidDispose)();
  if (successful) {
    const userSummary = await searchUser(cookie.uid.toString(), cookie)
      .then(result =>
        result.users.find(
          user => user !== null && user.uid === cookie.uid
        )
      )
      .catch(() => null);
    return {
      uid: cookie.uid,
      clientID: cookie.clientID,
      extraCookies: cookie.extraCookies,
      name: userSummary?.name ?? cookie.uid.toString()
    };
  }
  else return null;
}
