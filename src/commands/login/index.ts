import SuperCommand from '../SuperCommand';
import LuoguAuthProvider from './auth';
import * as vscode from 'vscode';

export const Login = async () => {
  const session = await vscode.authentication.getSession(
    LuoguAuthProvider.ProviderId,
    [],
    { createIfNone: true }
  );
  vscode.window.showInformationMessage(`${session.account.label} 登录成功。`);
};

export default new SuperCommand({
  onCommand: 'signin',
  handle: Login,
  onactivate: context => {
    context.subscriptions.push(
      vscode.authentication.registerAuthenticationProvider(
        LuoguAuthProvider.ProviderId,
        'Luogu',
        (globalThis.authProvider = new LuoguAuthProvider(context.secrets))
      )
    );
  }
});
