import { searchTrainingdetail } from './api';
import { getResourceFilePath } from './html';
import md from './markdown';
import { tagsColor, tagsName } from './shared';
import { getScoreColor } from './workspaceUtils';
import * as vscode from 'vscode';
const getUserScoreStatus = (userScore, fullScore) => {
  if (userScore === fullScore) {
    return `<span data-v-239a177d="" data-v-6e56e2aa="" style="color: rgb(82, 196, 26);"><svg width="16" height="21.82" data-v-239a177d="" data-v-6e56e2aa="" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-check fa-w-16"><path data-v-239a177d="" data-v-6e56e2aa="" fill="currentColor" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" class=""></path></svg></span>`;
  } else {
    if (userScore !== -1) {
      return `<span style="${getScoreColor(
        userScore
      )};font-weight: bold">${userScore}</span>`;
    } else {
      return `<span data-v-239a177d="" data-v-6e56e2aa="" style="color: rgb(122, 122, 122);"><svg data-v-1b44b3e6="" data-v-c06fccc2="" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="minus" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="icon svg-inline--fa fa-minus fa-w-14" data-v-303bbf52="" style="opacity: 0.7; width: 1em;"><path data-v-1b44b3e6="" fill="currentColor" d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" class=""></path></svg></span>`;
    }
  }
};
const getDifficultyStatus = (difficulty: number) => {
  switch (difficulty) {
    case 1:
      return `<span data-v-43a42535="" data-v-c06fccc2="" class="lfe-caption" data-v-303bbf52="" style="background: rgb(254, 76, 97); color: rgb(255, 255, 255);">入门</span>`;
    case 2:
      return `<span data-v-43a42535="" data-v-c06fccc2="" class="lfe-caption" data-v-303bbf52="" style="background: rgb(243, 156, 17); color: rgb(255, 255, 255);">普及-</span>`;
    case 3:
      return `<span data-v-43a42535="" data-v-c06fccc2="" class="lfe-caption" data-v-303bbf52="" style="background: rgb(255, 193, 22); color: rgb(255, 255, 255);">普及/提高-</span>`;
    case 4:
      return `<span data-v-43a42535="" data-v-c06fccc2="" class="lfe-caption" data-v-303bbf52="" style="background: rgb(82, 196, 26); color: rgb(255, 255, 255);">普及+/提高</span>`;
    case 5:
      return `<span data-v-43a42535="" data-v-c06fccc2="" class="lfe-caption" data-v-303bbf52="" style="background: rgb(52, 152, 219); color: rgb(255, 255, 255);">提高+/省选-</span>`;
    case 6:
      return `<span data-v-43a42535="" data-v-c06fccc2="" class="lfe-caption" data-v-303bbf52="" style="background: rgb(157, 61, 207); color: rgb(255, 255, 255);">省选/NOI-</span>`;
    case 7:
      return `<span data-v-43a42535="" data-v-c06fccc2="" class="lfe-caption" data-v-303bbf52="" style="background: rgb(14, 29, 105); color: rgb(255, 255, 255);">NOI/NOI+/CTSC</span>`;
    default:
      return `<span data-v-43a42535="" data-v-c06fccc2="" class="lfe-caption" data-v-303bbf52="" style="background: rgb(191, 191, 191); color: rgb(255, 255, 255);">暂无评定</span>`;
  }
};
const getTagsStatus = (tags: []) => {
  let html = '';
  tags.forEach(index => {
    html += `<span data-v-43a42535="" data-v-c06fccc2="" class="lfe-caption" data-v-303bbf52="" style="color: rgb(255, 255, 255); background-color: ${tagsColor[index]}">${tagsName[index]}</span>&nbsp;`;
  });
  return html;
};
export class TrainDetals {
  public TID = '';
  public title = '';
  public provider;
  public problemCount;
  public problemlist: [any[]] = [[]];
  public description = '';
  public userScore: [] = [];

  public constructor(fields?: any) {
    if (!fields) {
      return;
    }
    this.TID = fields.pid;
    this.title = fields.title;
    this.provider = fields.provider;
    this.problemCount = fields.problemCount;
    this.problemlist = fields.problems;
    this.description = fields.description;
    this.userScore = fields.userScore;
  }

