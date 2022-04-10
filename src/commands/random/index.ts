import SuperCommand from '../SuperCommand'
import * as vscode from 'vscode'
import { difficulty, problemset } from '@/utils/shared'
import { getSelectedDifficulty, getSelectedProblemset } from '@/utils/workspaceUtils'
import axios from 'axios';
import showProblem from '@/utils/showProblem';

export default new SuperCommand({
  onCommand: 'random',
  handle: async () => {
    const selectedDifficulty = vscode.workspace.getConfiguration('luogu').get<string>('defaultDifficulty')!
    let diff: string[] = []
    for (let item in difficulty) {
      if (isNaN(Number(item))) { diff.push(item) }
    }
    const userdifficulty = vscode.workspace.getConfiguration('luogu').get<boolean>('showSelectDifficultyHint') ? (await vscode.window.showQuickPick(diff).then((value) => {
      if (value === undefined) {
        return undefined
      }
      const v = getSelectedDifficulty(value);
      return (v === -1 || !v) ? 0 : v;
    })) : getSelectedDifficulty(selectedDifficulty);
    const selectedProblemset = vscode.workspace.getConfiguration('luogu').get<string>('defaultProblemSet')!
    let prob: string[] = []
    for (let item in problemset) {
      if (isNaN(Number(item))) { prob.push(item) }
    }
    const userProblemset = vscode.workspace.getConfiguration('luogu').get<boolean>('showSelectProblemsetHint') ? (await vscode.window.showQuickPick(prob).then((value) => {
      if (value === undefined) {
        return undefined
      }
      const v = getSelectedProblemset(value);
      return (v === null || !v) ? '' : v;
    })) : getSelectedProblemset(selectedProblemset)
    axios.get(`https://www.luogu.com.cn/problem/list?difficulty=${userdifficulty}&type=${userProblemset}&page=1&_contentOnly=1`).then(res => res.data)
      .then(async res => {
        if (res.code !== 200) {
          throw Error(res.currentData.errorMessage)
        }
        console.log(res)
        const problemCount = res['currentData']['problems']['count'];
        const pageCount = Math.ceil(problemCount / 50);
        const randPage = Math.floor(Math.random() * pageCount) + 1;

        await axios.get(`https://www.luogu.com.cn/problem/list?difficulty=${userdifficulty}&type=${userProblemset}&page=${randPage}&_contentOnly=1`).then(res => res.data)
          .then(async res => {
            if (res.code !== 200) {
              throw Error(res.currentData.errorMessage)
            }
            const randNum = Math.floor(Math.random() * Math.min(problemCount - 50 * (randPage - 1), 50))
            console.log(randNum)
            console.log(res['currentData']['problems']['result'][randNum]['pid'])
            await showProblem(res['currentData']['problems']['result'][randNum]['pid'], '')
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
