export type WebviewRequestMessage<T extends string, D> = {
  type: T;
  data: D;
  uuid: string;
};
export type WebviewResponseMessage<D> = {
  data: D;
  error?: string;
  uuid: string;
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

type MessageTypes = MessageTypesBase<
  // Add new types in this array.
  [BenbenUpdateMessageType, BenbenSendMessageType, BenbenDeleteMessageType]
>;
export default MessageTypes;
