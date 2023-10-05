import * as vscode from 'vscode'
import { axios, searchProblem, getResourceFilePath, getStatus, searchContestProblem, getErrorMessage } from '@/utils/api'
import Problem from '@/model/Problem'
import md from '@/utils/markdown'
import { UserStatus, Languages } from '@/utils/shared'
import * as os from 'os'
import * as path from 'path'
import { getSelectedLanguage, getLanauageFromExt, sleep } from '@/utils/workspaceUtils';
import { submitSolution } from '@/utils/submitSolution'
import showRecord from '@/utils/showRecord'
import { stat } from 'fs'
import { indexOf, size } from 'lodash'
import { difficultyName,difficultyColor } from '@/utils/shared';
const luoguJSONName = 'luogu.json';
exports.luoguPath = path.join(os.homedir(), '.luogu');
exports.luoguJSONPath = path.join(exports.luoguPath, luoguJSONName);

const _get_array_max=function(arr:Array<any>){
  let res=arr[0];
  for (const i of arr) if (i>res) res=i;
  return res;
}
const _get_array_min=function(arr:Array<any>){
  let res=arr[0];
  for (const i of arr) if (i<res) res=i;
  return res;
}

export const showProblem = async (pid: string, cid: string) => {
  try {
    let problem: Problem
    if (cid === '') { problem = await searchProblem(pid).then(res => new Problem(res)) } else { problem = await searchContestProblem(pid, cid).then(res => new Problem(res)) }
    const panel = vscode.window.createWebviewPanel(problem.stringPID, problem.name, vscode.ViewColumn.Two, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(exports.resourcesPath.value)]
    })
    if (cid === '') { problem.contestID = '' } else { problem.contestID = `?contestId=${cid}` }
    let html = generateProblemHTML(panel.webview, problem,await check_cph());
    console.log(html)
    panel.webview.html = html
    panel.webview.onDidReceiveMessage(async message => {
      console.log(`Got ${message.type} request: message = `, message.data)
      if (message.type === 'submit') submit(problem);
      /// Written by @Mr-Python-in-China
      /// 添加 “跳转至 CPH” 功能
      else if (message.type === 'open_cph') goto_cph(problem);
    })
  } catch (err) {
    vscode.window.showErrorMessage(getErrorMessage(err))
    throw err
  }
}

