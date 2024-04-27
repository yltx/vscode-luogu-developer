import SuperCommand from '../SuperCommand';
import * as vscode from 'vscode';
import { UserStatus } from '@/utils/shared';
import showRecord from '@/utils/showRecord';
import { fetchRecords, getStatus } from '@/utils/api';

export default new SuperCommand({
  onCommand: 'lastRecord',
  handle: async () => {
    await globalThis.waitinit;
    try {
      if ((await getStatus()) === UserStatus.SignedOut.toString()) {
        vscode.window.showErrorMessage('未登录');
        return;
      }
    } catch (err) {
      console.error(err);
      vscode.window.showErrorMessage(`${err}`);
      return;
    }
    const records = await fetchRecords();
    if (records?.currentData?.records?.result?.length) {
      const rid = records.currentData.records.result[0].id as number;
      console.log(rid);
      await showRecord(rid);
    }
  }
});
