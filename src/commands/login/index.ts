import { login, unlock, fetchHomepage, genCookies } from '@/utils/api';
import SuperCommand from '../SuperCommand';
import luoguStatusBar from '@/views/luoguStatusBar';
import { UserStatus } from '@/utils/shared';
import { getUserCaptcha } from '@/utils/captcha';
import { debug } from '@/utils/debug';
import { changeCookieByCookies } from '@/utils/files';
import * as vscode from 'vscode';
import {
  DialogType,
  promptForOpenOutputChannelWithResult
} from '@/utils/uiUtils';

export default new SuperCommand({
  onCommand: 'signin',
  handle: async () => {
    while (!globalThis.init);
    const data = await fetchHomepage();
    if (data.currentUser !== undefined) {
      const result = await vscode.window.showInformationMessage(
        `您已登录用户 ${data.currentUser.name}，是否继续？`,
        { title: '是' },
        { title: '否' }
      );
      if (result?.title === '否') {
        return;
      } else {
        globalThis.islogged = false;
        luoguStatusBar.updateStatusBar(UserStatus.SignedOut);
      }
    } else genCookies();
    let continued = true;
    while (continued) {
      continued = false;
      const username = await vscode.window.showInputBox({
        placeHolder: '输入用户名',
        ignoreFocusOut: true
      });
      if (!username) {
        return;
      }
      const password = await vscode.window.showInputBox({
        placeHolder: '输入密码',
        ignoreFocusOut: true,
        password: true
      });
      if (!password) {
        return;
      }
      let flag = true;
      while (flag) {
        const captcha = await getUserCaptcha();
        if (!captcha) {
          debug('No captcha text');
          return;
        }
        await login(username, password, captcha.captchaText)
          .then(async r1 => {
            try {
              changeCookieByCookies(r1.headers['set-cookie']);
            } catch (err) {
              vscode.window.showErrorMessage('写入 cookie 时出现错误');
              throw err;
            }
            if (r1.data.locked) {
              const code = await vscode.window.showInputBox({
                placeHolder: '输入2FA验证码',
                ignoreFocusOut: true
              });
              if (!code) {
                return;
              }
              await unlock(code);
            }
            globalThis.init = true;
            globalThis.islogged = true;
            luoguStatusBar.updateStatusBar(UserStatus.SignedIn);
            vscode.window.showInformationMessage('登录成功');
            flag = false;
            return;
          })
          .catch(async err => {
            console.log(err);
            globalThis.init = true;
            if (err.response) {
              if (err.response.data.errorMessage === '验证码错误') {
                const res = await promptForOpenOutputChannelWithResult(
                  err.response.data.errorMessage,
                  DialogType.error
                );
                if (res?.title === '重试') {
                  return;
                } else {
                  flag = false;
                  return;
                }
              }
              const res = await promptForOpenOutputChannelWithResult(
                err.response.data.errorMessage,
                DialogType.error
              );
              if (res?.title === '重试') {
                continued = true;
                flag = false;
              } else {
                flag = false;
              }
            }
          });
      }
    }
  }
});
