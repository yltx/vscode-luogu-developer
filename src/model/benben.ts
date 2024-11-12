import { UserInfoWithIcon } from './user';

export default class BenbenData {
  user: UserInfoWithIcon;
  time: number;
  comment: string;
  id: number;
  constructor(benben: import('luogu-api').Activity) {
    this.comment = benben.content;
    this.time = benben.time * 1000;
    this.user = new UserInfoWithIcon(benben.user);
    this.id = benben.id;
  }
}
