import { VersionTransformType } from '@/utils/storage/utilTypes';
import HistoryItem from './historyItem';
export type Schemas = [HistoryItem[]];
export const transformers: VersionTransformType<Schemas> = [() => []];
