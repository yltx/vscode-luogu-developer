import SuperCommand from '../SuperCommand'
import { searchUser, fetchBenben, getStatus, userIcon, postBenben, deleteBenben, getResourceFilePath, loadUserIcon, getErrorMessage } from '@/utils/api'
import { cookieConfig, changeCookieByCookies } from '@/utils/files'
import { UserStatus } from '@/utils/shared'
import * as vscode from 'vscode'
import md from '@/utils/markdown'
const delay = (t: number) => new Promise(resolve => setTimeout(resolve, t))

/*
const replyBenben = async (data: string) => {
  const content = await vscode.window.showInputBox({
    placeHolder: '输入内容',
    ignoreFocusOut: true,
    value: data,
    validateInput: s => s && s.trim() ? undefined : '输入不能为空'
  });
  if (!content) { return; }
  return postBenben(content);
}
*/
const getBenben = async (mode: string) => {
  let ret1 = await fetchBenben(mode, 1);
  let ret2 = await fetchBenben(mode, 2);
  let ret3 = await fetchBenben(mode, 3);
  //这里fetch三次是因为犇犇默认就只get前三页
  let pret = new Array();
  const m = [ret1, ret2, ret3];
  //fixed by LYkcul 
  if (mode === "list") {
    for (let ret of m) {
      if (ret.length === 0) { break; }
      console.log(ret);
      const retFeed = ret.feeds.result;
      retFeed.forEach((node) => { pret.push(node); });
    }
  } else if (mode === "watching") {
    for (let ret of m) {
      if (ret.length === 0) { break; }
      //let t = new Array();
      console.log(ret);
      const retData = ret.data;
      retData.forEach((node) => { pret.push(node); });
      //pret.push(t);
    }
  }
  let tmp = new Array();
  for (let i = pret.length - 1; i >= 0; i--) {
      tmp.push(pret[i]);
  }
  let message = new Array();
  if (mode === "list") {
    for (let i = tmp.length - 1; i >= 0; i--) {
      if (tmp[i].content.length === 0)  { continue; } 
      let benbenTime = new Date(tmp[i].time * 1000);
      console.log(tmp[i]);
      let ccfLevel = tmp[i].user.ccfLevel;
      let hook = '';
      if (ccfLevel >= 4 && ccfLevel <= 5) { hook = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#5eb95e" style="margin-bottom: -3px;"><path d="M16 8C16 6.84375 15.25 5.84375 14.1875 5.4375C14.6562 4.4375 14.4688 3.1875 13.6562 2.34375C12.8125 1.53125 11.5625 1.34375 10.5625 1.8125C10.1562 0.75 9.15625 0 8 0C6.8125 0 5.8125 0.75 5.40625 1.8125C4.40625 1.34375 3.15625 1.53125 2.34375 2.34375C1.5 3.1875 1.3125 4.4375 1.78125 5.4375C0.71875 5.84375 0 6.84375 0 8C0 9.1875 0.71875 10.1875 1.78125 10.5938C1.3125 11.5938 1.5 12.8438 2.34375 13.6562C3.15625 14.5 4.40625 14.6875 5.40625 14.2188C5.8125 15.2812 6.8125 16 8 16C9.15625 16 10.1562 15.2812 10.5625 14.2188C11.5938 14.6875 12.8125 14.5 13.6562 13.6562C14.4688 12.8438 14.6562 11.5938 14.1875 10.5938C15.25 10.1875 16 9.1875 16 8ZM11.4688 6.625L7.375 10.6875C7.21875 10.8438 7 10.8125 6.875 10.6875L4.5 8.3125C4.375 8.1875 4.375 7.96875 4.5 7.8125L5.3125 7C5.46875 6.875 5.6875 6.875 5.8125 7.03125L7.125 8.34375L10.1562 5.34375C10.3125 5.1875 10.5312 5.1875 10.6562 5.34375L11.4688 6.15625C11.5938 6.28125 11.5938 6.5 11.4688 6.625Z"></path></svg>'; }
      else if (ccfLevel >= 6 && ccfLevel <= 7) { hook = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#3498db" style="margin-bottom: -3px;"><path d="M16 8C16 6.84375 15.25 5.84375 14.1875 5.4375C14.6562 4.4375 14.4688 3.1875 13.6562 2.34375C12.8125 1.53125 11.5625 1.34375 10.5625 1.8125C10.1562 0.75 9.15625 0 8 0C6.8125 0 5.8125 0.75 5.40625 1.8125C4.40625 1.34375 3.15625 1.53125 2.34375 2.34375C1.5 3.1875 1.3125 4.4375 1.78125 5.4375C0.71875 5.84375 0 6.84375 0 8C0 9.1875 0.71875 10.1875 1.78125 10.5938C1.3125 11.5938 1.5 12.8438 2.34375 13.6562C3.15625 14.5 4.40625 14.6875 5.40625 14.2188C5.8125 15.2812 6.8125 16 8 16C9.15625 16 10.1562 15.2812 10.5625 14.2188C11.5938 14.6875 12.8125 14.5 13.6562 13.6562C14.4688 12.8438 14.6562 11.5938 14.1875 10.5938C15.25 10.1875 16 9.1875 16 8ZM11.4688 6.625L7.375 10.6875C7.21875 10.8438 7 10.8125 6.875 10.6875L4.5 8.3125C4.375 8.1875 4.375 7.96875 4.5 7.8125L5.3125 7C5.46875 6.875 5.6875 6.875 5.8125 7.03125L7.125 8.34375L10.1562 5.34375C10.3125 5.1875 10.5312 5.1875 10.6562 5.34375L11.4688 6.15625C11.5938 6.28125 11.5938 6.5 11.4688 6.625Z"></path></svg>'; }
      else if (ccfLevel >= 8) { hook = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#f1c40f" style="margin-bottom: -3px;"><path d="M16 8C16 6.84375 15.25 5.84375 14.1875 5.4375C14.6562 4.4375 14.4688 3.1875 13.6562 2.34375C12.8125 1.53125 11.5625 1.34375 10.5625 1.8125C10.1562 0.75 9.15625 0 8 0C6.8125 0 5.8125 0.75 5.40625 1.8125C4.40625 1.34375 3.15625 1.53125 2.34375 2.34375C1.5 3.1875 1.3125 4.4375 1.78125 5.4375C0.71875 5.84375 0 6.84375 0 8C0 9.1875 0.71875 10.1875 1.78125 10.5938C1.3125 11.5938 1.5 12.8438 2.34375 13.6562C3.15625 14.5 4.40625 14.6875 5.40625 14.2188C5.8125 15.2812 6.8125 16 8 16C9.15625 16 10.1562 15.2812 10.5625 14.2188C11.5938 14.6875 12.8125 14.5 13.6562 13.6562C14.4688 12.8438 14.6562 11.5938 14.1875 10.5938C15.25 10.1875 16 9.1875 16 8ZM11.4688 6.625L7.375 10.6875C7.21875 10.8438 7 10.8125 6.875 10.6875L4.5 8.3125C4.375 8.1875 4.375 7.96875 4.5 7.8125L5.3125 7C5.46875 6.875 5.6875 6.875 5.8125 7.03125L7.125 8.34375L10.1562 5.34375C10.3125 5.1875 10.5312 5.1875 10.6562 5.34375L11.4688 6.15625C11.5938 6.28125 11.5938 6.5 11.4688 6.625Z"></path></svg>'; }
      let badge = '';
      if (tmp[i].user.badge !== null && tmp[i].user.badge.length > 0) {
        badge = ` <span class="am-badge am-radius lg-bg-${tmp[i].user.color.toLowerCase()}">${tmp[i].user.badge}</span>`;
      }
      if (ccfLevel === 0) {
        message.push(`<li class="am-comment am-comment-primary feed-li"><div class="lg-left"><a href="https://www.luogu.com.cn/user/${tmp[i].user.uid}" class="center">
        <img src="data:image/jpeg;base64,${await loadUserIcon(parseInt(tmp[i].user.uid))}"
        class="am-comment-avatar"/></a></div><div class="am-comment-main"><header class="am-comment-hd"><div class="am-comment-meta"><span class="feed-username"><a class='${'lg-fg-'+tmp[i].user.color.toLowerCase()+' lg-bold'}' href="https://www.luogu.com.cn/user/${tmp[i].user.uid}"  target="_blank">${tmp[i].user.name}</a>${badge}</span> ${benbenTime.toLocaleString()}<a name="feed-delete" data-feed-id="${tmp[i].id}">删除</a><a name="feed-reply" href="javascript: scrollToId('feed-content')" data-username="${tmp[i].user.name}">回复</a></div></header><div class="am-comment-bd"><span class="feed-comment">${md.render(tmp[i].content)}</span></div></div></li>`);
      } else {
        message.push(`<li class="am-comment am-comment-primary feed-li"><div class="lg-left"><a href="https://www.luogu.com.cn/user/${tmp[i].user.uid}" class="center">
        <img src="data:image/jpeg;base64,${await loadUserIcon(parseInt(tmp[i].user.uid))}"
        class="am-comment-avatar"/></a></div><div class="am-comment-main"><header class="am-comment-hd"><div class="am-comment-meta"><span class="feed-username"><a class='${'lg-fg-'+tmp[i].user.color.toLowerCase()+' lg-bold'}' href="https://www.luogu.com.cn/user/${tmp[i].user.uid}"  target="_blank">${tmp[i].user.name}</a> <a class="sb_amazeui" target="_blank" href="https://www.luogu.com.cn/discuss/show/142324">${hook}</a>${badge}</span> ${benbenTime.toLocaleString()}<a name="feed-delete" data-feed-id="${tmp[i].id}">删除</a><a name="feed-reply" href="javascript: scrollToId('feed-content')" data-username="${tmp[i].user.name}">回复</a></div></header><div class="am-comment-bd"><span class="feed-comment">${md.render(tmp[i].content)}</span></div></div></li>`);
      }
    }
  } else if (mode === "watching") {
    for (let i = tmp.length - 1; i >= 0; i--) {
      if (tmp[i].comment.length === 0)  { continue; } 
      let resInfo = await searchUser(tmp[i].uid);
      let userInfo = resInfo.users[0];
      console.log(tmp[i]);
      console.log(userInfo);
      let ccfLevel = userInfo.ccfLevel;
      let hook = '';
      if (ccfLevel >= 4 && ccfLevel <= 5) { hook = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#5eb95e" style="margin-bottom: -3px;"><path d="M16 8C16 6.84375 15.25 5.84375 14.1875 5.4375C14.6562 4.4375 14.4688 3.1875 13.6562 2.34375C12.8125 1.53125 11.5625 1.34375 10.5625 1.8125C10.1562 0.75 9.15625 0 8 0C6.8125 0 5.8125 0.75 5.40625 1.8125C4.40625 1.34375 3.15625 1.53125 2.34375 2.34375C1.5 3.1875 1.3125 4.4375 1.78125 5.4375C0.71875 5.84375 0 6.84375 0 8C0 9.1875 0.71875 10.1875 1.78125 10.5938C1.3125 11.5938 1.5 12.8438 2.34375 13.6562C3.15625 14.5 4.40625 14.6875 5.40625 14.2188C5.8125 15.2812 6.8125 16 8 16C9.15625 16 10.1562 15.2812 10.5625 14.2188C11.5938 14.6875 12.8125 14.5 13.6562 13.6562C14.4688 12.8438 14.6562 11.5938 14.1875 10.5938C15.25 10.1875 16 9.1875 16 8ZM11.4688 6.625L7.375 10.6875C7.21875 10.8438 7 10.8125 6.875 10.6875L4.5 8.3125C4.375 8.1875 4.375 7.96875 4.5 7.8125L5.3125 7C5.46875 6.875 5.6875 6.875 5.8125 7.03125L7.125 8.34375L10.1562 5.34375C10.3125 5.1875 10.5312 5.1875 10.6562 5.34375L11.4688 6.15625C11.5938 6.28125 11.5938 6.5 11.4688 6.625Z"></path></svg>'; }
      else if (ccfLevel >= 6 && ccfLevel <= 7) { hook = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#3498db" style="margin-bottom: -3px;"><path d="M16 8C16 6.84375 15.25 5.84375 14.1875 5.4375C14.6562 4.4375 14.4688 3.1875 13.6562 2.34375C12.8125 1.53125 11.5625 1.34375 10.5625 1.8125C10.1562 0.75 9.15625 0 8 0C6.8125 0 5.8125 0.75 5.40625 1.8125C4.40625 1.34375 3.15625 1.53125 2.34375 2.34375C1.5 3.1875 1.3125 4.4375 1.78125 5.4375C0.71875 5.84375 0 6.84375 0 8C0 9.1875 0.71875 10.1875 1.78125 10.5938C1.3125 11.5938 1.5 12.8438 2.34375 13.6562C3.15625 14.5 4.40625 14.6875 5.40625 14.2188C5.8125 15.2812 6.8125 16 8 16C9.15625 16 10.1562 15.2812 10.5625 14.2188C11.5938 14.6875 12.8125 14.5 13.6562 13.6562C14.4688 12.8438 14.6562 11.5938 14.1875 10.5938C15.25 10.1875 16 9.1875 16 8ZM11.4688 6.625L7.375 10.6875C7.21875 10.8438 7 10.8125 6.875 10.6875L4.5 8.3125C4.375 8.1875 4.375 7.96875 4.5 7.8125L5.3125 7C5.46875 6.875 5.6875 6.875 5.8125 7.03125L7.125 8.34375L10.1562 5.34375C10.3125 5.1875 10.5312 5.1875 10.6562 5.34375L11.4688 6.15625C11.5938 6.28125 11.5938 6.5 11.4688 6.625Z"></path></svg>'; }
      else if (ccfLevel >= 8) { hook = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="#f1c40f" style="margin-bottom: -3px;"><path d="M16 8C16 6.84375 15.25 5.84375 14.1875 5.4375C14.6562 4.4375 14.4688 3.1875 13.6562 2.34375C12.8125 1.53125 11.5625 1.34375 10.5625 1.8125C10.1562 0.75 9.15625 0 8 0C6.8125 0 5.8125 0.75 5.40625 1.8125C4.40625 1.34375 3.15625 1.53125 2.34375 2.34375C1.5 3.1875 1.3125 4.4375 1.78125 5.4375C0.71875 5.84375 0 6.84375 0 8C0 9.1875 0.71875 10.1875 1.78125 10.5938C1.3125 11.5938 1.5 12.8438 2.34375 13.6562C3.15625 14.5 4.40625 14.6875 5.40625 14.2188C5.8125 15.2812 6.8125 16 8 16C9.15625 16 10.1562 15.2812 10.5625 14.2188C11.5938 14.6875 12.8125 14.5 13.6562 13.6562C14.4688 12.8438 14.6562 11.5938 14.1875 10.5938C15.25 10.1875 16 9.1875 16 8ZM11.4688 6.625L7.375 10.6875C7.21875 10.8438 7 10.8125 6.875 10.6875L4.5 8.3125C4.375 8.1875 4.375 7.96875 4.5 7.8125L5.3125 7C5.46875 6.875 5.6875 6.875 5.8125 7.03125L7.125 8.34375L10.1562 5.34375C10.3125 5.1875 10.5312 5.1875 10.6562 5.34375L11.4688 6.15625C11.5938 6.28125 11.5938 6.5 11.4688 6.625Z"></path></svg>'; }
      let badge = '';
      if (userInfo.badge !== null && userInfo.badge.length > 0) {
        badge = ` <span class="am-badge am-radius lg-bg-${userInfo.color.toLowerCase()}">${userInfo.badge}</span>`;
      }
      if (ccfLevel === 0) {
        message.push(`<li class="am-comment am-comment-primary feed-li"><div class="lg-left"><a href="https://www.luogu.com.cn/user/${userInfo.uid}" class="center">
        <img src="data:image/jpeg;base64,${await loadUserIcon(parseInt(userInfo.uid))}"
        class="am-comment-avatar"/></a></div><div class="am-comment-main"><header class="am-comment-hd"><div class="am-comment-meta"><span class="feed-username"><a class='${'lg-fg-'+userInfo.color.toLowerCase()+' lg-bold'}' href="https://www.luogu.com.cn/user/${userInfo.uid}"  target="_blank">${userInfo.name}</a>${badge}</span> ${tmp[i].time.date.split('.')[0]}<a name="feed-reply" href="javascript: scrollToId('feed-content')" data-username="${userInfo.name}">回复</a></div></header><div class="am-comment-bd"><span class="feed-comment">${md.render(tmp[i].comment)}</span></div></div></li>`);
      } else {
        message.push(`<li class="am-comment am-comment-primary feed-li"><div class="lg-left"><a href="https://www.luogu.com.cn/user/${userInfo.uid}" class="center">
        <img src="data:image/jpeg;base64,${await loadUserIcon(parseInt(userInfo.uid))}"
        class="am-comment-avatar"/></a></div><div class="am-comment-main"><header class="am-comment-hd"><div class="am-comment-meta"><span class="feed-username"><a class='${'lg-fg-'+userInfo.color.toLowerCase()+' lg-bold'}' href="https://www.luogu.com.cn/user/${userInfo.uid}"  target="_blank">${userInfo.name}</a> <a class="sb_amazeui" target="_blank" href="https://www.luogu.com.cn/discuss/show/142324">${hook}</a>${badge}</span> ${tmp[i].time.date.split('.')[0]}<a name="feed-reply" href="javascript: scrollToId('feed-content')" data-username="${userInfo.name}">回复</a></div></header><div class="am-comment-bd"><span class="feed-comment">${md.render(tmp[i].comment)}</span></div></div></li>`);
      }
    }
  }
  return message;
}

export default new SuperCommand({
  onCommand: 'benben',
  handle: async () => {
    while (!globalThis.init) { continue; }
    try {
      if (await getStatus() === UserStatus.SignedOut.toString()) {
        vscode.window.showErrorMessage('未登录');
        return;
      }
    } catch (err) {
      console.error(err)
      vscode.window.showErrorMessage(`${err}`);
      return;
    }
    const mode = await vscode.window.showQuickPick(['我发布的', '我关注的', '全网动态'], { ignoreFocusOut: true });
    if (!mode) {
      return
    }
    const mode2 = (mode === '我发布的' ? 'list' : (mode === '我关注的' ? 'watching' : 'all'));
    if (mode2 === 'all') {
      vscode.window.showInformationMessage('因社区秩序管控需要，全网动态永久关闭。');
      return
    }
    let panel = vscode.window.createWebviewPanel(`犇犇 - ${mode}`, `犇犇 - ${mode}`, vscode.ViewColumn.Two, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(globalThis.resourcesPath)]
    });
    panel.webview.onDidReceiveMessage(async message => {
      console.log(`Got ${message.type} request: message = ${message.data}`)
      if (message.type === 'post') {
        // todo: add error handling in webview
        let cookie = cookieConfig().headers.Cookie;
        console.log(cookie);
        await postBenben(message.data).then(
          async message=>{
            console.log("data: ",message.data)
            panel.webview.postMessage({ type: 'post-result', message })
            vscode.window.showInformationMessage('重新获取犇犇中...')
            let benben = await getBenben(mode2);
            panel.webview.postMessage({ type: 'benbenUpdate', message: benben });
          }
        ).catch(err => {
          console.log("error",err)
          panel.webview.postMessage({ type: 'postError', message: err.message })
        })
      } else if (message.type === 'delete') {
        await deleteBenben(message.data).then(
          async message=>{
            console.log(message.data)
            panel.webview.postMessage({ type: 'delete-result', message })
            vscode.window.showInformationMessage('重新获取犇犇中...')
            let benben = await getBenben(mode2);
            panel.webview.postMessage({ type: 'benbenUpdate', message: benben });
          }
        ).catch(err => {
          console.log(err)
          panel.webview.postMessage({ type: 'deleteError', message: err.message })
        })
      } else if (message.type === 'get'){
        vscode.window.showInformationMessage('重新获取犇犇中...')
          let benben = await getBenben(mode2);
          panel.webview.postMessage({ type: 'benbenUpdate', message: benben });
        // let maxRetryTimes = 3;
        // let retryTimes = 0;
        // while (retryTimes <= maxRetryTimes) {
        //   try {
        //     vscode.window.showInformationMessage('重新获取犇犇中...')
        //     let benben = await getBenben(mode2);
        //     console.log(mode2);
        //     console.log(benben);
        //     panel.webview.postMessage({ type: 'benbennew', message: benben });        
        //     retryTimes = maxRetryTimes + 2; 
        //   } catch (err) {
        //     console.error(err)
        //     vscode.window.showErrorMessage(`获取犇犇失败，已重试 ${retryTimes} 次`);
        //     retryTimes++
        //     await delay(2000)
        //   }          
        // }
        // if (retryTimes === maxRetryTimes + 1) {
        //   vscode.window.showErrorMessage(`重新获取犇犇失败`);
        // }
      } else if (message.type === 'reply') {
        // ???
        throw Error;
      } else {
        ;
      }
      return;
    })
    let panelClosed = false;
    panel.onDidDispose(() => panelClosed = true)
    panel.webview.html = await generateHTML(panel.webview);
    let retryTimes = 0;
    const maxRetryTimes = 2;
    while (!panelClosed && globalThis.islogged && retryTimes <= maxRetryTimes) {
      try {
        vscode.window.showInformationMessage('获取犇犇中...')
        let message = await getBenben(mode2);
        panel.webview.postMessage({ type: 'benbennew', message: message });
        retryTimes = maxRetryTimes + 2 //max+1说明重试次数超限引起错误（下面有if判断），max+2则说明正常结束
      } catch (err) {
        console.error(err)
        vscode.window.showErrorMessage(`获取犇犇失败，已重试 ${retryTimes} 次`);
        retryTimes++
        await delay(2000)
      }
    }
    if (retryTimes === maxRetryTimes + 1) {
      vscode.window.showErrorMessage(`获取犇犇失败`);
    }
  }
})

const generateHTML = async (webview: vscode.Webview) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="${getResourceFilePath(webview, 'jquery.min.js')}"></script>
  <link rel="stylesheet" href="${getResourceFilePath(webview, 'benben.css')}">
  <script>
  const vscode = acquireVsCodeApi();
  $(document).ready(function() {
  $("#feed-submit").click(function () {
    $(this).addClass("am-disabled");
    var content = $('#feed-content').val(), e = this;
    vscode.postMessage({type: 'post', data: content});
    $(e).removeClass("am-disabled");
    $("#feed-content").val('');
  });
  window.addEventListener('message', event => {
    if (event.data.type === 'benbennew') {
      const message = event.data.message;
      for (var i = message.length - 1; i >= 0; i--) {
        $("#feed").prepend(message[i]);
      }
      console.log('complete', message);
    } else if (event.data.type === 'benbenUpdate') {
      $("#feed").empty();
      const message = event.data.message;
      for (var i = message.length - 1; i >= 0; i--) {
        $("#feed").prepend(message[i]);
      }
      console.log('complete', message);
    } else {
      ;
    }
    $("[name=feed-delete]").click(function() {
      vscode.postMessage({type: 'delete', data: \`\${$(this).attr('data-feed-id')}\`});
    });
    $("[name=feed-reply]").click(function reply() {
      scrollToId('feed-content');
      var content = $(this).parents("li.feed-li").find(".feed-comment").text();
      // vscode.postMessage({type: 'reply', data: " || @" + $(this).attr('data-username') + " : " + content});
      $("#feed-content").val(" || @" + $(this).attr('data-username') + " : " + content);
    });
  })});
  </script>
  </head>
  <body>
  <br />
  <div class="lg-article">
  <h2>有什么新鲜事告诉大家</h2>
  <div class="am-form-group am-form">
  <textarea rows="3" id="feed-content"></textarea>
  </div>
  <button class="am-btn am-btn-danger am-btn-sm" id="feed-submit">发射犇犇！</button>
  </div>
  <ul class="am-comments-list am-comments-list-flip" id="feed">
  </ul>
  <script>
    function scrollToId (id) {
      $('html, body').animate({
        scrollTop: ($('#' + id).offset().top)
      }, 500);
    }
  </script>
  </body>
  </html>
  `;
}
