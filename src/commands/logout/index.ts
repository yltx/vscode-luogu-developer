import SuperCommand from '../SuperCommand';
import { logout, getStatus, getErrorMessage } from '@/utils/api';
import { changeCookie } from '@/utils/files';
import { UserStatus } from '@/utils/shared';
import luoguStatusBar from '@/views/luoguStatusBar';

import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
globalThis.luoguPath = path.join(os.homedir(), '.luogu');

export default new SuperCommand({
	onCommand: 'signout',
	handle: async () => {
		while (!globalThis.init) {
			continue;
		}
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
		try {
			changeCookie({ uid: '', clientID: '' });
		} catch (err) {
			vscode.window.showErrorMessage('注销失败');
			throw err;
		}
		globalThis.islogged = false;
		luoguStatusBar.updateStatusBar(UserStatus.SignedOut);
		vscode.window.showInformationMessage('注销成功');
		// }
	}
});
