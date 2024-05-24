import * as vscode from 'vscode';
import { Languages, resultState } from '@/utils/shared';
import {
  getStatusText,
  getStatusColor,
  getScoreColor
} from '@/utils/workspaceUtils';
import { fetchResult } from '@/utils/api';
import { getResourceFilePath } from './html';
import { debug } from '@/utils/debug';
import { RecordData, TestCaseStatus } from 'luogu-api';

const delay = (t: number) => new Promise(resolve => setTimeout(resolve, t));

export const showRecord = async (rid: number) => {
  const panel = vscode.window.createWebviewPanel(
    `${rid}`,
    `R${rid} 记录详情`,
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.file(globalThis.resourcesPath),
        vscode.Uri.file(globalThis.distPath)
      ]
    }
  );
  let panelClosed = false;
  let retryTimes = 0;
  const maxRetryTimes = 2;
  panel.onDidDispose(() => (panelClosed = true));
  while (!panelClosed && retryTimes <= maxRetryTimes) {
    try {
      console.log(rid);
      const result = await fetchResult(rid);
      const status = result.record.status;
      debug('Get result: ', result.record);
      panel.webview.html = await generateRecordHTML(panel.webview, result);
      retryTimes = 0;
      console.log('status: ', status);
      if (!(status >= 0 && status <= 1)) {
        break;
      }
      await delay(1000);
    } catch (err) {
      console.error(err);
      vscode.window.showErrorMessage(
        `获取记录详情失败，已重试 ${retryTimes} 次`
      );
      retryTimes++;
      await delay(2000);
    }
  }
  if (retryTimes === maxRetryTimes + 1) {
    vscode.window.showErrorMessage(`获取记录详情失败`);
  }
};
const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

