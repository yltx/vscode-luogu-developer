import * as vscode from 'vscode';
import { getRanklist, searchContest } from '@/utils/api';

let statusBar: vscode.StatusBarItem;
// monitored contest info (times in ms)
let monitoredContest:
  | { id: number; name: string; start: number; end: number }
  | undefined = undefined;

let minuteTimer: NodeJS.Timeout | undefined = undefined;
let tickTimer: NodeJS.Timeout | undefined = undefined; // 100ms update for time display
let startEdgeTimer: NodeJS.Timeout | undefined = undefined;
let endEdgeTimer: NodeJS.Timeout | undefined = undefined;
let lastRankText: string | undefined = undefined;

function clearTimers() {
  if (minuteTimer) clearInterval(minuteTimer), (minuteTimer = undefined);
  if (tickTimer) clearInterval(tickTimer), (tickTimer = undefined);
  if (startEdgeTimer)
    clearTimeout(startEdgeTimer), (startEdgeTimer = undefined);
  if (endEdgeTimer) clearTimeout(endEdgeTimer), (endEdgeTimer = undefined);
}

function updateTimeOnly() {
  if (monitoredContest === undefined) return;
  const now = Date.now();
  let text = '$(graph)';
  if (now < monitoredContest.start)
    text += `距开始 ${formatCountdown(monitoredContest.start - now)}`;
  else if (now < monitoredContest.end)
    text += `${formatCountdown(monitoredContest.end - now)}`;
  else text += '已结束';
  text += lastRankText ?? '';
  statusBar.text = text;
  statusBar.show();
}

function formatCountdown(ms: number) {
  let d = ms / 1000;
  const ds = Math.floor((d /= 1)) % 60;
  const dm = Math.floor((d /= 60)) % 60;
  const dh = Math.floor((d /= 60)) % 24;
  const dd = Math.floor((d /= 24));
  return `${
    dd > 0 ? String(dd).padStart(2, '0') + ':' : '' //
  }${
    String(dh).padStart(2, '0') //
  }:${
    String(dm).padStart(2, '0') //
  }:${
    String(ds).padStart(2, '0') //
  }`;
}

async function updateStatus() {
  if (monitoredContest === undefined) {
    // no monitored contest -> hide status bar
    statusBar.hide();
    return;
  }
  try {
    const resp = await getRanklist(monitoredContest.id, 1);
    const r = resp.userRank;
    const rankPart = r === undefined ? '' : ` | rank ${r}`;
    lastRankText = rankPart;
    // set composed text below
  } catch {
    const errPart = ' | $(alert) 无法获取排名';
    lastRankText = errPart;
  }
  // set tooltip/command first, then render composed text using cache
  statusBar.tooltip = `${monitoredContest.name}\n开始: ${new Date(
    monitoredContest.start
  ).toLocaleString()}\n结束: ${new Date(monitoredContest.end).toLocaleString()}`;
  statusBar.command = {
    title: '打开比赛',
    command: 'luogu.contest',
    arguments: [monitoredContest.id]
  };
}

function scheduleMinuteTick() {
  if (minuteTimer) clearInterval(minuteTimer);
  const now = Date.now();
  const delay = 60000 - (now % 60000);
  setTimeout(() => {
    void updateStatus();
    minuteTimer = setInterval(() => void updateStatus(), 60000);
  }, delay);
}

function scheduleEdges() {
  if (startEdgeTimer) clearTimeout(startEdgeTimer);
  if (endEdgeTimer) clearTimeout(endEdgeTimer);
  const now = Date.now();
  if (!monitoredContest) return;
  if (monitoredContest.start && now < monitoredContest.start) {
    startEdgeTimer = setTimeout(() => {
      updateStatus();
      vscode.window.showInformationMessage('比赛已开始。');
    }, monitoredContest.start - now);
  }
  if (monitoredContest.end && now < monitoredContest.end) {
    endEdgeTimer = setTimeout(() => {
      updateStatus();
      vscode.window.showInformationMessage('比赛已结束。');
    }, monitoredContest.end - now);
  }
}

async function loadContestBasics(contestId: number) {
  const data = await searchContest(contestId);
  monitoredContest = {
    id: contestId,
    name: data.contest.name,
    start: data.contest.startTime * 1000,
    end: data.contest.endTime * 1000
  };
}

export function getContestMonitor(): number | undefined {
  return monitoredContest?.id ?? undefined;
}

export async function setContestMonitor(contestId: number) {
  await loadContestBasics(contestId);
  scheduleMinuteTick();
  scheduleEdges();
  // start high-frequency time-only updater
  if (tickTimer) clearInterval(tickTimer);
  tickTimer = setInterval(() => updateTimeOnly(), 100);
  await updateStatus();
}

export async function clearContestMonitor() {
  clearTimers();
  monitoredContest = undefined;
  lastRankText = undefined;
  statusBar.hide();
}

export default function registerContestMonitor(
  context: vscode.ExtensionContext
) {
  statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBar.name = 'Luogu Contest Monitor';
  statusBar.text = '$(watch) 比赛监视器: 未设置';
  statusBar.tooltip = '点击以选择比赛';
  statusBar.command = 'luogu.contest';
  statusBar.hide();
  context.subscriptions.push(statusBar);
  context.subscriptions.push({ dispose: () => clearTimers() });
}
