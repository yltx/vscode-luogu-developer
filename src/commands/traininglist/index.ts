import SuperCommand from '../SuperCommand'
import * as vscode from 'vscode'
import { searchTrainingdetail, searchTraininglist } from '@/utils/api'
import { getResourceFilePath } from '@/utils/html'
import { showTrainDetails } from '@/utils/showTrainDetails'
import { getUsernameColor, getUserSvg } from '@/utils/workspaceUtils'
import showProblem from '@/utils/showProblem'

export default new SuperCommand({
  onCommand: 'traininglist',
  handle: async () => {
    const panel = vscode.window.createWebviewPanel('traininglist', `题单广场`, vscode.ViewColumn.Two, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(globalThis.resourcesPath), vscode.Uri.file(globalThis.distPath)]
    })
    panel.webview.onDidReceiveMessage(async message => {
      console.log(`Got type ${message.type} page ${message.page} request.`)
      if (message.type === 'open') {
        const data = await searchTrainingdetail(message.data)
        const panel2 = vscode.window.createWebviewPanel('题单详情', `${data['training']['title']}`, vscode.ViewColumn.Two, {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [vscode.Uri.file(globalThis.resourcesPath), vscode.Uri.file(globalThis.distPath)]
        })
        panel2.webview.html = await showTrainDetails(panel2.webview, message.data)
        panel2.webview.onDidReceiveMessage(async message => {
          if (message.type === "open") {
            console.log("pid:", message.data);
            await showProblem(message.data, '');
          }
        })
      } else if (message.type === 'request') {
        panel.webview.postMessage({
          message: {
            channel: message.channel,
            html: message.channel === 0 ? await generateOfficialListHTML(message.keyword, message.page) : await generateSelectedListHTML(message.keyword, message.page)
          }
        })
      } else if (message.type === 'search') {
        panel.webview.postMessage({
          message: {
            channel: message.channel,
            html: message.channel === 0 ? await generateOfficialListHTML(message.keyword, 1) : await generateSelectedListHTML(message.keyword, 1)
          }
        })
      }
    })
    const html = await generategeneralHTML(panel.webview)
    panel.webview.html = html
  }
})

const generategeneralHTML = async (webview: vscode.Webview) => {
  return `
  <html lang="zh">
    <head>
      <link rel="stylesheet" href="${getResourceFilePath(webview, 'loader.css')}">
      <link rel="stylesheet" href="${getResourceFilePath(webview, 'sweetalert.css')}">
      <script src="${getResourceFilePath(webview, 'jquery.min.js')}"></script>
      <script src="${getResourceFilePath(webview, 'sweetalert-dev.js')}"></script>
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
        form {
            display: inline-block;
            /* 2. display flex to the rescue */
            flex-direction: row;
            text-align: center;
        }
        input,label {
            display: inline-block;
            /* 1. oh noes, my inputs are styled as block... */
        }
        li {
            float: left;
            list-style: none
        }
      </style>
    </head>
    <body>
    <script>
        const vscode = acquireVsCodeApi();
        function load(){
          $("#search_btn").click(function() {
            var keyword=document.getElementById("search").value;
            console.log("Search func get keyword:",keyword);
            vscode.postMessage({type: 'search',channel: channel,keyword: keyword});
          })
          $(".detail_btn").click(function() {
            var id=$(this).attr("id");
            console.log("detail id:",id);
            vscode.postMessage({type: 'open',data: id});
          })
          $("#search").keypress(function(event){
            if(event.key == "Enter"){
              event.preventDefault();
              var keyword=document.getElementById("search").value;
              console.log("Search func get keyword:",keyword);
              vscode.postMessage({type: 'search',channel: channel,keyword: keyword});
            }
          })
        }
        $(document).ready(function () {
          window.addEventListener('message', event => {
            const message = event.data.message;
            console.log("JS Get message:",event.data.message);
            if(message.channel==0) $("#official").html(message.html);
            else $("#select").html(message.html);
            load();
          });
          load();
        });
        var channel=0,page=1;
        function changechannel() {
          if(channel){
            document.getElementById("select").style="display:none";
            document.getElementById("official").style="";
            document.getElementById("user").style="cursor:pointer;font-size: large;";
            document.getElementById("office").style="cursor:pointer;border-bottom: 2px solid var(--vscode-textLink-foreground);color: var(--vscode-textLink-foreground);font-size: large;";
          } else {
            document.getElementById("official").style="display:none";
            document.getElementById("select").style="";
            document.getElementById("office").style="cursor:pointer;font-size: large;";
            document.getElementById("user").style="cursor:pointer;border-bottom: 2px solid var(--vscode-textLink-foreground);color: var(--vscode-textLink-foreground);font-size: large;";
          }
          channel=1-channel;
        }
      </script>
    <div style="margin-top: 2em;">
    <div class="card padding-default">
    <section>
      <table border="0" width="100%">
        <tr>
          <td align="left" width="100%" nowrap>
            <span>
              <h2 style='display: inline-block'>查找题单</h2>
              <input style="border-radius:4px;border:1px solid #000;width:300px; margin:0 auto; box-shadow: 0 4px 6px rgba(50, 50, 93, .08), 0 1px 3px rgba(0, 0, 0, .05); transition: box-shadow .15s ease; padding: .5em;" type="text" id="search">
              <button id="search_btn" onmouseout="this.style.backgroundColor='white';" onmouseover="this.style.backgroundColor='rgb(0,195,255)';">搜索</button>
            </span>
            </form>
          </td>
        </tr>
      </table>
        <span style="cursor:pointer;border-bottom: 2px solid var(--vscode-textLink-foreground);color: var(--vscode-textLink-foreground); font-size: large;" title="官方精选" href="javascript:void(0)" onclick="changechannel()" id="office">官方精选</span>
      &nbsp;&nbsp;&nbsp;
        <span style="cursor:pointer;font-size: large;" title="用户分享" href="javascript:void(0)" onclick="changechannel()" id="user">用户分享</span>
    </section>
    </div>
    <div class="card padding-default" style="margin-top: 2em;">
    <section>
      <div id="official">
      ${await generateOfficialListHTML('', 1)}
      </div>
      <div id="select" style="display:none">
      ${await generateSelectedListHTML('', 1)}
      </div>
    </section>
    </div>
    </div>
    </body>
  </html>
  `
}

