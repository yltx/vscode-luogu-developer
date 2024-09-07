/* eslint-disable no-var */
import LuoguAuthProvider from './commands/login/auth';
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
