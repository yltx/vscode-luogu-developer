const { default: React, useEffect, useState } = await import('react');
const { VSCodeButton } = await import('@vscode/webview-ui-toolkit/react');
const { FontAwesomeIcon } = await import('@fortawesome/react-fontawesome');
const { faChevronDown, faBook } = await import(
  '@fortawesome/free-solid-svg-icons'
);
const { ProblemDifficultyTag } = await import('@w/utils');
const { default: Markdown } = await import('@w/markdownViewer');
const { ProblemTag } = await import('@w/utils');
const { default: send } = await import('@w/webviewRequest');
import { ProblemData } from 'luogu-api';

import CphIcon from './cphIcon';
import '@w/common.css';
import './app.css';

function formatTimeLimit(timeLimit: number[]) {
  const mintime = Math.min(...timeLimit),
    maxtime = Math.max(...timeLimit);
  let mintimestr: string, maxtimestr: string;
  if (mintime < 1e3) mintimestr = `${mintime}ms`;
  else if (mintime < 60e3) mintimestr = `${(mintime / 1e3).toFixed(2)}s`;
  else mintimestr = `${(mintime / 60e3).toFixed(2)}min`;
  if (maxtime < 1e3) maxtimestr = `${maxtime}ms`;
  else if (maxtime < 60e3) maxtimestr = `${(maxtime / 1e3).toFixed(2)}s`;
  else maxtimestr = `${(maxtime / 60e3).toFixed(2)}min`;
  return mintimestr == maxtimestr ? mintimestr : `${mintimestr}~${maxtimestr}`;
}

function formatMemoryLimit(memoryLimit: number[]) {
  const minmemory = Math.min(...memoryLimit),
    maxmemory = Math.max(...memoryLimit);
  let minmemorystr: string, maxmemorystr: string;
  if (minmemory < 2 ** 1) minmemorystr = `${minmemory}KB`;
  else if (minmemory < 2 ** 20)
    minmemorystr = `${(minmemory / 2 ** 10).toFixed(2)}MB`;
  else minmemorystr = `${(minmemory / 2 ** 20).toFixed(2)}GB`;
  if (maxmemory < 2 ** 1) maxmemorystr = `${maxmemory}KB`;
  else if (maxmemory < 2 ** 20)
    maxmemorystr = `${(maxmemory / 2 ** 10).toFixed(2)}MB`;
  else maxmemorystr = `${(maxmemory / 2 ** 20).toFixed(2)}GB`;
  return minmemorystr == maxmemorystr
    ? minmemorystr
    : `${minmemorystr}~${maxmemorystr}`;
}

export default function Problem({ children: data }: { children: ProblemData }) {
  const [cphType, setCphType] = useState(false);
  useEffect(
    () => void send('checkCph', undefined).then(res => setCphType(res)),
    []
  );
  return (
    <>
      <header>
        <div>
          <h1>
            <a
              href={
                'https://www.luogu.com.cn/problem/' +
                data.problem.pid +
                (data.contest ? '?contestId=' + data.contest.id : '')
              }
            >
              {data.problem.pid}
            </a>{' '}
            {data.problem.title}
          </h1>
          <div>
            {cphType && (
              <VSCodeButton
                onClick={() => send('jumpToCph', undefined)}
                appearance="primary"
              >
                <CphIcon /> 传送至 CPH
              </VSCodeButton>
            )}
            {data.problem.type !== 'T' &&
              data.problem.type !== 'U' &&
              !data.contest && (
                <VSCodeButton
                  appearance="primary"
                  onClick={() => send('searchSolution', undefined)}
                >
                  <FontAwesomeIcon icon={faBook} /> 查看题解
                </VSCodeButton>
              )}
          </div>
        </div>
        <div>
          <div>
            <div>时间限制</div>
            <div>{formatTimeLimit(data.problem.limits.time)}</div>
          </div>
          <div>
            <div>内存限制</div>
            <div>{formatMemoryLimit(data.problem.limits.memory)}</div>
          </div>
          <div>
            <div>题目难度</div>
            <div>
              <ProblemDifficultyTag difficulty={data.problem.difficulty} />
            </div>
          </div>
          <div className={data.problem.tags.length ? 'haveTag' : undefined}>
            <div>题目标签</div>
            <div>
              {data.problem.tags.length ? (
                <FontAwesomeIcon icon={faChevronDown} />
              ) : (
                '暂无标签'
              )}
            </div>
            {data.problem.tags.length ? (
              <div>
                <div>
                  {data.problem.tags.map((x, i) => (
                    <ProblemTag key={i} tag={x} />
                  ))}
                </div>
              </div>
            ) : undefined}
          </div>
        </div>
      </header>
      <div>
        {data.problem.background && (
          <div>
            <h2>题目背景</h2>
            <Markdown>{data.problem.background}</Markdown>
          </div>
        )}
        {data.problem.description && (
          <div>
            <h2>题目描述</h2>
            <Markdown>{data.problem.description}</Markdown>
          </div>
        )}
        {data.problem.inputFormat && (
          <div>
            <h2>输入格式</h2>
            <Markdown>{data.problem.inputFormat}</Markdown>
          </div>
        )}
        {data.problem.outputFormat && (
          <div>
            <h2>输出格式</h2>
            <Markdown>{data.problem.outputFormat}</Markdown>
          </div>
        )}
        {data.problem.translation && (
          <div>
            <h2>题意翻译</h2>
            <Markdown>{data.problem.translation}</Markdown>
          </div>
        )}
        {data.problem.samples && (
          <div>
            <h2>输入输出样例</h2>
            <div className="problemSamples">
              {data.problem.samples.map(([input, output], id) => (
                <div key={id}>
                  <div>
                    <h3>输入#{id + 1}</h3>
                    <pre is="copyable-pre">
                      <code>{input}</code>
                    </pre>
                  </div>
                  <div>
                    <h3>输出#{id + 1}</h3>
                    <pre is="copyable-pre">
                      <code>{output}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.problem.hint && (
          <div>
            <h2>说明/提示</h2>
            <Markdown>{data.problem.hint}</Markdown>
          </div>
        )}
      </div>
    </>
  );
}