const escapeHtml = (data: string) => {
  return data.replace(/[&<>"'`=/]/g, s => entityMap[s]);
};

const generateRecordHTML = async (
  webview: vscode.Webview,
  data: RecordData
) => {
  let html = '';
  debug('Generating record html:', data);
  const subtasks = Object.values(data.record.detail.judgeResult.subtasks);
  const testCaseGroup = Object.values(data.testCaseGroup);
  const subtasksID = Object.keys(data.testCaseGroup);
  const problemInfo = data.record.problem;
  debug('subtasks: ', subtasks);
  debug('testCaseGroup: ', testCaseGroup);
  debug('subtaskID: ', subtasksID);
  if (
    data.record.detail.compileResult !== null &&
    false === data.record.detail.compileResult.success
  ) {
    html += `
    <div data-v-327ef1ce="" data-v-6febb0e8="">
      <div data-v-327ef1ce="">
        <div data-v-796309f8="" data-v-327ef1ce="" class="card padding-default">
          <h3 data-v-327ef1ce="" data-v-796309f8="" class="lfe-h3">编译信息</h3>
          <blockquote data-v-327ef1ce="" data-v-796309f8="" class="compile-info">
          ${escapeHtml(data.record.detail.compileResult.message || '').replace(
            /\n/g,
            '<br />'
          )}
          </blockquote>
        </div>
      </div>
    </div>`;
  } else if (data.record.status !== 0) {
    subtasks.sort((lhs, rhs) => lhs.id - rhs.id);
    html += `<div data-v-327ef1ce="" data-v-6febb0e8="">
          <div data-v-327ef1ce="">
            <div data-v-796309f8="" data-v-327ef1ce="" class="card padding-default">`;
    html += `<h3 data-v-327ef1ce="" data-v-796309f8="" class="lfe-h3">测试点信息</h3>`;
    for (
      let currentSubtask = 0;
      currentSubtask < subtasks.length;
      currentSubtask++
    ) {
      html += `<div data-v-327ef1ce="" data-v-796309f8="" class="test-case-wrap">`;
      if (subtasks.length > 1) {
        html += `
            <h5 data-v-327ef1ce="" data-v-796309f8="" class="lfe-h5">
              Subtask #${subtasksID[currentSubtask]}
            </h5>`;
      }
      if (
        problemInfo.type === 'P' ||
        problemInfo.type === 'T' ||
        problemInfo.type === 'U' ||
        problemInfo.type === 'B'
      ) {
        html += await generateRecordSubtaskHTML(
          subtasks[currentSubtask].testCases,
          Math.max(
            Object.keys(subtasks[currentSubtask].testCases).length,
            testCaseGroup[currentSubtask].length
          ),
          testCaseGroup[currentSubtask],
          problemInfo.type
        );
      } else {
        html += await generateRecordSubtaskHTML(
          subtasks[currentSubtask].testCases,
          Object.keys(subtasks[currentSubtask].testCases).length,
          testCaseGroup[currentSubtask],
          problemInfo.type
        );
      }
      html += `</div>`;
    }
    html += '</div></div></div>';
  }
  if (data.record.time === null) data.record.time = 0;
  if (data.record.memory === null) data.record.memory = 0;
  // todo: open problem in vscode
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="${getResourceFilePath(webview, 'record.css')}">
  </head>
  <body>
    <h2>R${data.record.id} 记录详情</h2>
    <br />
    <div data-v-796309f8="" data-v-327ef1ce="" class="card padding-default">
      <p class="info-card__desc-title">题目：<a data-v-303bbf52="" data-v-5ccef6e7="" href="https://www.luogu.com.cn/problem/${
        data.record.problem.pid
      }${
        data.record.contest ? `?contestId=${data.record.contest.id}` : ''
      }" class="link color-default"><span data-v-5ccef6e7="" class="pid">${
        data.record.problem.pid
      }</span> ${data.record.problem.title} </a></p>
      <br />
      ${
        data.record.contest
          ? `比赛：<a data-v-303bbf52="" data-v-d5eaec0a="" href="https://www.luogu.com.cn/contest/${data.record.contest.id}" class="color-default">${data.record.contest.name}</a><br />`
          : ''
      }
      <p class="info-card__desc-title">状态：<a style="color: ${getStatusColor(
        data.record.status
      )};">${getStatusText(data.record.status)}</a></p>
      <br />
      <p class="info-card__desc-title">${
        data.record.score !== undefined
          ? `分数：<a style="color: ${getScoreColor(
              data.record.score
            )}; font-weight: bold">${data.record.score}</a><br />`
          : ''
      }</p>
      <p class="info-card__desc-title" style="margin-top: 1.2em;">编程语言：${
        Languages[data.record.language]
      } ${data.record.enableO2 ? ` O2` : ``}</p>
      <br />
      <p class="info-card__desc-title">代码长度：${
        data.record.sourceCodeLength < 1000
          ? data.record.sourceCodeLength.toString() + `B`
          : (data.record.sourceCodeLength / 1000).toString() + `KB`
      }</p>
      <br />
      <p class="info-card__desc-title">用时：${
        data.record.time < 1000
          ? data.record.time.toString() + `ms`
          : data.record.time < 60000
            ? (data.record.time / 1000).toString() + `s`
            : (data.record.time / 60000).toString() + `min`
      }</p>
      <br />
      <p class="info-card__desc-title">内存：${
        data.record.memory < 1000
          ? data.record.memory.toString() + `KB`
          : (data.record.memory / 1000).toString() + `MB`
      }</p>
      <br />
    </div>
    ${html}
  </body>
  </html>
  `;
};

const generateRecordSubtaskHTML = async (
  testcases:
    | TestCaseStatus[]
    | {
        [id: number]: TestCaseStatus;
      },
  len: number,
  casesid: number[],
  type: string
) => {
  let html = '';
  debug('testcases: ', testcases);
  debug('len: ', len);
  debug('id: ', casesid);
  // testcases.sort((lhs, rhs) => lhs.id - rhs.id)
  if (type === 'P' || type === 'T' || type === 'U' || type === 'B') {
    for (let i = 0; i < len; i++) {
      html += `<div data-v-bb301a88="" data-v-327ef1ce="" class="wrapper" data-v-796309f8="">
        <div data-v-bb301a88="" class="test-case" style="background: ${getStatusColor(
          testcases[casesid[i]].status
        )};">
          <div data-v-bb301a88="" class="content">
            <div data-v-bb301a88="" class="info">
            ${
              testcases[casesid[i]].time < 1000
                ? testcases[casesid[i]].time.toString() + `ms`
                : testcases[casesid[i]].time < 60000
                  ? (testcases[casesid[i]].time / 1000).toString() + `s`
                  : (testcases[casesid[i]].time / 60000).toString() + `min`
            }/${
              testcases[casesid[i]].memory < 1000
                ? testcases[casesid[i]].memory.toString() + `KB`
                : (testcases[casesid[i]].memory / 1000).toString() + `MB`
            }
            </div>
            <div data-v-bb301a88="" class="status">${
              resultState[testcases[casesid[i]].status]
            }</div>
          </div>
          <div data-v-bb301a88="" class="id">#${
            testcases[casesid[i]].id + 1
          }</div>
        </div>
        <div data-v-bb301a88="" class="message">${
          testcases[casesid[i]]?.description ?? ''
        } 得分 ${testcases[casesid[i]].score}</div>
        </div>
        `;
    }
  } else {
    for (let i = 0; i < len; i++) {
      html += `<div data-v-bb301a88="" data-v-327ef1ce="" class="wrapper" data-v-796309f8="">
        <div data-v-bb301a88="" class="test-case" style="background: ${getStatusColor(
          testcases[i].status
        )};">
          <div data-v-bb301a88="" class="content">
            <div data-v-bb301a88="" class="info">
            ${
              testcases[i].time < 1000
                ? testcases[i].time.toString() + `ms`
                : testcases[i].time < 60000
                  ? (testcases[i].time / 1000).toString() + `s`
                  : (testcases[i].time / 60000).toString() + `min`
            }/${
              testcases[i].memory < 1000
                ? testcases[i].memory.toString() + `KB`
                : (testcases[i].memory / 1000).toString() + `MB`
            }
            </div>
            <div data-v-bb301a88="" class="status">${
              resultState[testcases[i].status]
            }</div>
          </div>
          <div data-v-bb301a88="" class="id">#${testcases[i].id + 1}</div>
        </div>
        <div data-v-bb301a88="" class="message">${
          testcases[i]?.description ?? ''
        } 得分 ${testcases[i].score}</div>
        </div>
        `;
    }
  }
  return html;
};

export default showRecord;
