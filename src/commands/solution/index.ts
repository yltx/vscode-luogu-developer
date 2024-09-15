import SuperCommand from '../SuperCommand';
import {
  parseProblemID,
  searchSolution,
  loadUserIcon,
  postVote
} from '@/utils/api';
import { formatTime } from '@/utils/shared';
import HTMLtemplate, { usernameSpan } from '@/utils/html';
import * as path from 'path';
import md from '@/utils/markdown';
import * as vscode from 'vscode';
import { ArticleDetails } from 'luogu-api';

export default new SuperCommand({
  onCommand: 'solution',
  handle: async (pid?: string) => {
    await globalThis.luogu.waitinit;
    const edtior = vscode.window.activeTextEditor;
    let fileNameID = '';
    if (edtior) {
      fileNameID = await parseProblemID(
        path.parse(edtior.document.fileName).base
      );
      fileNameID = fileNameID.toUpperCase();
    }
    if (pid === undefined)
      pid =
        vscode.workspace
          .getConfiguration('luogu')
          .get<boolean>('checkFilenameAsProblemID') && fileNameID !== ''
          ? fileNameID
          : await vscode.window
              .showInputBox({
                placeHolder: '输入题号',
                value: globalThis.pid,
                ignoreFocusOut: true
              })
              .then(res => (res ? res.toUpperCase() : undefined));
    if (!pid) {
      return;
    }
    globalThis.pid = pid;
    try {
      const res = await searchSolution(pid);
      if (res.solutions.length === 0) {
        vscode.window.showInformationMessage('该题目没有题解');
        return;
      }
      const panel = vscode.window.createWebviewPanel(
        pid,
        `${res.problem.pid} ${res.problem.title} 题解`,
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
      let page = 0;
      panel.webview.onDidReceiveMessage(async function ({
        type
      }: {
        type: string;
      }) {
        switch (type) {
          case 'loaded': {
            updatePassage(panel.webview, res.solutions[page], [
              page == 0,
              page == res.solutions.length - 1
            ]);
            break;
          }
          case 'voteup': {
            const r = await postVote(
              res.solutions[page].id,
              res.solutions[page].voted == 1 ? 0 : 1
            ).catch(function (err) {
              vscode.window.showErrorMessage(
                `点赞/取消点赞失败：${err.response?.data?.errorMessage}`
              );
              throw err;
            });
            if (r.status != 200) {
              vscode.window.showErrorMessage(`点赞/取消点赞失败：${r.data}`);
              throw r;
            }
            (res.solutions[page].upvote = r.data as number),
              (res.solutions[page].voted =
                1 - (res.solutions[page].voted ?? 0));
            updateVote(panel.webview, res.solutions[page]);
            break;
          }
          case 'votedown': {
            const r = await postVote(
              res.solutions[page].id,
              res.solutions[page].voted == -1 ? 0 : -1
            ).catch(function (err) {
              vscode.window.showErrorMessage(
                `点踩/取消点踩失败：${err.response?.data?.errorMessage}`
              );
              throw err;
            });
            if (r.status != 200) {
              vscode.window.showErrorMessage(`点踩/取消点踩失败：${r.data}`);
              throw r;
            }
            (res.solutions[page].upvote = r.data as number),
              (res.solutions[page].voted =
                -1 - (res.solutions[page].voted ?? 0));
            updateVote(panel.webview, res.solutions[page]);
            break;
          }
          case 'pagenext': {
            if (page == res.solutions.length - 1)
              vscode.window.showErrorMessage(`已经是最后一页了`);
            else
              ++page,
                updatePassage(panel.webview, res.solutions[page], [
                  page == 0,
                  page == res.solutions.length - 1
                ]);
            break;
          }
          case 'pageprev': {
            if (page == 0) vscode.window.showErrorMessage(`已经是第一页了`);
            else
              --page,
                updatePassage(panel.webview, res.solutions[page], [
                  page == 0,
                  page == res.solutions.length - 1
                ]);
            break;
          }
        }
      });
      panel.webview.html = await genSolutionHTML(
        panel.webview,
        pid,
        res.problem.title
      );
    } catch (err) {
      vscode.window.showErrorMessage(`${err}`);
      throw err;
    }
  }
});

const updatePassage = async function (
  webview: vscode.Webview,
  passage: ArticleDetails,
  disable: [boolean, boolean]
) {
  webview.postMessage({
    type: 'updatePassage',
    data: {
      uid: passage.author.uid,
      userIconBase64: (await loadUserIcon(passage.author.uid))?.toString(
        'base64'
      ),
      userSpan: usernameSpan(passage.author),
      timeStr: formatTime(new Date(passage.time * 1000), 'yyyy-MM-dd hh:mm:ss'),
      passageHTML: md.render(passage.content),
      disable
    }
  });
  updateVote(webview, passage);
};
const updateVote = function (webview: vscode.Webview, passage: ArticleDetails) {
  webview.postMessage({
    type: 'updateVote',
    data: {
      currentUserVoteType: passage.voted ?? 0,
      thumbUp: passage.upvote
    }
  });
};

const genSolutionHTML = async function (
  webview: vscode.Webview,
  pid: string,
  problem_title: string
) {
  return HTMLtemplate(
    webview,
    `${pid} ${problem_title} 题解`,
    `
    <div id="header">
      <span id="writter">
      </span>
      <span id="create_time"></span>
    </div>
    <div id="passage">
    </div>
    <div id="footer">
      <div id="vote">
      <vscode-button id="voteup_button" appearance="icon" onclick="vscode.postMessage({type:'voteup'});"><i class="fa-solid fa-thumbs-up"></i> <span id="stampUpCount">undefined</span></vscode-button>
      <vscode-button id="votedown_button" appearance="icon" onclick="vscode.postMessage({type:'votedown'});"><i class="fa-solid fa-thumbs-down"></i></vscode-button>
      </div>
      <div id="turnpage">
        <vscode-button id="pageprev_button" appearance="secondary" onclick="vscode.postMessage({type:'pageprev'})">上一篇</vscode-button>
        <vscode-button id="pagenext_button" appearance="primary" onclick="vscode.postMessage({type:'pagenext'})">下一篇</vscode-button>
      </div>
    </div>
  `,
    `
    #header{
      display:flex;
      align-items: center;
      padding: 10px;
    }
    #writter{
      display:inline-flex;
      align-items: center;
      margin-right: auto;
    }
    #create_time{
      color:#595959;
      font-size: 14px;
      margin-left: auto;
    }
    @media only screen and (max-width: 500px) {
      #create_time{display:none;}
    }
    #passage{
      margin-bottom:40px;
    }
    #footer{
      display: flex;
      justify-content: right;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      border-top: 1px solid #e0e0e0;
      background-color: var(--vscode-editor-background);
      padding:5px;
    }
    #vote{
      margin-right:auto;
    }
    #vote>.voted{
      color:#3498db;
    }
    #vote>.unvoted{
      color:#9f9f9f;
    }
    #turnpage{
      margin-left: auto;
    }
    #stampUpCount{
      width: auto;
      height: auto;
    }
    @media only screen and (max-width: 400px) {
      #vote{display:none;}
      #turnpage{
        display:flex;
        justify-content:space-around;
        margin:0;
        width:100%;
      }
      #turnpage>vscode-button{
        width:48%;
      }
    }
  `,
    `
    window.addEventListener('message',function(message){
      let type=message.data.type,data=message.data.data;
      switch(type){
        case "updatePassage":{
          $("#writter").html(
            \`<a href="https://www.luogu.com.cn/user/\${data.uid}"><img src="data:image/jpeg;base64,\${data.userIconBase64}" class="usericon"/></a>\${data.userSpan}\`
          );
          $("#create_time").html("创建时间："+data.timeStr);
          $("#passage").html(data.passageHTML);
          $("#pageprev_button").attr("disabled",data.disable[0]),$("#pagenext_button").attr("disabled",data.disable[1]);
          updateIcon();
          break;
        }case "updateVote":{
          $("#stampUpCount").text(data.thumbUp);
          $("#voteup_button").attr("class",data.currentUserVoteType==1?"voted":"unvoted");
          $("#votedown_button").attr("class",data.currentUserVoteType==-1?"voted":"unvoted");
          break;
        }
      }
    })
  `
  );
};
