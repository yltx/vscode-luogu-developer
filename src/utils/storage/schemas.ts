import { Transformers, ResultType } from './utilTypes';
export interface schemas {
  history: import('@/features/history/storageSchema').Schemas;
}
export const transformers: Transformers<schemas> = {
  history: (await import('@/features/history/storageSchema')).transformers
};
export type result = ResultType<schemas>;
