import * as vscode from 'vscode';
import {
  axios,
  searchProblem,
  getStatus,
  searchContestProblem,
  getErrorMessage,
  submitCode
} from '@/utils/api';
import Problem from '@/model/Problem';
import md from '@/utils/markdown';
import { UserStatus, Languages } from '@/utils/shared';
import * as path from 'path';
import {
  getSelectedLanguage,
  getLanauageFromExt,
  sleep
} from '@/utils/workspaceUtils';
import showRecord from '@/utils/showRecord';
import {
  difficultyName,
  difficultyColor,
  tagsColor,
  tagsName
} from '@/utils/shared';
import HTMLtemplate from '@/utils/html';

export const showProblem = async (pid: string, cid: string) => {
  let problemPre: Promise<Problem>;
  if (cid === '') {
    problemPre = searchProblem(pid);
  } else {
    problemPre = searchContestProblem(pid, cid);
  }
  let problem = await problemPre
    .then(res => new Problem(res))
    .catch(err => {
      vscode.window.showErrorMessage(err.message);
      return;
    });
  if (!problem) return;
  problem.contestID = cid;
  const panel = vscode.window.createWebviewPanel(
    problem.stringPID,
    problem.name,
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
  panel.webview.html = genProblemHTML(
    panel.webview,
    problem,
    await check_cph()
  );
  panel.webview.onDidReceiveMessage(async message => {
    console.log(`Got ${message.type} request: message = `, message.data);
    if (!problem) return; // why it warns problem -> void | Problem
    if (message.type === 'submit')
      submit(problem); // why Problem(problem)? I can't understand
    /// Written by @Mr-Python-in-China
    /// 添加 “跳转至 CPH” 功能
    else if (message.type === 'open_cph') goto_cph(problem);
  });
};

const submit = async function (problem: Problem) {
  const waitingtime = +vscode.workspace
    .getConfiguration('luogu')
    .get<'integer'>('defaultWaitingTime')!;
  await sleep(waitingtime);
  const edtior = vscode.window.activeTextEditor;
  if (!edtior) {
    vscode.window.showErrorMessage('您没有打开任何文件，请打开一个文件后重试');
    return;
  }
  try {
    if ((await getStatus()) === UserStatus.SignedOut.toString()) {
      vscode.window.showErrorMessage('您没有登录，请先登录');
      return;
    }
  } catch (err) {
    console.error(err);
    vscode.window.showErrorMessage(`${err}`);
    return;
  }
  let text = edtior.document.getText();
  const filePath = edtior.document.fileName;
  const fileFName = path.parse(filePath).base;
  const fileExt = path.parse(filePath).ext.slice(1);
  console.log(fileExt);
  const languages: string[] = getLanauageFromExt(fileExt);

  console.log(languages);

  const O2 = vscode.workspace
    .getConfiguration('luogu')
    .get<boolean>('alwaysEnableO2')
    ? true
    : await vscode.window
        .showQuickPick(['否', '是'], {
          placeHolder: '是否开启O2优化 (非 C/C++/Pascal 切勿开启)'
        })
        .then(ans => (ans === undefined ? undefined : ans === '是'));
  if (O2 === undefined) {
    return;
  }
  const selectedLanguage = vscode.workspace
    .getConfiguration('luogu')
    .get<string>('defaultLanguage')!;
  let langs: string[] = [];
  if (languages.indexOf(selectedLanguage) !== -1) {
    langs.push(selectedLanguage);
  }
  for (let item in Languages) {
    if (isNaN(Number(item))) {
      if (languages.indexOf(item) !== -1 && item !== selectedLanguage) {
        langs.push(item);
      }
    }
  }
  for (let item in Languages) {
    if (isNaN(Number(item))) {
      if (item === 'Auto' && languages.indexOf(item) === -1) {
        langs.push(item);
      }
    }
  }
  for (let item in Languages) {
    if (isNaN(Number(item))) {
      if (item !== 'Auto' && languages.indexOf(item) === -1) {
        langs.push(item);
      }
    }
  }
  const selected = vscode.workspace
    .getConfiguration('luogu')
    .get<boolean>('showSelectLanguageHint')
    ? await vscode.window.showQuickPick(langs).then(value => {
        if (value === undefined) {
          return undefined;
        }
        const v = getSelectedLanguage(value);
        return v === -1 || !v ? 0 : v;
      })
    : getSelectedLanguage(selectedLanguage);
  if (selected === undefined) {
    return;
  }
  let id = problem.stringPID;
  if (!id) {
    return;
  }
  let success = false;
  let rid: any = 0;
  try {
    vscode.window.showInformationMessage(`${fileFName} 正在提交到 ${id}...`);
    if (problem.contestID !== '') {
      id += `?contestId=${problem.contestID}`;
    }
    rid = await submitCode(id, text, selected, O2);
    if (rid !== undefined) {
      success = true;
    }
  } catch (err) {
    vscode.window.showInformationMessage('提交失败');
    vscode.window.showErrorMessage(getErrorMessage(err));
    console.error(err);
  } finally {
    if (success) {
      await showRecord(rid as number);
    }
  }
};
const goto_cph = async function (problem: Problem) {
  let cph_config = {
    batch: {
      id: 'vscode-luogu',
      size: 1
    },
    name: `Luogu_${problem.stringPID}`,
    group: 'Luogu',
    url: `https://www.luogu.com.cn/problem/${problem.stringPID}`,
    interactive: 'false',
    memoryLimit: Math.max(...problem.timeLimit),
    timeLimit: Math.max(...problem.memoryLimit),
    tests: Array(problem.sample.length),
    input: { type: 'stdin' },
    output: { type: 'stdout' },
    language: { java: { mainClass: 'Main', taskClass: problem.stringPID } },
    testType: 'single'
  };
  for (let i = 0; i < problem.sample.length; ++i)
    cph_config.tests[i] = {
      input: problem.sample[i][0],
      output: problem.sample[i][1]
    };
  try {
    let res = await axios.post('http://localhost:27121/', cph_config, {
      validateStatus: status => status < 400
    });
  } catch (err) {
    vscode.window.showErrorMessage('传送失败。请确认 cph 是否启动！');
    console.error('Cannot jumped to cph.');
    console.error(err);
  }
};
const check_cph = async function () {
  let res: boolean;
  try {
    await axios.get('http://localhost:27121/', {
      validateStatus: status => status < 400
    });
    res = true;
  } catch (err) {
    res = false;
  }
  return res;
};

export const genProblemHTML = function (
  webview: vscode.Webview,
  problem: Problem,
  enble_cph: boolean
) {
  return HTMLtemplate(
    webview,
    problem.name,
    `
    <button onclick="submit()">提交</button>
    ${
      enble_cph
        ? `<button onclick="open_cph()" id="gotoCPH">传送至 cph</button>`
        : ``
    }
    <span style="float:right">
      <table id="probleminfo">
        <tr>
          <td class="probleminfo" style="border-bottom:1px solid;">
            <div class="probleminfo_title">时间限制</div>
            <div class="probleminfo_val">${(function () {
              let mintime = Math.min(...problem.timeLimit),
                maxtime = Math.max(...problem.timeLimit);
              let mintimestr: string, maxtimestr: string;
              if (mintime < 1e3) mintimestr = `${mintime}ms`;
              else if (mintime < 60e3)
                mintimestr = `${(mintime / 1e3).toFixed(2)}s`;
              else mintimestr = `${(mintime / 60e3).toFixed(2)}min`;
              if (maxtime < 1e3) maxtimestr = `${maxtime}ms`;
              else if (maxtime < 60e3)
                maxtimestr = `${(maxtime / 1e3).toFixed(2)}s`;
              else maxtimestr = `${(maxtime / 60e3).toFixed(2)}min`;
              return mintimestr == maxtimestr
                ? mintimestr
                : `${mintimestr}~${maxtimestr}`;
            })()}</div>
          </td><td class="probleminfo" style="border-bottom:1px solid;">
            <div class="probleminfo_title">内存限制</div>
            <div class="probleminfo_val">${(function () {
              let minmemory = Math.min(...problem.memoryLimit),
                maxmemory = Math.max(...problem.memoryLimit);
              let minmemorystr: string, maxmemorystr: string;
              if (minmemory < 2 ** 1) minmemorystr = `${minmemory}KB`;
              else if (minmemory < 2 ** 20)
                minmemorystr = `${(minmemory / 2 ** 10).toFixed(2)}MB`;
              else minmemorystr = `${(minmemory / 2 ** 20).toFixed(2)}GB`;
              if (maxmemory < 2 ** 1) maxmemorystr = `${maxmemory}KB`;
              else if (maxmemory < 2 ** 20)
                maxmemorystr = `${(maxmemory / 2 ** 10).toFixed(2)}MB`;
              else maxmemorystr = `${(maxmemory / 2 ** 20).toFixed(2)}GB`;
              return minmemorystr == maxmemorystr
                ? minmemorystr
                : `${minmemorystr}~${maxmemorystr}`;
            })()}</div>
          </td>
        </tr>
        <tr>
          <td class="probleminfo">
            <div class="probleminfo_title">题目难度</div>
            <div class="probleminfo_val"><span class="tag" style="background-color:${
              difficultyColor[problem.difficulty]
            };">${difficultyName[problem.difficulty]}</span></div>
          </td><td class="probleminfo" ${
            problem.tags.length ? `id="showtag"` : ``
          }>
            <div class="probleminfo_title">题目标签</div>
            <div class="probleminfo_val">${
              problem.tags.length
                ? `<i class="fas fa-chevron-down"></i>`
                : `暂无标签`
            }</div>
          </td>
        </tr>
      </table>
      <div id="tagwindow" style="display:none;">${(function () {
        let res = '';
        for (let i of problem.tags)
          res += `<span class="tag" style="background-color:${tagsColor[i]};">${tagsName[i]}</span>`;
        return res;
      })()}</div>
    </span>
    ${md.render(problem.toMarkDown())}
  `,
    `
    .probleminfo {
      border:0;
      padding-left:12px;
      padding-right:12px;
      font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", "Noto Sans", "Noto Sans CJK SC", "Noto Sans CJK", "Source Han Sans", "PingFang SC", "Segoe UI", "Microsoft YaHei", sans-serif;
    }
    .probleminfo_title{
      text-align: center;
    }
    .probleminfo_val{
      text-align: center;
      font-weight: 700;
    }
    button{
      border-color: rgb(52, 152, 219);
      background-color: rgb(52, 152, 219); 
      color: rgb(255,255,255);
    }
    #tagwindow{
      width:200px;
      position:absolute;
      right:0px;
      top:110px;
      backdrop-filter: blur(12px);
      background-color:var(--vscode-editor-background);
      box-shadow: 0 3px 8px var(--vscode-editor-foreground);
      border-radius: 7px;
      padding: 10px;
      margin: 10px;
      z-index: 114514;
    }
    #probleminfo{
      width:auto;
      float:right;border:0;
    }
    @media only screen and (max-width: 420px) {
      #probleminfo{
        display:none;
      }
    }
  `,
    `
    $(function () {
      if ($("#showtag"))
        $("#showtag").mouseenter(function(){
          $("#tagwindow").fadeIn(500);
        }),
        $("#showtag").mouseleave(function(){
          $("#tagwindow").fadeOut(500);
        });
    });

    const submit=function() {
      vscode.postMessage({ type: 'submit' });
    }
    const open_cph=function(){
      vscode.postMessage({ type: 'open_cph' });
    }
  `
  );
};

export default showProblem;