const generateOfficialListHTML = async (keyword: string, page: number) => {
  const data = await searchTraininglist('official', keyword, page)
  const list = data['trainings']['result']
  const accepted = data['acceptedCounts']
  console.log(data)
  console.log(accepted)
  let html = ''
  html += '      <table border="0" width="100%">\n'
  html += '        <tr>\n'
  html += '          <th align="left" nowrap>编号</th>\n'
  html += '          <th align="left" nowrap>名称</th>\n'
  html += '          <th align="left" nowrap>完成度</th>\n'
  html += '          <th nowrap>题目数</th>\n'
  html += '          <th nowrap>收藏数</th>\n'
  html += '        </tr>\n'
  for (let i = 1; i <= list['length']; i++) {
    html += '        <tr>\n'
    html += `          <td align="left" nowrap>${list[i - 1]['id']}</td>\n`
    html += `          <td align="left" nowrap><a href="${list[i - 1]['title']}" class="detail_btn" id="${list[i - 1]['id']}">${list[i - 1]['title']}</a></td>\n`
    html += `          <td align="left" nowrap>\n
            <progress value="${accepted[list[i - 1]['id']]}" max="${list[i - 1]['problemCount']}" style="height: 30px;width: 100px;" title="${accepted[list[i - 1]['id']]}/${list[i - 1]['problemCount']}"></progress>
                     </td>\n`
    // html+=`          <td width="15px" align="left"></td>`
    html += `          <td align="center" nowrap>${list[i - 1]['problemCount']}</td>\n`
    html += `          <td align="center" nowrap>${list[i - 1]['markCount']}</td>\n`
    html += '        <tr>\n'
  }
  html += '      </table>\n'
  html += `      <script>
      function turnOfficial(towards) {
        pageOfficial+=towards;
        const count=${data['trainings']['count']};
        console.log("official count:",count);
        if(pageOfficial<1){
          swal("好像哪里有点问题", "已经是第一页了", "error");
          pageOfficial-=towards;
          return;
        }else if(pageOfficial>Math.ceil(count/50.0)){
          swal("好像哪里有点问题", "已经是最后一页了", "error");
          pageOfficial-=towards;
          return;
        }
        vscode.postMessage({type: 'request',channel: 'official',page: page,keyword: ''});
      }
      function gotokthofficial() {
        const id=parseInt(document.getElementById('KTHOFFICIAL').value);
        if(id<1||id>Math.ceil(${data['trainings']['count']}/50.0)){
          swal("好像哪里有点问题", "不合法的页数", "error");
          return;
        }
        pageOfficial=id;
        vscode.postMessage({type: 'request',channel: 'official',page: pageOfficial,keyword: ''});
      }
      </script>
      <div class="post-nav">
        <table width="100%">
          <tr>
            <td align="left" width="30%" nowrap>
              <p align="left" class="post-nav-prev post-nav-item"><a href="#" onclick="turnOfficial(-1)" title="上一页">上一页</a></p>
            </td>
            <td align="center" width="40%" nowrap>
              <input style="border-radius:4px;border:1px solid #000;width:300px; margin:0 auto; box-shadow: 0 4px 6px rgba(50, 50, 93, .08), 0 1px 3px rgba(0, 0, 0, .05); transition: box-shadow .15s ease; padding: .5em;" type="text" placeholder="输入要跳转到的页码" id="KTHOFFICIAL">
              <button onmouseout="this.style.backgroundColor='white';" onmouseover="this.style.backgroundColor='rgb(0,195,255)';" onclick="gotokthofficial()">跳转</button>
            </td>
            <td align="right" width="30%" nowrap>
              <p align="right" class="post-nav-next post-nav-item"><a href="#" onclick="turnOfficial(1)" title="下一页">下一页</a></p>
            </td>
          </tr>
        </table>
      </div>`
  return html
}
const generateSelectedListHTML = async (keyword: string, page: number) => {
  const data = await searchTraininglist('select', keyword, page)
  const list = data['trainings']['result']
  console.log(data)
  let html = ''
  html += '      <table border="0" width="100%">\n'
  html += '        <tr>\n'
  html += '          <th align="left" nowrap>编号</th>\n'
  html += '          <th align="left" nowrap>名称</th>\n'
  html += '          <th nowrap>题目数</th>\n'
  html += '          <th nowrap>收藏数</th>\n'
  html += '          <th nowrap>创建者</th>\n'
  html += '        </tr>\n'
  for (let i = 1; i <= list['length']; i++) {
    html += '        <tr>\n'
    html += `          <td align="left" nowrap>${list[i - 1]['id']}</td>\n`
    html += `          <td align="left" nowrap><a href="${list[i - 1]['title']}" class="detail_btn" id="${list[i - 1]['id']}">${list[i - 1]['title']}</a></td>\n`
    html += `          <td align="left" nowrap>${list[i - 1]['problemCount']}</td>\n`
    // html+=`          <td width="15px" align="left"></td>`
    html += `          <td align="center" nowrap>${list[i - 1]['markCount']}</td>\n`
    html += `          <td align="center" style="font-weight: bold; color: ${getUsernameColor(list[i - 1]['provider']['color'])};" nowrap>${list[i - 1]['provider']['name']}${getUserSvg(list[i - 1]['provider']['ccfLevel'])}</td>\n`
    html += '        <tr>\n'
  }
  html += '      </table>\n'
  html += `      <script>
      function turnSelected(towards) {
        page+=towards;
        const count=${data['trainings']['count']};
        console.log("selected count:",count);
        if(page<1){
          swal("好像哪里有点问题", "已经是第一页了", "error");
          page-=towards;
          return;
        }else if(page>Math.ceil(count/50.0)){
          swal("好像哪里有点问题", "已经是最后一页了", "error");
          page-=towards;
          return;
        }
        vscode.postMessage({type: 'request',channel: 'select',page: page,keyword: ''});
      }
      function gotokthselected() {
        const id=parseInt(document.getElementById('KTHSELECTED').value);
        if(id<1||id>Math.ceil(${data['trainings']['count']}/50.0)){
          swal("好像哪里有点问题", "不合法的页数", "error");
          return;
        }
        page=id;
        vscode.postMessage({type: 'request',channel: 'select',page: page,keyword: ''});
      }
      </script>
      <div class="post-nav">
        <table width="100%">
          <tr>
            <td align="left" width="30%" nowrap>
              <p align="left" class="post-nav-prev post-nav-item"><a href="#" onclick="turnSelected(-1)" title="上一页">上一页</a></p>
            </td>
            <td align="center" width="40%" nowrap>
              <input style="border-radius:4px;border:1px solid #000;width:300px; margin:0 auto; box-shadow: 0 4px 6px rgba(50, 50, 93, .08), 0 1px 3px rgba(0, 0, 0, .05); transition: box-shadow .15s ease; padding: .5em;" type="text" placeholder="输入要跳转到的页码" id="KTHSELECTED">
              <button onmouseout="this.style.backgroundColor='white';" onmouseover="this.style.backgroundColor='rgb(0,195,255)';" onclick="gotokthselected()">跳转</button>
            </td>
            <td align="right" width="30%" nowrap>
              <p align="right" class="post-nav-next post-nav-item"><a href="#" onclick="turnSelected(1)" title="下一页">下一页</a></p>
            </td>
          </tr>
        </table>
      </div>`
  return html
}
