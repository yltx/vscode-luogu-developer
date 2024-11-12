import { colorStyle } from '@/utils/shared';

export class UserInfo {
  uid: number;
  name: string;
  ccfLevel: number;
  color: string;
  badge?: string;
  constructor(
    user: import('luogu-api').UserSummary,
    public isMe?: boolean
  ) {
    this.uid = user.uid;
    this.name = user.name;
    this.ccfLevel = user.ccfLevel;
    this.color = colorStyle[user.color];
    this.badge = user.badge || undefined;
  }
}
export class UserInfoWithIcon extends UserInfo {
  icon: string;
  constructor(
    user: import('luogu-api').UserSummary,
    public isMe?: boolean
  ) {
    super(user, isMe);
    this.icon = user.avatar;
  }
}
