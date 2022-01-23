import SuperCommand from '../SuperCommand'
import * as vscode from 'vscode'
import { getResourceFilePath, searchTrainingdetail, searchTraininglist } from '@/utils/api'

export default new SuperCommand({
  onCommand: 'traininglist',
  handle: async () => {
    const panel = vscode.window.createWebviewPanel('', `题单广场`, vscode.ViewColumn.Two, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(exports.resourcesPath.value)]
    })
    panel.webview.onDidReceiveMessage(async message => {
      console.log(`Got type ${message.type} page ${message.page} request.`)
      if(message.type=='open'){
        const panel2 = vscode.window.createWebviewPanel('',`题单`,vscode.ViewColumn.Two, {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [vscode.Uri.file(exports.resourcesPath.value)]
        })
        panel2.webview.html=await generateTrainingDetailsHTML(message.data)
      }
      else if(message.type=='official'){
        panel.webview.postMessage({
          message: {
            html: await generateOfficialListHTML(message.page)
          }
        })
      }
    })
    const html = await generategeneralHTML()
    console.log(html)
    panel.webview.html = html
    // vscode.window.showWarningMessage('1')
    // vscode.window.showErrorMessage('1')
  }
})

const generategeneralHTML = async () => {
  return `
  <html lang="zh">
    <head>
      <link rel="stylesheet" href="${getResourceFilePath('loader.css')}">
      <script src="${getResourceFilePath('loader.js')}" charset="utf-8" defer></script>
      <script>
        // const vscode = acquireVsCodeApi();
        function scrollToClass (c) {
          $('html, body').animate({
            scrollTop: ($(c).offset().top)
          }, 500);
        }
      </script>
    </head>
    <main data-v-90bffe18 class="wrapped lfe-body" style="background-color: rgb(239,239,239);">
    <script>
      var channel=0;
      function search() {
        var keyword=document.getElementById("search").value;
        console.log(keyword);
      }
      function changechannel() {
        if(channel){
          document.getElementById("select").style="display:none";
          document.getElementById("user").style="color: rgb(0,0,0);font-size: large;";
          document.getElementById("User").style="";
          document.getElementById("official").style="";
          document.getElementById("office").style="color: rgb(255,255,255);font-size: large;";
          document.getElementById("Office").style="background-color: rgb(52,152,219);";
        } else {
          document.getElementById("official").style="display:none";
          document.getElementById("office").style="color: rgb(0,0,0);font-size: large;";
          document.getElementById("Office").style="";
          document.getElementById("select").style="";
          document.getElementById("user").style="color: rgb(255,255,255);font-size: large;";
          document.getElementById("User").style="background-color: rgb(52,152,219);"
        }
        channel=1-channel;
      }
      function open(id){
        // vscode.postMessage({type:'open',data:id});
        console.log(id);
      }
      </script>
    <div style="margin-top: 2em;">
    <div class="card padding-default" style="background-color: rgb(255,255,255);">
    <section>
      <table border="0" width="100%">
        <tr>
          <td align="left" width="100%" nowrap>
            <form>
              <span>
                <h2 style='display: inline-block'>查找题单</h2>
                <input style="border-radius:4px;border:1px solid #000;width:300px; margin:0 auto; box-shadow: 0 4px 6px rgba(50, 50, 93, .08), 0 1px 3px rgba(0, 0, 0, .05); transition: box-shadow .15s ease; padding: .5em;" type="text" id="search">
                <button onmouseout="this.style.backgroundColor='white';" onmouseover="this.style.backgroundColor='rgb(0,195,255)';" onclick="searchlist()">搜索</button>
              </span>
            </form>
          </td>
        </tr>
      </table>
      <span style="background-color: rgb(52,152,219);" id="Office">
        <a style="color: rgb(255,255,255); font-size: large;" title="官方精选" href="javascript:void(0)" onclick="changechannel()" id="office">官方精选</a>
      </span>
      &nbsp;&nbsp;&nbsp;
      <span id="User">
        <a style="color: rgb(0,0,0);font-size: large;" title="用户分享" href="javascript:void(0)" onclick="changechannel()" id="user">用户分享</a>
      </span>
    </section>
    </div>
    <div class="card padding-default" style="margin-top: 2em;">
    <section style="background-color: rgb(255,255,255);">
      <div id="official">
      ${await generateOfficialListHTML(1)}
      </div>
      <div id="select" style="display:none">
      2
      </div>
    </section>
    </div>
    </div>
    </main>
  </html>
  `
}

