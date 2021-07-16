import SuperCommand from "../SuperCommand"
import * as vscode from 'vscode'
import { difficluty, problemset } from "@/utils/shared"
import { getSelectedDifficulty, getSelectedProblemset } from "@/utils/workspaceUtils"
import axios from "axios";
import showProblem from "@/utils/showProblem";

export default new SuperCommand({
  onCommand: 'random',
  handle: async () => {
    const SelectedDifficulty = vscode.workspace.getConfiguration('luogu').get<string>('defaultDifficulty')!
    let diff: string [] = []
    for (let item in difficluty) {
      if (isNaN(Number(item))) diff.push(item)
    }
    const userdifficulty = vscode.workspace.getConfiguration('luogu').get<boolean>('showSelectDifficultyHint') ? (await vscode.window.showQuickPick(diff).then((value) => {
      if (value === undefined){
        return undefined
      }
      const v = getSelectedDifficulty(value);
      return (v === -1 || !v) ? 0 : v;
    })) : getSelectedDifficulty(SelectedDifficulty);
    const SelectedProblemset = vscode.workspace.getConfiguration('luogu').get<string>('defaultProblemSet')!
    let prob: string [] = []
    for (let item in problemset) {
      if (isNaN(Number(item))) prob.push(item)
    }
    const userproblemset = vscode.workspace.getConfiguration('luogu').get<boolean>('showSelectProblemsetHint') ? (await vscode.window.showQuickPick(prob).then((value) => {
      if (value === undefined){
        return undefined
      }
      const v = getSelectedProblemset(value);
      return (v === null || !v) ? '' : v;
    })) : getSelectedProblemset(SelectedProblemset)
    axios.get(`https://www.luogu.com.cn/problem/list?difficulty=${userdifficulty}&type=${userproblemset}&page=1&_contentOnly=1`).then(res => res.data)
      .then(res => {
        if (res.code !== 200) {
          throw Error(res.currentData.errorMessage)
        }
        console.log(res)
        const problem_count = res['currentData']['problems']['count'],page_count = Math.ceil(problem_count / 50),rand_page = Math.floor(Math.random()*page_count) + 1;
        axios.get(`https://www.luogu.com.cn/problem/list?difficulty=${userdifficulty}&type=${userproblemset}&page=${rand_page}&_contentOnly=1`).then(res => res.data)
          .then(async res => {
            if (res.code !== 200) {
              throw Error(res.currentData.errorMessage)
            }
            const rand_num = Math.floor(Math.random()*Math.min(problem_count-50*(rand_page-1),50))
            console.log(rand_num)
            console.log(res['currentData']['problems']['result'][rand_num]['pid'])
            await showProblem(res['currentData']['problems']['result'][rand_num]['pid'],'')
            return
          })
      }).catch(err => {
        if (err.response) {
          throw err.response.data;
        } else if (err.request) {
          throw Error('请求超时，请重试')
        } else {
          throw err;
        }
      })
  }
})