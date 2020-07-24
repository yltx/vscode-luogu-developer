import SuperCommand from '../SuperCommand'
import { getResourceFilePath, searchContest, getStatus, formatTime, changeTime, getRanklist } from '@/utils/api'
import * as vscode from 'vscode'
import md from '@/utils/markdown'
import { UserStatus, contestStyle, contestType } from '@/utils/shared'
import { getUsernameStyle, getUserSvg } from '@/utils/workspaceUtils'

export default new SuperCommand({
  onCommand: 'contest',
  handle: async () => {
    while (!exports.init) { continue }
    if (await getStatus() === UserStatus.SignedOut.toString()) {
      vscode.window.showErrorMessage('未登录')
      return
    }
    let defaultID = exports.cid
    const cid = await vscode.window.showInputBox({
      placeHolder: '输入比赛编号',
      value: defaultID,
      ignoreFocusOut: true
    }).then(res => res ? res.toUpperCase() : null)
    if (!cid) {
      return
    }
    exports.cid = cid
    try {
      const res = await searchContest(cid)
      console.log(res)
      const ranklist = await getRanklist(cid, 1)
      console.log(ranklist)
      const panel = vscode.window.createWebviewPanel(cid, `比赛详情 - ${res.contest.name}`, vscode.ViewColumn.Two, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(exports.resourcesPath)]
      })
      const html = await generateHTML(res, ranklist['scoreboard']['result'])
      console.log(html)
      panel.webview.html = html
    } catch (err) {
      vscode.window.showErrorMessage('查看失败')
      vscode.window.showErrorMessage(err)
      console.error(err)
    }
  }
})