const submit=async function(problem:Problem){
  const waitingtime = +vscode.workspace.getConfiguration('luogu').get<'integer'>('defaultWaitingTime')!
  await sleep(waitingtime)
  const edtior = vscode.window.activeTextEditor;
  if (!edtior) {
    vscode.window.showErrorMessage('您没有打开任何文件，请打开一个文件后重试')
    return;
  }
  try {
    if (await getStatus() === UserStatus.SignedOut.toString()) {
      vscode.window.showErrorMessage('您没有登录，请先登录');
      return;
    }
  } catch (err) {
    console.error(err)
    vscode.window.showErrorMessage(`${err}`);
    return;
  }
  let text = edtior.document.getText();
  const filePath = edtior.document.fileName;
  const fileFName = path.parse(filePath).base;
  const fileExt = path.parse(filePath).ext.slice(1);
  console.log(fileExt)
  const languages: string[] = getLanauageFromExt(fileExt);

  console.log(languages)

  const O2 = await vscode.window.showQuickPick(['否', '是'], {
    placeHolder: '是否开启O2优化 (非 C/C++/Pascal 切勿开启)'
  }).then(ans => ans === undefined ? undefined : ans === '是');
  if (O2 === undefined) {
    return
  }
  // tslint:disable-next-line: strict-type-predicates
  // const langs = Object.keys(Languages).filter(k => typeof Languages[k as any] === 'number');
  const selectedLanguage = vscode.workspace.getConfiguration('luogu').get<string>('defaultLanguage')!
  let langs: string[] = [];
  if (languages.indexOf(selectedLanguage) !== -1) {
    langs.push(selectedLanguage)
  }
  for (let item in Languages) {
    if (isNaN(Number(item))) {
      if (languages.indexOf(item) !== -1 && item !== selectedLanguage) {
        langs.push(item)
      }
    }
  }
  for (let item in Languages) {
    if (isNaN(Number(item))) {
      if (item === 'Auto' && languages.indexOf(item) === -1) {
        langs.push(item)
      }
    }
  }
  for (let item in Languages) {
    if (isNaN(Number(item))) {
      if (item !== 'Auto' && languages.indexOf(item) === -1) {
        langs.push(item)
      }
    }
  }
  const selected = vscode.workspace.getConfiguration('luogu').get<boolean>('showSelectLanguageHint') ? (await vscode.window.showQuickPick(langs).then((value) => {
    if (value === undefined) {
      return undefined
    }
    const v = getSelectedLanguage(value);
    return (v === -1 || !v) ? 0 : v;
  })) : getSelectedLanguage(selectedLanguage);
  if (selected === undefined) {
    return
  }
  let id = problem.stringPID;
  if (!id) {
    return;
  }
  let success = false;
  let rid: any = 0;
  try {
    vscode.window.showInformationMessage(`${fileFName} 正在提交到 ${id}...`);
    if (problem.contestID !== '') { id += `?contestId=${problem.contestID}` }
    rid = await submitSolution(id, text, selected, O2);
    if (rid !== undefined) {
      success = true;
    }
  } catch (err) {
    vscode.window.showInformationMessage('提交失败')
    vscode.window.showErrorMessage(getErrorMessage(err))
    console.error(err);
  } finally {
    if (success) {
      // vscode.window.showInformationMessage('提交成功');
      await showRecord(rid as number)
    }
  }
}
const goto_cph=async function(problem:Problem){
  let cph_config = {
    batch: {
      "id": "vscode-luogu", "size": 1
    },
    name: `Luogu_${problem.stringPID}`,
    group: "Luogu",
    url: `https://www.luogu.com.cn/problem/${problem.stringPID}`,
    interactive: "false",
    memoryLimit: _get_array_max(problem.timeLimit),
    timeLimit: _get_array_max(problem.memoryLimit)/1000,
    tests: Array(problem.sample.length),
    input: { "type": "stdin" },
    output: { "type": "stdout" },
    language: { "java": { "mainClass": "Main", "taskClass": problem.stringPID } },
    testType: "single"
  };
  for (let i = 0; i < problem.sample.length; ++i)
    cph_config.tests[i] = { input: problem.sample[i][0], output: problem.sample[i][1] };
  try {
    let res = await axios.post("http://localhost:27121/", cph_config, { validateStatus: (status) => status < 400 });
  } catch (err) {
    vscode.window.showErrorMessage("传送失败。请确认 cph 是否启动！");
    console.error("Cannot jumped to cph.");
    console.error(err);
  }
}
const check_cph=async function(){
  let res: boolean;
  try {
    await axios.get("http://localhost:27121/", { validateStatus: (status) => status < 400 });
    res = true;
  } catch (err) {
    res = false;
  }
  return res;
}

