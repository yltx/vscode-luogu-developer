import { UUID } from 'crypto';

export type WebviewRequestMessage<T extends string, D> = {
  type: T;
  data: D;
  uuid: UUID;
};
export type WebviewResponseMessage<D> = {
  data: D;
  error?: string;
  uuid: UUID;
};
export type WebviewMessage<
  REQ extends WebviewRequestMessage<string, unknown>,
  RES extends WebviewResponseMessage<unknown>
> = {
  request: REQ;
  response: RES;
};
type MessageTypesBase<T> = T extends []
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  : T extends [infer First, ...infer Other]
    ? First extends WebviewMessage<infer REQ, WebviewResponseMessage<unknown>>
      ? {
          [K in REQ['type']]: First;
        } & MessageTypesBase<Other>
      : never
    : never;

export interface UserInfo {
  uid: number;
  name: string;
  ccfLevel: number;
  color: string;
  badge?: string;
  isMe?: boolean;
}
export type UserInfoWithIcon = UserInfo & { icon: string };
export interface BenbenData {
  user: UserInfoWithIcon;
  time: number;
  comment: string;
  id: number;
}
type BenbenUpdateMessageType = WebviewMessage<
  WebviewRequestMessage<'BenbenUpdate', { page: number }>,
  WebviewResponseMessage<BenbenData[]>
>;
type BenbenSendMessageType = WebviewMessage<
  WebviewRequestMessage<'BenbenSend', { comment: string }>,
  WebviewResponseMessage<void>
>;
type BenbenDeleteMessageType = WebviewMessage<
  WebviewRequestMessage<'BenbenDelete', { id: number }>,
  WebviewResponseMessage<void>
>;
type PasswordLoginMessageType = WebviewMessage<
  WebviewRequestMessage<
    'PasswordLogin',
    { username: string; password: string; captcha: string }
  >,
  WebviewResponseMessage<{ type: 'error' | '2fa' | undefined }>
>;
type NeedCaptchaMessageType = WebviewMessage<
  WebviewRequestMessage<'NeedCaptcha', void>,
  WebviewResponseMessage<{ captchaImage: string }>
>;
type CookieLoginMessageType = WebviewMessage<
  WebviewRequestMessage<'CookieLogin', Cookie>,
  WebviewResponseMessage<{ type: 'error' | undefined }>
>;
type SendMailCodeMessageType = WebviewMessage<
  WebviewRequestMessage<'SendMailCode', { captcha: string }>,
  WebviewResponseMessage<{ type: 'error' | undefined }>
>;
type Login2faMessageType = WebviewMessage<
  WebviewRequestMessage<'2fa', { code: string }>,
  WebviewResponseMessage<{ type: 'error' | undefined }>
>;
type clearLoginCookieMessageType = WebviewMessage<
  WebviewRequestMessage<'clearLoginCookie', void>,
  WebviewResponseMessage<void>
>;

type MessageTypes = MessageTypesBase<
  // Add new types in this array.
  [
    BenbenUpdateMessageType,
    BenbenSendMessageType,
    BenbenDeleteMessageType,
    NeedCaptchaMessageType,
    PasswordLoginMessageType,
    CookieLoginMessageType,
    SendMailCodeMessageType,
    Login2faMessageType,
    clearLoginCookieMessageType
  ]
>;
export default MessageTypes;
