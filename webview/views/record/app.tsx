const { default: React } = await import('react');
import { SubtaskStatus, TestCaseStatus } from 'luogu-api';
import useRecordStatus from './data';

const { formatMemory, formatTime } = await import('@/utils/stringUtils');
const { ProblemNameWithDifficulty, Spinner } = await import('@w/components');
const { RecordStatus, getScoreColor, LanguageString, vscodeLanguageId } =
  await import('@/utils/shared');
const { default: Time } = await import('@w/components/time');
await import('@w/copyablePreElement');

import '@w/common.css';
import './app.css';

const AprilFoolTestcaseBackground = {
  AC: `https://jsdelivrcn.netlify.app/gh/chenyuxuan2009/luogu_submission_better/AC.gif`,
  WA: `https://jsdelivrcn.netlify.app/gh/chenyuxuan2009/luogu_submission_better/WA.gif`,
  TLE: `https://jsdelivrcn.netlify.app/gh/chenyuxuan2009/luogu_submission_better/TLE.gif`,
  MLE: `https://jsdelivrcn.netlify.app/gh/chenyuxuan2009/luogu_submission_better/MLE.gif`,
  RE: `https://jsdelivrcn.netlify.app/gh/chenyuxuan2009/luogu_submission_better/RE.gif`,
  OLE: `https://jsdelivrcn.netlify.app/gh/chenyuxuan2009/luogu_submission_better/OLE.gif`,
  UKE: `https://jsdelivrcn.netlify.app/gh/chenyuxuan2009/luogu_submission_better/UKE.gif`,
  Judging: `https://jsdelivrcn.netlify.app/gh/chenyuxuan2009/luogu_submission_better/Judging.gif`
};
const isRelativeColorSupported = CSS.supports('color', 'hsl(from red h s l)');

export default function App() {
  const record = useRecordStatus();
  console.log(record);
  return (
    <>
      <h1>
        <a href={`https://www.luogu.com.cn/record/` + record.id}>
          R{record.id}
        </a>{' '}
        记录详情
      </h1>
      <div>
        <div>
          <span>所属题目</span>
          <a
            href={
              'command:luogu.searchProblem?' +
              encodeURIComponent(
                JSON.stringify([
                  { pid: record.problem.pid, cid: record.contest?.id }
                ])
              )
            }
          >
            <ProblemNameWithDifficulty
              {...record.problem}
              difficulty={record.problem?.difficulty || 0}
              contestId={record.contest?.id}
            />
          </a>
        </div>
        <div>
          <span>评测状态</span>
          <span
            style={{
              color: RecordStatus[record.status].color,
              fontWeight: 'bold'
            }}
          >
            {RecordStatus[record.status].name}
          </span>
        </div>
        {typeof record.score === 'number' && (
          <div>
            <span>评测分数</span>
            <span
              style={{ fontWeight: 'bold', color: getScoreColor(record.score) }}
            >
              {record.score}
            </span>
          </div>
        )}
        <div>
          <span>提交时间</span>
          <span>
            <Time time={record.submitTime * 1000} />
          </span>
        </div>
        <div>
          <span>语言</span>
          <span>
            {LanguageString[record.language]}
            {record.enableO2 && ' O2'}
          </span>
        </div>
        <div>
          <span>代码长度</span>
          <span>
            {record.sourceCodeLength < 2 ** 10
              ? record.sourceCodeLength + 'B'
              : (record.sourceCodeLength / 2 ** 10).toFixed(2) + 'KiB'}
          </span>
        </div>
        <div>
          <span>用时/内存</span>
          <span>
            {record.time !== null ? formatTime(record.time) : '-'} /{' '}
            {record.memory !== null
              ? formatMemory(record.memory * 2 ** 10)
              : '-'}
          </span>
        </div>
        {record.sourceCode !== undefined && (
          <div>
            <span>源代码</span>
            <a
              href={
                'command:luogu.openUntitledTextDocument?' +
                encodeURIComponent(
                  JSON.stringify({
                    content: record.sourceCode,
                    language: vscodeLanguageId[record.language]
                  })
                )
              }
            >
              在 vscode 中查看
            </a>
          </div>
        )}
      </div>
      {record.status !== 0 && record.status !== -1 && record.status !== 2 && (
        <>
          <hr />
          <div className="testCaseData">
            <h2>测试点信息</h2>
            {record.detail.judgeResult && (
              <TestCaseWarp>{record.detail.judgeResult.subtasks}</TestCaseWarp>
            )}
          </div>
        </>
      )}
      {record.detail.compileResult !== null && (
        <>
          <hr />
          <div>
            <h2>编译信息</h2>
            <p>
              {record.detail.compileResult.success ? '编译成功' : '编译失败'}
            </p>
            {record.detail.compileResult.message !== null && (
              <pre is="copyable-pre">{record.detail.compileResult.message}</pre>
            )}
          </div>
        </>
      )}
    </>
  );
}

function TestCaseWarp({
  children: data
}: {
  children: { [group: number]: SubtaskStatus };
}) {
  return (
    <div>
      {Object.entries(data).map(([subtaskId, subtask]) => (
        <div key={subtaskId}>
          <h3>Subtask #{subtaskId}</h3>
          <div>
            {Object.entries(subtask.testCases).map(([testcase, data]) => (
              <TestCase key={testcase}>{data}</TestCase>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TestCase({ children: data }: { children: TestCaseStatus }) {
  const now = new Date();
  const isAprilFool =
    now.getFullYear() === 2025 &&
    now.getMonth() + 1 === 4 &&
    now.getDate() === 1;
  return (
    <div>
      <div
        style={
          isAprilFool && isRelativeColorSupported
            ? {
                backgroundImage:
                  `linear-gradient(hsl(from ${RecordStatus[data.status].color} h s l / 0.5), hsl(from ${RecordStatus[data.status].color} h s l / 0.5)),` +
                  `url(${AprilFoolTestcaseBackground[RecordStatus[data.status].shortName]})`,
                backgroundSize: 'cover'
              }
            : { backgroundColor: RecordStatus[data.status].color }
        }
      >
        <div>#{data.id + 1}</div>
        <div>
          {data.status !== 1 ? (
            RecordStatus[data.status].shortName
          ) : (
            <Spinner />
          )}
        </div>
        {data.status !== 1 && (
          <div>
            {formatTime(data.time)}/{formatMemory(data.memory * 2 ** 10)}
          </div>
        )}
      </div>
      <div>
        {[
          data.description ? data.description : undefined,
          data.signal ? 'Received signal ' + data.signal : undefined,
          data.score + ' points',
          'Exit with code ' + data.exitCode
        ]
          .filter(x => x !== undefined)
          .join('\n')}
      </div>
    </div>
  );
}