const generateOfficialListHTML = async (page: number) => {
  const data=await searchTraininglist('official',page),list=data['trainings']['result'],accepted=data['acceptedCounts']
  console.log(data)
  console.log(accepted)
  let html=''
  html+='      <table border="0" width="100%">\n'
  html+='        <tr>\n'
  html+='          <th width="8px" align="left" nowrap>编号</th>\n'
  html+='          <th align="left" nowrap>名称</th>\n'
  html+='          <th width="15px" align="left" nowrap>完成度</th>\n'
  html+='          <th width="10px" nowrap>题目数</th>\n'
  html+='          <th width="12px" nowrap>收藏数</th>\n'
  html+='        </tr>\n'
  for(let i=1;i<=list['length'];i++){
    html+='        <tr>\n'
    html+=`          <td width="8px" align="left" nowrap>${list[i-1]['id']}</td>\n`
    html+=`          <td align="left" nowrap><a href="javascript:void(0)" onclick="open(${list[i-1]['id']})">${list[i-1]['title']}</a></td>\n`
    html+=`          <td width="15px" align="left" nowrap>
                       <div data-v-47712372="" data-v-128051e7="" class="progress-frame has-tooltip" data-original-title="null" data-v-24f898d2="" >
                         <div data-v-47712372="" style="width: ${100*accepted[list[i-1]['id']]/list[i-1]['problemCount']}%; background-color: rgb(52, 152, 219);"></div>
                       </div>
                       <div data-v-bb301a88="" class="message">${accepted[list[i-1]['id']]}/${list[i-1]['problemCount']}</div>
                     </td>\n`
    // html+=`          <td width="15px" align="left"></td>`
    html+=`          <td width="10px" align="center" nowrap>${list[i-1]['problemCount']}</td>\n`
    html+=`          <td width="12px" align="center" nowrap>${list[i-1]['markCount']}</td>\n`
    html+='        <tr>\n'
  }
  html+='      </table>\n'
  return html
}
const generateSelectedListHTML = async (page: number) => {
  const data=await searchTraininglist('select',page),list=data['trainings']['result'],accepted=data['acceptedCounts']
  console.log(data)
  console.log(accepted)
  let html=''
  html+='      <table border="0" width="100%">\n'
  html+='        <tr>\n'
  html+='          <th width="8px" align="left" nowrap>编号</th>\n'
  html+='          <th width="60px" align="left" nowrap>名称</th>\n'
  html+='          <th width="15px" align="left" nowrap>完成度</th>\n'
  html+='          <th width="10px" nowrap>题目数</th>\n'
  html+='          <th width="12px" nowrap>收藏数</th>\n'
  html+='        </tr>\n'
  for(let i=1;i<=list['length'];i++){
    html+='        <tr>\n'
    html+=`          <td width="8px" align="left" nowrap>${list[i-1]['id']}</td>\n`
    html+=`          <td width="60px" align="left" nowrap>${list[i-1]['title']}</td>\n`
    html+=`          <td width="15px" align="left" nowrap>
                       <div data-v-47712372="" data-v-128051e7="" class="progress-frame has-tooltip" data-original-title="null" data-v-24f898d2="" onmouseout="this.class="progress-frame has-tooltip"" onmouseover="this.class="progress-frame has-tooltip v-tooltip-open">
                         <div data-v-47712372="" style="width: ${100*accepted[list[i-1]['id']]/list[i-1]['problemCount']}%; background-color: rgb(52, 152, 219);"></div>
                       </div>
                       <div data-v-bb301a88="" class="message">${accepted[list[i-1]['id']]}/${list[i-1]['problemCount']}</div>
                     </td>\n`
    // html+=`          <td width="15px" align="left"></td>`
    html+=`          <td width="10px" align="center" nowrap>${list[i-1]['problemCount']}</td>\n`
    html+=`          <td width="12px" align="center" nowrap>${list[i-1]['markCount']}</td>\n`
    html+='        <tr>\n'
  }
  html+='      </table>\n'
  return html
}