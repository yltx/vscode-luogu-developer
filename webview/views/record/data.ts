import {
  RecordData,
  RecordStatus,
  SubtaskStatus,
  TestCaseStatus,
  ClientboundUpdateRecordStatusMessageData
} from 'luogu-api';

const { default: React } = await import('react');

const context = JSON.parse(
  document.getElementById('lentille-context')!.innerText
) as RecordData;

const isLuoguProblem =
  context.record.problem.type === 'P' ||
  context.record.problem.type === 'B' ||
  context.record.problem.type === 'T' ||
  context.record.problem.type === 'U';

export function processTestcaseData({
  status,
  detail: recordStatus
}: {
  status: number;
  detail: RecordStatus;
}) {
  if (!isLuoguProblem) return recordStatus;
  // not judging
  if (status !== 1) return recordStatus;
  const newJudgeResult = Object.fromEntries(
    Object.entries(context.testCaseGroup).map(([subtask, testcase]) => [
      subtask,
      {
        id: +subtask,
        score: 0,
        status: 1, // Judging
        testCases: Object.fromEntries(
          testcase.map(testcaseId => [
            testcaseId,
            {
              id: testcaseId,
              status: 1, // Judging
              time: NaN,
              memory: NaN,
              score: 0,
              signal: null,
              exitCode: NaN,
              description: 0,
              subtaskID: +subtask
            } satisfies TestCaseStatus
          ])
        ),
        judger: '',
        time: NaN,
        memory: NaN
      } satisfies SubtaskStatus as SubtaskStatus
    ])
  );
  if (!recordStatus.judgeResult)
    recordStatus.judgeResult = {
      subtasks: [],
      finishedCaseCount: 0,
      score: 0,
      status: 0,
      time: 0,
      memory: 0
    };
  Object.entries(recordStatus.judgeResult.subtasks).forEach(
    ([subtask, subtaskStatus]) =>
      Object.entries(subtaskStatus.testCases).forEach(
        ([testcaseID, testcaseStatus]) =>
          (newJudgeResult[subtask].testCases[testcaseID] = testcaseStatus)
      )
  );
  return {
    ...recordStatus,
    judgeResult: {
      ...recordStatus.judgeResult,
      subtasks: newJudgeResult
    }
  };
}

export default function useRecordStatus() {
  const [recordStatus, setRecordStatus] = React.useState<UpdateRecordData>(
    context.record
  );
  React.useEffect(() => {
    window.addEventListener(
      'message',
      ({ data }: MessageEvent<MessageTypes>) => {
        if (data.type === 'updateRecord') {
          data.data.detail = processTestcaseData(data.data);
          setRecordStatus(data.data);
        }
      }
    );
  }, []);
  return { ...context.record, ...recordStatus };
}

type UpdateRecordData = Omit<
  ClientboundUpdateRecordStatusMessageData['record'],
  'score' | 'memory' | 'time'
> & {
  score?: number | null;
  memory: number | null;
  time: number | null;
};

export type MessageTypes = {
  type: 'updateRecord';
  data: UpdateRecordData;
};
