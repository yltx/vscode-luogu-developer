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
};
export type trainingHistoryItem = {
  type: 'training';
  trainingId: number;
  title: string;
};
type HistoryItem =
  | ProblemHistoryItem
  | ContestHistoryItem
  | trainingHistoryItem;
export default HistoryItem;
