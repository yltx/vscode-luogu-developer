/* eslint-disable no-var */
import LuoguAuthProvider from './commands/login/auth';
declare global {
  var waitinit: Promise<void>;
  var version: string;
  var authProvider: LuoguAuthProvider;
  interface Cookie {
    uid: number;
    clientID: string;
  }
}
