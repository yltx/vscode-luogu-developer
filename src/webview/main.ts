import {
	provideVSCodeDesignSystem,
	vsCodeButton
} from '@vscode/webview-ui-toolkit';
provideVSCodeDesignSystem().register(vsCodeButton());

import $ from 'jquery';
globalThis.jquery = $;

import { dom, library } from '@fortawesome/fontawesome-svg-core';
import {
	faThumbsDown,
	faThumbsUp,
	faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { faBilibili } from '@fortawesome/free-brands-svg-icons';
library.add(faThumbsDown, faThumbsUp, faChevronDown, faBilibili);

declare function acquireVsCodeApi(): any;
globalThis.vscode = acquireVsCodeApi();

globalThis.updateIcon = () => dom.i2svg(); // load icon

$(function () {
	globalThis.updateIcon();

	// copy button
	let tar = document.getElementsByTagName('code');
	for (let i = 0; i < tar.length; i++) {
		let ele = tar[i];
		if (ele.parentNode?.nodeName.toLowerCase() === 'pre') {
			$(ele).before('<a class="copy-button">复制</a>');
		}
	}
	$('.copy-button').on('click', function () {
		let copybutton = $(this);
		let element = copybutton.siblings('code');
		let text = $(element).text();
		navigator.clipboard.writeText(text).then(function () {
			copybutton.text('复制成功');
			setTimeout(function () {
				$(copybutton).text('复制');
			}, 1000);
		});
	});

	let vidlst: Array<{
		aid?: string;
		bvid?: string;
		page: number;
		t: number;
	}> = [];
	globalThis.vscode.postMessage({
		type: 'loaded'
	});
});
