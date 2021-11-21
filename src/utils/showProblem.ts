import * as vscode from 'vscode'
import { searchProblem, getResourceFilePath, getStatus, searchContestProblem } from '@/utils/api'
import Problem from '@/model/Problem'
import md from '@/utils/markdown'
import { UserStatus, Languages } from '@/utils/shared'
import * as os from 'os'
import * as path from 'path'
import { getSelectedLanguage, getLanauageFromExt, sleep } from '@/utils/workspaceUtils';
import { submitSolution } from '@/utils/submitSolution'
import showRecord from '@/utils/showRecord'
const luoguJSONName = 'luogu.json';
exports.luoguPath = path.join(os.homedir(), '.luogu');
exports.luoguJSONPath = path.join(exports.luoguPath, luoguJSONName);

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
    let html = generateProblemHTML(problem)
    console.log(html)
    panel.webview.html = html
    panel.webview.onDidReceiveMessage(async message => {
      console.log(`Got ${message.type} request: message = `, message.data)
      if (message.type === 'submit') {
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
          vscode.window.showErrorMessage(err.toString());
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
        let id = message.data
        if (!id) {
          return;
        }
        let success = false;
        let rid: any = 0;
        try {
          vscode.window.showInformationMessage(`${fileFName} 正在提交到 ${id}...`);
          if (cid !== '') { id += `?contestId=${cid}` }
          rid = await submitSolution(id, text, selected, O2);
          if (rid !== undefined) {
            success = true;
          }
        } catch (err) {
          vscode.window.showInformationMessage('提交失败')
          if (err.errorMessage) {
            vscode.window.showErrorMessage(err.errorMessage)
          }
          console.error(err);
        } finally {
          if (success) {
            // vscode.window.showInformationMessage('提交成功');
            await showRecord(rid as number)
          }
        }
      }
    })
  } catch (err) {
    vscode.window.showErrorMessage(err.message)
    throw err
  }
}

export const generateProblemHTML = (problem: Problem) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${problem.name}</title>
  <link rel="stylesheet" href="${getResourceFilePath('highlightjs.default.min.css')}">
  <link rel="stylesheet" href="${getResourceFilePath('katex.min.css')}">
  <link rel="stylesheet" href="${getResourceFilePath('problem.css')}">
  <script src="${getResourceFilePath('jquery.min.js')}"></script>
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
    .ui.button {
      cursor: pointer;
      display: inline-block;
      min-height: 1em;
      outline: 0;
      border: none;
      vertical-align: baseline;
      background: transparent;
      color: rgb(52,152,219);
      font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;
      margin: 0 .25em 0 0;
      padding: .78571429em 1.5em .78571429em;
      text-transform: none;
      text-shadow: none;
      font-weight: 700;
      line-height: 1em;
      font-style: normal;
      text-align: center;
      text-decoration: none;
      border-radius: .28571429rem;
      -webkit-box-shadow: 0 0 0 1px transparent inset, 0 0 0 0 rgba(34,36,38,.15) inset;
      box-shadow: 0 0 0 1px transparent inset, 0 0 0 0 rgba(34,36,38,.15) inset;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-transition: opacity .1s ease,background-color .1s ease,color .1s ease,background .1s ease,-webkit-box-shadow .1s ease;
      transition: opacity .1s ease,background-color .1s ease,color .1s ease,background .1s ease,-webkit-box-shadow .1s ease;
      transition: opacity .1s ease,background-color .1s ease,color .1s ease,box-shadow .1s ease,background .1s ease;
      transition: opacity .1s ease,background-color .1s ease,color .1s ease,box-shadow .1s ease,background .1s ease,-webkit-box-shadow .1s ease;
      will-change: '';
      -webkit-tap-highlight-color: transparent;
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
    function submit(pid) {
        vscode.postMessage({ type: 'submit', data: pid });
    }
</script>
<button style="border-color: rgb(52, 152, 219); background-color: rgb(52, 152, 219); color: rgb(255,255,255);" onclick="submit(\'${problem.stringPID}\')">提交</button>
${md.render(problem.toMarkDown())}
</body>
</html>`

export default showProblem
