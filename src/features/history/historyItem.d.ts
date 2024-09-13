export type ProblemHistoryItem = {
  type: 'problem';
  pid: string;
  contest?: { contestId: number; title: string };
  title: string;
};
export type ContestHistoryItem = {
  type: 'contest';
  contestId: number;
  title: string;
  owner: { teamId: number; name: string } | { uid: number; name: string };
  visibilityType: number;
  ruleType: number;
  rated: boolean;
  startTime: number;
  endTime: number;
};
export type trainingHistoryItem = {
  type: 'training';
  trainingId: number;
  title: string;
  trainingType: number;
  owner: { teamId: number; name: string } | { uid: number; name: string };
};
type HistoryItem =
  | ProblemHistoryItem
  | ContestHistoryItem
  | trainingHistoryItem;
export default HistoryItem;
