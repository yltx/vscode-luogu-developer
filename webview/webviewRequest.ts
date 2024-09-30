import MessageTypes, {
  WebviewRequestMessage,
  WebviewResponseMessage
} from '@w/webviewMessage';
import { UUID } from 'crypto';

declare function acquireVsCodeApi(): {
  postMessage<T extends WebviewRequestMessage<string, unknown>>(data: T): void;
};
export const vscode = acquireVsCodeApi();

const p = new Map<UUID, [(data: unknown) => void, (err: string) => void]>();

/**
 * 重新封装 vscode webview message，方便在需要以类似 http 的形式获取返回值的形式使用。这是用于发送请求的服务。
 * @param type 请求类型，新类型可以在 @w/webviewMessage.d.ts 中添加
 * @param data 请求数据体
 * @returns 请求结果的 Promise
 */
export default function send<K extends keyof MessageTypes>(
  type: K,
  data: MessageTypes[K]['request']['data']
) {
  type R = MessageTypes[K]['response']['data'];
  const uuid = crypto.randomUUID();
  vscode.postMessage({ type, data, uuid });
  return new Promise<R>((resolve, reject) =>
    p.set(uuid, [data => resolve(data as R), err => reject(new Error(err))])
  );
}
window.addEventListener(
  'message',
  ({ data }: MessageEvent<WebviewResponseMessage<unknown>>) => {
    const f = p.get(data.uuid);
    if (f) {
      p.delete(data.uuid);
      data.error ? f[1](data.error) : f[0](data.data);
    }
  }
);
