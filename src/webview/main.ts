import {
  provideVSCodeDesignSystem,
  vsCodeButton
} from '@vscode/webview-ui-toolkit';
provideVSCodeDesignSystem().register(vsCodeButton());

import $ from 'jquery';
globalThis.jquery = $;

import { dom, library } from '@fortawesome/fontawesome-svg-core';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons/faThumbsDown';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons/faThumbsUp';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { faBilibili } from '@fortawesome/free-brands-svg-icons/faBilibili';
library.add(faThumbsDown, faThumbsUp, faChevronDown, faBilibili);

declare function acquireVsCodeApi(): {
  postMessage(data: unknown): void;
};
globalThis.vscode = acquireVsCodeApi();

globalThis.updateIcon = () => dom.i2svg(); // load icon

$(function () {
  globalThis.updateIcon();

  // copy button
  const tar = document.getElementsByTagName('code');
  for (let i = 0; i < tar.length; i++) {
    const ele = tar[i];
    if (ele.parentNode?.nodeName.toLowerCase() === 'pre') {
      $(ele).before('<a class="copy-button">复制</a>');
    }
  }
  $('.copy-button').on('click', function () {
    const copybutton = $(this);
    const element = copybutton.siblings('code');
    const text = $(element).text();
    navigator.clipboard.writeText(text).then(function () {
      copybutton.text('复制成功');
      setTimeout(function () {
        $(copybutton).text('复制');
      }, 1000);
    });
  });

  globalThis.vscode.postMessage({
    type: 'loaded'
  });
});