export const generateProblemHTML = (webview: vscode.Webview, problem: Problem, enble_cph: Boolean) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${problem.name}</title>
  <link rel="stylesheet" href="${getResourceFilePath(webview, 'highlightjs.default.min.css')}">
  <link rel="stylesheet" href="${getResourceFilePath(webview, 'katex.min.css')}">
  <link rel="stylesheet" href="${getResourceFilePath(webview, 'problem.css')}">
  <link rel="stylesheet" herf="${getResourceFilePath(webview, 'FontAwesome/css/fontawesome.min.css')}">
  <script src="${getResourceFilePath(webview, 'jquery.min.js')}"></script>
  <style>
    pre {
      margin: .5em 0 !important;
      padding: .3em .5em !important;
      border: #ddd solid 1px !important;
      border-radius: 3px !important;
      overflow: auto !important;
      position: relative;
    }
    code {
      font-size: .875em !important;
      font-family: Courier New !important;
    }
    .probleminfo {
      display: inline-block;
      border-right: 1px solid;
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
    .difficulty_tag{
      display: inline-block;
      padding: 0 8px;
      box-sizing: border-box;
      font-weight: 400;
      line-height: 1.5;
      border-radius: 2px;
      font-size: 0.875em;
    }
  </style>
  <script type="text/javascript">
    $(document).ready(function () {
      let tar = document.getElementsByTagName("code");
      for (let i = 0; i < tar.length; i++) {
        let ele = tar[i];
        if (ele.parentNode.nodeName.toLowerCase() === "pre") {
          $(ele).before('<a class="copy-button ui button" style="position: absolute; top: 0px;right: 0px;border-top-left-radius: 0px;border-bottom-right-radius: 0px">复制</a></div>');
        }
      }
      $(".copy-button").click(function() {
        let element = $(this).siblings("code");
        let text = $(element).text();
        let $temp = $("<textarea>");
        $("body").append($temp);
        $temp.val(text).select();
        document.execCommand("copy");
        $temp.remove();
        $(this).text("复制成功");

        let e = this;
        setTimeout(function() {
          $(e).text("复制");
        }, 500);
      });
    });
  </script>
</head>
<body>
<script>
  const vscode = acquireVsCodeApi();
  function submit() {
    vscode.postMessage({ type: 'submit' });
  }
  function open_cph(){
    vscode.postMessage({ type: 'open_cph' });
  }
</script>
<button style="border-color: rgb(52, 152, 219); background-color: rgb(52, 152, 219); color: rgb(255,255,255);" onclick="submit()">提交</button>
${enble_cph?`<button style="border-color: rgb(52, 152, 219); background-color: rgb(52, 152, 219); color: rgb(255,255,255);" onclick="open_cph()" id="gotoCPH" style="display:none">传送至 cph</button>`:``}
<!--题目属性-->
<div style="float:right;padding:10px;">
  <div class="probleminfo">
  <div class="probleminfo_title">题目难度</div>
  <div class="probleminfo_val"><span class="difficulty_tag" style="background-color:${difficultyColor[problem.difficulty]};color:white">${difficultyName[problem.difficulty]}</span></div>
  </div><div class="probleminfo">
    <div class="probleminfo_title">时间限制</div>
    <div class="probleminfo_val">${(function(){
      let mintime=_get_array_min(problem.timeLimit),maxtime=_get_array_max(problem.timeLimit);
      let mintimestr:string,maxtimestr:string;
      if (mintime<1e3) mintimestr=`${mintime}ms`;
      else if (mintime<60e3) mintimestr=`${(mintime/1e3).toFixed(2)}s`;
      else mintimestr=`${(mintime/60e3).toFixed(2)}min`;
      if (maxtime<1e3) maxtimestr=`${maxtime}ms`;
      else if (maxtime<60e3) maxtimestr=`${(maxtime/1e3).toFixed(2)}s`;
      else maxtimestr=`${(maxtime/60e3).toFixed(2)}min`;
      return mintimestr==maxtimestr?mintimestr:`${mintimestr}~${maxtimestr}`;
    })()}</div>
  </div><div class="probleminfo">
    <div class="probleminfo_title">内存限制</div>
    <div class="probleminfo_val">${(function(){
      let minmemory=_get_array_min(problem.memoryLimit),maxmemory=_get_array_max(problem.memoryLimit);
      let minmemorystr:string,maxmemorystr:string;
      if (minmemory<2**10) minmemorystr=`${minmemory}B`;
      else if (minmemory<2**20) minmemorystr=`${(minmemory/2**10).toFixed(2)}KB`;
      else if (minmemory<2**10) minmemorystr=`${(minmemory/2**20).toFixed(2)}MB`;
      else minmemorystr=`${(minmemory/1e9).toFixed(2)}GB`;
      if (maxmemory<2**10) maxmemorystr=`${maxmemory}B`;
      else if (maxmemory<2**20) maxmemorystr=`${(maxmemory/2**10).toFixed(2)}KB`;
      else if (maxmemory<2**30) maxmemorystr=`${(maxmemory/2**20).toFixed(2)}MB`;
      else maxmemorystr=`${(maxmemory/1e9).toFixed(2)}GB`;
      return minmemorystr==maxmemorystr?minmemorystr:`${minmemorystr}~${maxmemorystr}`;
    })()}</div>
  </div><div class="probleminfo" style="border:0">
    <div class="probleminfo_title">题目标签</div>
    <div class="probleminfo_val"><i class=fa fa-angle-down></i></div>
  </div>
</div>
${md.render(problem.toMarkDown())}
</body>
</html>`

export default showProblem
