import * as vscode from 'vscode';
import axios from 'axios';
import { ProblemData } from 'luogu-api';
import { processAxiosError } from '@/utils/workspaceUtils';

const cphPort = 27121;

// https://github.com/agrawal-d/cph/blob/63977514a5cc021f181cb86a1a482f6bccb8f904/src/types.ts#L64-L80
interface CphRequestType {
  name: string;
  url: string;
  // interactive: boolean; // seems haven't been used in cph
  memoryLimit: number;
  timeLimit: number;
  group: string;
  tests: {
    input: string;
    output: string;
    id: number;
  }[];
}

export async function checkCPH() {
  return await axios
    .get(`http://localhost:${cphPort}`)
    .then(() => true)
    .catch(() => false);
}
export async function sendCphMessage(data: ProblemData) {
  const config = vscode.workspace.getConfiguration('luogu').get('cphStyle') as [
    'ProblemID',
    'ProblemName',
    'ProblemIDwithProblemName'
  ][number];
  await axios
    .post(`http://localhost:${cphPort}`, {
      name:
        'Luogu' +
        (config === 'ProblemID' || config === 'ProblemIDwithProblemName'
          ? ' - ' + data.problem.pid
          : '') +
        (config === 'ProblemName' || config === 'ProblemIDwithProblemName'
          ? ' - ' + data.problem.title
          : ''),
      url:
        'https://www.luogu.com.cn/problem/' +
        data.problem.pid +
        (data.contest ? '?contestId=' + data.contest.id : ''),
      memoryLimit: Math.max(...data.problem.limits.memory),
      timeLimit: Math.max(...data.problem.limits.time),
      tests: data.problem.samples.map((d, i) => ({
        input: d[0],
        output: d[1],
        id: i
      })),
      group: 'luogu' + (data.contest ? ' - ' + data.contest.id : '')
    } satisfies CphRequestType)
    .catch(processAxiosError('传送 CPH '));
}
