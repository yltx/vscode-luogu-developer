import SuperCommand from '../SuperCommand';
import * as vscode from 'vscode';
import { getStatus, searchUser, parseUID, getErrorMessage } from '@/utils/api';
import luoguStatusBar from '@/views/luoguStatusBar';
import { UserStatus } from '@/utils/shared';
import {
	promptForOpenOutputChannelWithResult,
	DialogType
} from '@/utils/uiUtils';
import { changeCookie } from '@/utils/files';
import * as os from 'os';
import * as path from 'path';

export default new SuperCommand({
	onCommand: 'cookieslogin',
	handle: async () => {
		while (!globalThis.init) {
			continue;
		}
		let flag = true;
		while (flag) {
			const keyword = await vscode.window.showInputBox({
				placeHolder: '输入用户名/uid（中文用户名有bug）',
				ignoreFocusOut: true
			});
			if (!keyword) {
				return;
			}
			let uid = await parseUID(keyword);
			console.log(uid);
			if (uid.length !== keyword.length) {
				uid = (await searchUser(keyword))['users'][0]['uid'];
				console.log(uid);
				if (!uid) {
					const res = await promptForOpenOutputChannelWithResult(
						'用户不存在',
						DialogType.error
					);
					if (res?.title === '重试') {
						continue;
					} else {
						break;
					}
				}
			}
			const clientID = await vscode.window.showInputBox({
				placeHolder: '输入 clientID',
				ignoreFocusOut: true,
				password: true
			});
			if (!clientID) {
				return;
			}
			try {
				changeCookie({ uid, clientID });
			} catch (err) {
				vscode.window.showErrorMessage('写入文件时出现错误');
				throw err;
			}
			(async status => {
				if (status === UserStatus.SignedOut.toString()) {
					globalThis.islogged = false;
					luoguStatusBar.updateStatusBar(UserStatus.SignedOut);
					return promptForOpenOutputChannelWithResult(
						'登录失败',
						DialogType.error
					);
				} else {
					globalThis.islogged = true;
					vscode.window.showInformationMessage('登录成功');
					luoguStatusBar.updateStatusBar(UserStatus.SignedIn);
					return;
				}
			})(await getStatus())
				.catch(err => {
					console.error(err);
					vscode.window.showErrorMessage(getErrorMessage(err));
					luoguStatusBar.updateStatusBar(UserStatus.SignedOut);
					return promptForOpenOutputChannelWithResult(
						'登录失败',
						DialogType.error
					);
				})
				.then(res => {
					if (res?.title !== '重试') {
						flag = false;
					}
				});
		}
	}
});