  toHTML(): string {
    let problemlist = '<div>\n';
    if (this.problemCount > 0) {
      problemlist += '<table border="0" width="100%">\n';
      problemlist += '  <tr>\n';
      problemlist += '    <th nowrap>题号</th>\n';
      problemlist += '    <th style="text-align: center;" nowrap>状态</th>\n';
      problemlist += '    <th align="left" nowrap>题目名称</th>\n';
      problemlist += '    <th align="left" nowrap>标签</th>\n';
      problemlist += '    <th nowrap>难度</th>\n';
      problemlist += '    <th nowrap>通过率</th>\n';
      problemlist += '  </tr>\n';
    }
    this.problemlist.forEach(index => {
      problemlist += `  <tr>
    <td nowrap>${index['problem']['pid']}</td>
    <td style="text-align: center;" nowrap>${getUserScoreStatus(
      this.userScore
        ? this.userScore['status'][index['problem']['pid']]
          ? this.userScore['score'][index['problem']['pid']]
          : -1
        : -1,
      index['problem']['fullScore']
    )}</td>
    <td align="left" nowrap><a href="${
      index['problem']['pid']
    }" class="pid" id="${index['problem']['pid']}">${md.render(
      index['problem']['title']
    )}</a></td>
    <td align="left" nowrap>${getTagsStatus(index['problem']['tags'])}</td>
    <td nowrap>${getDifficultyStatus(index['problem']['difficulty'])}</td>
    <td nowrap>
      <progress value="${index['problem']['totalAccepted']}" max="${
        index['problem']['totalSubmit']
      }" style="height: 30px;width: 100px;"></progress>
    </td>
</tr>`;
    });
    if (this.problemCount > 0) {
      problemlist += '</table>\n';
    }
    problemlist += '</div>';
    return `
    <div id="description">
    ${md.render(this.description)}\n
    </div>
    <div style="display: none" id="problemlist">
    ${problemlist}
    </div>
    `;
  }
}
export const showTrainDetails = async (webview: vscode.Webview, id: any) => {
  const train = await searchTrainingdetail(id).then(
    res => new TrainDetals(res['training'])
  );
  return generateTrainDetailsHTML(webview, train);
};
export const generateTrainDetailsHTML = (
  webview: vscode.Webview,
  train: TrainDetals
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${train.title}</title>
  <link rel="stylesheet" href="${getResourceFilePath(
    webview,
    'highlightjs.default.min.css'
  )}">
  <link rel="stylesheet" href="${getResourceFilePath(
    webview,
    'katex.min.css'
  )}">
  <link rel="stylesheet" href="${getResourceFilePath(webview, 'problem.css')}">
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
    .lfe-tooltip-theme{display:block !important;z-index:10000}.lfe-tooltip-theme .tooltip-inner{background:#000;color:#fff;border-radius:4px;padding:5px 10px 4px}.lfe-tooltip-theme .tooltip-arrow{width:0;height:0;border-style:solid;position:absolute;margin:5px;border-color:#000;z-index:1}.lfe-tooltip-theme[x-placement^=top]{margin-bottom:5px}.lfe-tooltip-theme[x-placement^=top] .tooltip-arrow{border-width:5px 5px 0 5px;border-left-color:transparent !important;border-right-color:transparent !important;border-bottom-color:transparent !important;bottom:-5px;left:calc(50% - 5px);margin-top:0;margin-bottom:0}.lfe-tooltip-theme[x-placement^=bottom]{margin-top:5px}.lfe-tooltip-theme[x-placement^=bottom] .tooltip-arrow{border-width:0 5px 5px 5px;border-left-color:transparent !important;border-right-color:transparent !important;border-top-color:transparent !important;top:-5px;left:calc(50% - 5px);margin-top:0;margin-bottom:0}.lfe-tooltip-theme[x-placement^=right]{margin-left:5px}.lfe-tooltip-theme[x-placement^=right] .tooltip-arrow{border-width:5px 5px 5px 0;border-left-color:transparent !important;border-top-color:transparent !important;border-bottom-color:transparent !important;left:-5px;top:calc(50% - 5px);margin-left:0;margin-right:0}.lfe-tooltip-theme[x-placement^=left]{margin-right:5px}.lfe-tooltip-theme[x-placement^=left] .tooltip-arrow{border-width:5px 0 5px 5px;border-top-color:transparent !important;border-right-color:transparent !important;border-bottom-color:transparent !important;right:-5px;top:calc(50% - 5px);margin-left:0;margin-right:0}.lfe-tooltip-theme.popover .popover-inner{background:#f9f9f9;color:#000;padding:24px;border-radius:5px;box-shadow:0 5px 30px rgba(0,0,0,.1)}.lfe-tooltip-theme.popover .popover-arrow{border-color:#f9f9f9}.lfe-tooltip-theme[aria-hidden=true]{visibility:hidden;opacity:0;transition:opacity .15s,visibility .15s}.lfe-tooltip-theme[aria-hidden=false]{visibility:visible;opacity:1;transition:opacity .15s}
    span[data-v-43a42535] {
      box-sizing: border-box;
      font-weight: 400;
      line-height: 1.5;
      border-radius: 50px !important;
      padding-left: 9px;
      padding-right: 9px;
      padding-top: 1px;
      padding-bottom: 3px;
      transition: all .15s;
    }
  </style>
</head>
<body>
<script>
    const vscode = acquireVsCodeApi();
    $(document).ready(function () {
      $(".pid").click(function() {
        var id=$(this).attr("id");
        console.log("problem id:",id);
        vscode.postMessage({type: 'open',data: id});
      })
    });
    var channel = 0,Channel = ['description','problemlist'],top0 = ['Des','Pro'],top1 = ['des','pro'];
    function changechannel(to) {
        document.getElementById(Channel[channel]).style = "display: none;";
        document.getElementById(Channel[to]).style = "";
        document.getElementById(top0[channel]).style = "";
        document.getElementById(top1[channel]).style = "color: rgb(0,0,0);font-size: large;";
        document.getElementById(top0[to]).style = "background-color: rgb(52,152,219);";
        document.getElementById(top1[to]).style = "color: rgb(255,255,255); font-size: large;";
        channel = to;
    }
</script>
<span style="background-color: rgb(52,152,219);" id="Des">
  <a style="color: rgb(255,255,255); font-size: large;" title="题单简介" href="javascript:void(0)" onclick="changechannel(0)" id="des">题单简介</a>
</span>
&nbsp;&nbsp;&nbsp;
<span id="Pro">
  <a style="color: rgb(0,0,0);font-size: large;" title="题目列表" href="javascript:void(0)" onclick="changechannel(1)" id="pro">题目列表</a>
</span>
${train.toHTML()}
</body>
</html>`;
