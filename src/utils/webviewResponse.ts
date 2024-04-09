import MessageTypes from '@w/webviewMessage';
import vscode from 'vscode';

type MaybePromise<T> = T | PromiseLike<T>;

/**
 * 重新封装 vscode webview message，方便在需要以类似 http 的形式获取返回值的形式使用。这是用于处理请求的函数。
 * @param handles 一个对象，其中请求类型字符串为键，请求体为一个接受请求体、返回请求类型的函数
 */
export default function useWebviewResponseHandle<K extends keyof MessageTypes>(
  webview: vscode.Webview,
  handles: {
    [M in K]: (
      data: MessageTypes[M]['request']['data']
    ) => MaybePromise<MessageTypes[M]['response']['data']>;
  }
) {
  webview.onDidReceiveMessage(
    async (message: MessageTypes[keyof MessageTypes]['request']) => {
      if (handles[message.type])
        try {
          webview.postMessage({
            data: await handles[message.type](message.data),
            uuid: message.uuid
          } as MessageTypes[keyof MessageTypes]['response']);
        } catch (error) {
          webview.postMessage({
            error,
            uuid: message.uuid
          });
        }
    }
  );
}