const generateHTML = async (res: any[], ranklist: any[]) => {
  const contest = res['contest']
  console.log(ranklist)
  return `
  <!DOCTYPE html>
          <html class="no-js" lang="zh">

          <head>
              <meta charset="utf-8">
              <link rel="stylesheet" href="${getResourceFilePath('highlightjs.default.min.css')}">
              <link rel="stylesheet" href="${getResourceFilePath('katex.min.css')}">
              <link rel="stylesheet" href="${getResourceFilePath('problem.css')}">
              <title>比赛详情 - ${contest['name']}</title>
          </head>

          <body>
          <h1 data-v-52820d90="" class="lfe-h1">${contest['name']}</h1>
          <div data-v-83303c00="" data-v-7c02ef97="" class="stat color-inverse" data-v-52820d90=""><div data-v-83303c00="" class="field"><span data-v-83303c00="" class="key lfe-caption">题目数</span> <span data-v-83303c00="" class="value lfe-caption">${contest['problemCount']}</span></div><div data-v-83303c00="" class="field"><span data-v-83303c00="" class="key lfe-caption">报名人数</span> <span data-v-83303c00="" class="value lfe-caption">${contest['totalParticipants']}</span></div></div>
          <div data-v-6febb0e8="" data-v-72177bf8="" class="full-container" style="margin-top: 0px;"><section data-v-72177bf8="" data-v-6febb0e8="" class="side"><div data-v-796309f8="" class="card padding-default" data-v-6febb0e8=""><div data-v-3a151854="" class="info-rows" data-v-796309f8="" style="margin-bottom: 1em;"><div data-v-3a151854=""><span data-v-3a151854=""><span data-v-3a151854="">比赛编号</span></span><span data-v-3a151854=""><span data-v-3a151854="">${contest['id']}</span></span></div><div data-v-3a151854=""><span data-v-3a151854=""><span data-v-3a151854="">举办者</span></span><span data-v-3a151854=""><span data-v-3a151854=""><span data-v-360481bd="" class="wrapper"><a data-v-303bbf52="" data-v-360481bd="" href="/user/39863" target="_blank" colorscheme="none" class="color-none"><span data-v-360481bd="" data-v-303bbf52="" style="${getUsernameStyle(contest['host']['color'].toLowerCase())}">
              ${contest['host']['name']}
            </span></a>
            ${getUserSvg(contest['host']['ccfLevel'])}
          <div data-v-3a151854=""><span data-v-3a151854=""><span data-v-3a151854="">比赛类型</span></span>
          <span data-v-20b7d558 data-v-c0996248 class="lfe-captiontag" style="${contestStyle[contest['ruleType']]}">${contestType[contest['ruleType']]}</span>
          <div><span data-v-8d4c9aee="" class="lfe-caption">开始时间：${formatTime(new Date(contest['startTime'] as number * 1000), 'yyyy-MM-dd hh:mm:ss')}</span></div>
          <span data-v-8d4c9aee="" class="lfe-caption">结束时间：${formatTime(new Date(contest['endTime'] as number * 1000), 'yyyy-MM-dd hh:mm:ss')}</span></div>
          <div><span data-v-8d4c9aee="" class="lfe-caption">比赛时长：${changeTime(+contest['endTime'] - +contest['startTime'])}</span></div>
          <div><span data-v-8d4c9aee="" class="lfe-caption" id="countdown"> </span></div>
          <main data-v-27cf0bac="" class="wrapped lfe-body" style="background-color: rgb(239, 239, 239);"><div data-v-6febb0e8="" data-v-27cf0bac="" class="full-container" currenttemplate="ContestShow" currenttheme="[object Object]" style="margin-top: 2em;"><div data-v-796309f8="" class="card padding-default" data-v-6febb0e8=""><div data-v-8feadc5c="" slot="header" data-v-796309f8=""><div data-v-8feadc5c="" class="category"><!----> <ul data-v-8feadc5c="" class="items"><li data-v-8feadc5c="" class="selected" style="background-color: rgb(52, 152, 219); color: rgb(52, 152, 219);"><!----> <a data-v-8feadc5c="" href="#">比赛说明</a></li><li data-v-8feadc5c="" class=""><!----> <a data-v-8feadc5c="" href="#">题目列表</a></li><li data-v-8feadc5c="" class=""><!----> <a data-v-8feadc5c="" href="#">排行榜</a></li></ul></div></div></div>
          </div>

          <script>
            function formatCountDown(begin, end) {
              var x = 0
              var now = Math.floor(new Date().getTime() / 1000)
              var res = ''
              if (now < begin) {
                res = '据比赛开始还有 '
                x = begin - now
              }
              if (now >= begin && now <= end) {
                res = '据比赛结束还有 '
                x = end - now
              }
              if (now > end) {
                return '比赛已经结束了'
              }
              res += formatTime(x)
              return res
            }

            function formatTime(x) {
              var res = ''
              if (x >= 86400) {
                res += Math.floor(x / 86400).toString() + ' 天 '
                x -= Math.floor(x / 86400) * 86400
              }
              if (x >= 3600) {
                res += Math.floor(x / 3600).toString() + ' 小时 '
                x -= Math.floor(x / 3600) * 3600
              }
              if (x >= 60) {
                res += Math.floor(x / 60).toString() + ' 分 '
                x -= Math.floor(x / 60) * 60
              }
              if (x > 0) {
                res += x.toString() + ' 秒 '
              }
              return res
            }

            function updateCountDown() {
              document.getElementById("countdown").innerText = formatCountDown(${contest['startTime']}, ${contest['endTime']})
            }

            setInterval(() => {
              updateCountDown();
            }, 1000);
            updateCountDown();
          </script>
          <!-- 以下为比赛说明 -->
          <div data-v-17281a3e="" data-v-8d4c9aee="" class="marked" data-v-0776707c="">
          <section data-v-72177bf8="" data-v-6febb0e8="" class="main"><section data-v-6febb0e8=""><div data-v-6febb0e8=""><div data-v-796309f8="" class="card padding-default"><div data-v-5a58a989="" class="marked" data-v-796309f8=""><p>${md.render(contest['description'])}</p>
          </div></div></div></section></section></div>
          </body>
          <!-- 以下为题目列表 -->
          <div><span data-v-8d4c9aee="" class="lfe-caption" id="problem"> </span></div>
          <script>
          function showProblem(problem: any[]) {
            var i = 0
            var ans = ''
            for (;i < contest['problemCount'];i++) {
              ans += problem[i]['problem']['pid'] + ' ' + problem[i]['problem']['title'] + '\n 满分： ' + problem[i]['score']
              if (problem[i]['submitted'] === true) {
                ans += '\n状态：已提交\n'
              } else {
                ans += '\n状态：未提交\n'
              }
            }
            return ans
          }
          document.getElementById("problem").innerText = showProblem(${res['contestProblems']})
          </script>
          </html>
  `
}
