import * as vscode from 'vscode';
import HistoryItem, { ProblemHistoryItem, ContestHistoryItem, trainingHistoryItem } from './historyItem';
import {
  contestType,
  contestVisibility,
  formatTime,
  TrainingTypes
} from '@/utils/shared';
import { searchContest } from '@/utils/api';

type ContestProblemItem = { 
  type: 'contestProblem'; 
  pid: string; 
  title: string; 
  contestId: number;
  score: number;
};

export default class historyTreeviewProvider
  implements vscode.TreeDataProvider<HistoryItem | ContestProblemItem>, vscode.Disposable
{
  private _contestProblemsCache = new Map<number, { pid: string, title: string, score: number }[]>();
  private _lastClickTime = new Map<string, number>();
  private _clickTimeout = 300; // 双击时间间隔（毫秒）
  
  constructor(
    protected getStorage: () => MaybeThenable<HistoryItem[]>,
    protected setStorage: (items: HistoryItem[]) => void
  ) {}
  
  static getItemLabel(element: HistoryItem) {
    return element.type === 'problem'
      ? `${element.pid} ${element.title}` +
          (element.contest ? ` · ${element.contest.contestId}` : ``)
      : element.type === 'training'
        ? `${element.title}`
        : `${element.title}`;
  }
  
  getTreeItem(element: HistoryItem | ContestProblemItem): vscode.TreeItem {
    if (element.type === 'contestProblem') {
      const treeItem: vscode.TreeItem = {
        label: `${element.pid} ${element.title} (满分:${element.score})`,
        command: {
          command: 'luogu.searchProblem',
          title: '打开题目',
          arguments: [{ pid: element.pid, cid: element.contestId }]
        },
        iconPath: new vscode.ThemeIcon('notebook'),
        tooltip: `在比赛中查看题目 ${element.pid}，满分:${element.score}`,
        contextValue: 'luogu.history.contestProblemItem' // 添加contextValue以便匹配菜单项
      };
      return treeItem;
    }
    
    if (element.type === 'problem')
      return {
        label: historyTreeviewProvider.getItemLabel(element),
        command: {
          command: 'luogu.searchProblem',
          title: '打开题目',
          arguments: [{ pid: element.pid, cid: element.contest?.contestId }]
        },
        iconPath: new vscode.ThemeIcon('notebook'),
        tooltip: (() => {
          const md = new vscode.MarkdownString(
            `[${element.pid}](https://www.luogu.com.cn/problem/${element.pid}${element.contest ? `?contestId=${element.contest.contestId}` : ``}) ${element.title}  \n` +
              (element.contest
                ? `关联于比赛 [${element.contest.title}](${vscode.Uri.from({
                    scheme: 'command',
                    path: 'luogu.contest',
                    query: encodeURIComponent(
                      JSON.stringify([element.contest.contestId])
                    )
                  })})`
                : '')
          );
          md.isTrusted = true;
          return md;
        })(),
        contextValue: 'luogu.history.problemItem'
      };
    if (element.type === 'contest')
      return {
        label: historyTreeviewProvider.getItemLabel(element),
        command: {
          command: 'luogu.contest',
          title: '查看比赛',
          arguments: [element.contestId]
        },
        iconPath: new vscode.ThemeIcon('graph'),
        tooltip: new vscode.MarkdownString(
          `[${element.contestId}](https://www.luogu.com.cn/contest/${element.contestId}) ${element.title}  \n` +
            `举办者：[${element.owner.name}](https://www.luogu.com.cn${'uid' in element.owner ? `/user/${element.owner.uid}` : `/team/${element.owner.teamId}`})  \n` +
            `${contestType[element.ruleType]} · ${contestVisibility[element.visibilityType]}${element.rated ? ' · rated' : ''}  \n` +
            `${formatTime(element.startTime * 1000)} - ${formatTime(element.endTime * 1000)}`
        ),
        contextValue: 'luogu.history.contestItem',
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed
      };
    if (element.type === 'training')
      return {
        label: historyTreeviewProvider.getItemLabel(element),
        command: {
          command: 'luogu.traindetails',
          title: '打开题单',
          arguments: [element.trainingId]
        },
        iconPath: new vscode.ThemeIcon('folder'),
        tooltip: new vscode.MarkdownString(
          `[${element.trainingId}](https://www.luogu.com.cn/training/${element.trainingId}) ${element.title}  \n` +
            `创建者：[${element.owner.name}](https://www.luogu.com.cn${'uid' in element.owner ? `/user/${element.owner.uid}` : `/team/${element.owner.teamId}`})  \n` +
            TrainingTypes[element.trainingType]
        ),
        contextValue: 'luogu.history.trainingItem'
      };
    throw new TypeError('Unknown history element type', { cause: element });
  }
  
  async getChildren(element?: HistoryItem | ContestProblemItem): Promise<(HistoryItem | ContestProblemItem)[]> {
    // 如果element存在且是比赛类型，则获取比赛题目列表
    if (element && element.type === 'contest') {
      return await this.getContestProblems(element.contestId);
    }
    
    // 如果是比赛题目类型，不返回子元素
    if (element && element.type === 'contestProblem') {
      return [];
    }
    
    // 默认情况，返回历史记录列表
    return [...(await this.getStorage())].reverse();
  }
  
  private async getContestProblems(contestId: number): Promise<ContestProblemItem[]> {
    // 检查缓存
    if (this._contestProblemsCache.has(contestId)) {
      const cached = this._contestProblemsCache.get(contestId)!;
      return cached.map(p => ({
        type: 'contestProblem',
        pid: p.pid,
        title: p.title,
        contestId: contestId,
        score: p.score
      }));
    }
    
    try {
      // 获取比赛详情
      const contestData = await searchContest(contestId);
      
      // 提取题目列表
      if (contestData.contestProblems) {
        const problems = contestData.contestProblems.map(p => ({
          pid: p.problem.pid,
          title: p.problem.title,
          score: p.score
        }));
        
        // 缓存结果
        this._contestProblemsCache.set(contestId, problems);
        
        // 返回格式化后的题目列表
        return problems.map(p => ({
          type: 'contestProblem',
          pid: p.pid,
          title: p.title,
          contestId: contestId,
          score: p.score
        }));
      }
    } catch (e) {
      console.error('获取比赛题目列表失败:', e);
      vscode.window.showErrorMessage(`获取比赛 ${contestId} 的题目列表失败`);
    }
    
    return [];
  }
  
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  refresh() {
    // 清除缓存
    this._contestProblemsCache.clear();
    this._onDidChangeTreeData.fire();
  }
  dispose() {
    this._onDidChangeTreeData.dispose();
    this._lastClickTime.clear();
  }
  async addItem(item: HistoryItem) {
    let dat = await this.getStorage();
    
    // 如果添加的是比赛题目，则将对应的比赛置顶而不是添加题目本身
    if (item.type === 'problem' && item.contest) {
      // 查找是否已有该比赛的历史记录
      const contestIndex = dat.findIndex(
        x => x.type === 'contest' && x.contestId === item.contest!.contestId
      );
      
      if (contestIndex !== -1) {
        // 如果找到该比赛，将其移至顶部
        const contestItem = dat.splice(contestIndex, 1)[0];
        dat.push(contestItem);
      } else {
        // 如果未找到该比赛，不添加题目到历史记录
        // 这种情况下，我们不修改历史记录
      }
      
      // 更新存储
      this.setStorage(dat);
      this.refresh();
      return;
    }
    
    // 原有的历史记录逻辑
    dat = dat.filter(
      x =>
        historyTreeviewProvider.getItemLabel(item) !==
        historyTreeviewProvider.getItemLabel(x)
    );
    dat.push(item);
    const maxLength =
      vscode.workspace
        .getConfiguration('luogu')
        .get<number>('maxHistoryLength') ?? 256;
    if (dat.length > maxLength) dat.splice(0, dat.length - maxLength);
    this.setStorage(dat);
    this.refresh();
  }
  
  async removeItem(item: HistoryItem | ContestProblemItem) {
    // 比赛题目不需要删除功能，直接返回
    if (item.type === 'contestProblem') {
      return;
    }
    
    // 为普通历史记录项生成唯一标识符
    const itemKey = historyTreeviewProvider.getItemLabel(item);
    
    // 检查是否是双击
    const now = Date.now();
    const lastClick = this._lastClickTime.get(itemKey) || 0;
    
    if (now - lastClick < this._clickTimeout) {
      // 双击，执行删除操作
      this._lastClickTime.delete(itemKey); // 清除点击记录
      
      // 使用原有的删除逻辑
      const dat = (await this.getStorage()).filter(
        x => historyTreeviewProvider.getItemLabel(item) !== historyTreeviewProvider.getItemLabel(x)
      );
      this.setStorage(dat);
      this.refresh();
    } else {
      // 单击，记录点击时间
      this._lastClickTime.set(itemKey, now);
      
      // 设置定时器，在一定时间后清除点击记录
      setTimeout(() => {
        if (this._lastClickTime.get(itemKey) === now) {
          this._lastClickTime.delete(itemKey);
        }
      }, this._clickTimeout);
    }
  }
}