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

export default function registerLogin(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand('luogu.signin', Login);
  context.subscriptions.push(
    vscode.authentication.registerAuthenticationProvider(
      LuoguAuthProvider.ProviderId,
      'Luogu',
      (globalThis.luogu.authProvider = new LuoguAuthProvider(context.secrets))
    )
  );
}
