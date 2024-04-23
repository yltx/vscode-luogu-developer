import * as vscode from 'vscode';
import showLoginView from './ui';
import { randomUUID } from 'crypto';

class LuoguSession implements vscode.AuthenticationSession {
  readonly id = randomUUID();
  readonly accessToken: string;
  readonly account: vscode.AuthenticationSessionAccountInformation;
  readonly scopes = [];
  constructor(data: { uid: number; clientID: string; name: string }) {
    this.accessToken = data.clientID;
    this.account = { id: data.uid.toString(), label: data.name };
  }
}

export default class LuoguAuthProvider
  implements vscode.AuthenticationProvider
{
  static readonly ProviderId = 'luogu-auth';
  static readonly SecretKey = 'luogu-auth';
  private _sessionChangeEmitter =
    new vscode.EventEmitter<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent>();
  private cache: LuoguSession | undefined;
  private cacheLock: Promise<void>;
  constructor(private readonly secretStorage: vscode.SecretStorage) {
    let finishlock = () => {};
    this.cacheLock = new Promise(resolve => (finishlock = resolve));
    this.secretStorage
      .get(LuoguAuthProvider.SecretKey)
      .then(x => ((this.cache = x ? JSON.parse(x) : undefined), finishlock()));
    this.secretStorage.onDidChange(async e => {
      let finishlock = () => {};
      this.cacheLock = new Promise(resolve => (finishlock = resolve));
      if (e.key !== LuoguAuthProvider.SecretKey) return;
      const x = await this.secretStorage.get(LuoguAuthProvider.SecretKey);
      if (x)
        this._sessionChangeEmitter.fire({
          added: [(this.cache = JSON.parse(x))],
          removed: [],
          changed: []
        });
      else if (this.cache)
        this._sessionChangeEmitter.fire({
          added: [],
          changed: [],
          removed: [this.cache]
        }),
          (this.cache = undefined);
      finishlock();
    });
  }
  get onDidChangeSessions(): vscode.Event<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent> {
    return this._sessionChangeEmitter.event;
  }
  async createSession(): Promise<vscode.AuthenticationSession> {
    await this.cacheLock;
    if (this.cache) return this.cache;
    const user = await showLoginView();
    const session = new LuoguSession(user);
    await this.secretStorage.store(
      LuoguAuthProvider.SecretKey,
      JSON.stringify(session)
    );
    return session;
  }
  async getSessions(): Promise<readonly vscode.AuthenticationSession[]> {
    await this.cacheLock;
    return this.cache ? [this.cache] : [];
  }
  async removeSession(sessionId: string) {
    await this.cacheLock;
    if (this.cache) {
      if (this.cache.id === sessionId) {
        await this.secretStorage.delete(LuoguAuthProvider.SecretKey);
      }
    }
  }
  async user() {
    const t = await this.getSessions();
    if (t.length === 0) throw new Error('not logged in');
    return { uid: +t[0].account.id, name: t[0].account.label };
  }
  async cookie(): Promise<Cookie> {
    const t = await this.getSessions();
    if (t.length === 0) throw new Error('not logged in');
    return { uid: +t[0].account.id, clientID: t[0].accessToken };
  }
}
