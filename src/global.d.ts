/* eslint-disable no-var */
import LuoguAuthProvider from './features/login/auth';
import HistoryItem from './features/history/historyItem';
import historyTreeviewProvider from './features/history/treeviewProvider';
declare global {
  namespace luogu {
    var waitinit: Promise<void>;
    var version: string;
    var authProvider: LuoguAuthProvider;
    var historyTreeviewProvider: historyTreeviewProvider;
    var insertHistory: (value: HistoryItem) => void;
    var lastViewProblem: { pid: string; cid?: number } | undefined;
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

declare module 'vscode' {
  namespace luogu {}
}
