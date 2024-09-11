/* eslint-disable no-var */
import LuoguAuthProvider from './features/login/auth';
import HistoryItem from './features/history/historyItem';
declare global {
  namespace luogu {
    var waitinit: Promise<void>;
    var version: string;
    var authProvider: LuoguAuthProvider;
    var insertHistory: (value: HistoryItem) => void;
  }
  interface Cookie {
    uid: number;
    clientID: string;
  }
  type MaybeThenable<T> = T | Thenable<T>;
}

interface vscodeContext {
  luoguLoginStatus: boolean;
}

declare module 'vscode' {
  namespace commands {
    function executeCommand<K extends keyof vscodeContext>(
      command: 'setContext',
      contextKey: K,
      contextValue: vscodeContext[K]
    ): void;
    function executeCommand(
      command: 'luogu.searchProblem',
      id?: { pid: string; cid?: number }
    ): Thenable<unknown>;
  }
}
