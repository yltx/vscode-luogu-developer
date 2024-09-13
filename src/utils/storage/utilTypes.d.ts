type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
type StorageDataStructure<T, Version extends JsonValue> = {
  version: Version;
  data: T;
};
type lastElement<T extends unknown[]> = T extends [...unknown[], infer Q]
  ? Q
  : never;

export type VersionTransformType<T extends JsonValue[]> = T extends [
  ...infer R extends JsonValue[],
  infer Q extends JsonValue,
  infer P extends JsonValue
]
  ? [...VersionTransformType<[...R, Q]>, (lst: Q) => P]
  : T extends [infer P]
    ? [(lst: void) => P]
    : never;

export type Transformers<T> = {
  [key in keyof T]: T[key] extends JsonValue[]
    ? VersionTransformType<T[key]>
    : never;
};

export type ResultType<T> = {
  [key in keyof T]: T[key] extends unknown[] ? lastElement<T[key]> : T[key];
};
