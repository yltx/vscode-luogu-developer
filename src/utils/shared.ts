import axios from 'axios';
import { mapColorsToValues } from './color';

'use strict';

export enum UserStatus {
  SignedIn = 1,
  SignedOut = 2
}

export const RecordStatus: Record<
  number,
  { name: string; shortName: string; color: string }
> = {
  0: {
    name: 'Waiting',
    shortName: 'Waiting',
    color: 'rgb(20, 85, 143)'
  },
  1: {
    name: 'Judging',
    shortName: 'Judging',
    color: 'rgb(52, 152, 219)'
  },
  2: {
    name: 'Compile Error',
    shortName: 'CE',
    color: 'rgb(250, 219, 20)'
  },
  3: {
    name: 'Output Limit Exceeded',
    shortName: 'OLE',
    color: '#001277'
  },
  4: {
    name: 'Memory Limit Exceeded',
    shortName: 'MLE',
    color: '#001277'
  },
  5: {
    name: 'Time Limit Exceeded',
    shortName: 'TLE',
    color: '#001277'
  },
  6: {
    name: 'Wrong Answer',
    shortName: 'WA',
    color: '#fb6340'
  },
  7: {
    name: 'Runtime Error',
    shortName: 'RE',
    color: '#8e44ad'
  },
  11: {
    name: 'Unknown Error',
    shortName: 'UKE',
    color: 'rgb(14, 29, 105)'
  },
  12: {
    name: 'Accepted',
    shortName: 'AC',
    color: 'rgb(82, 196, 26)'
  },
  14: {
    name: 'Unaccepted',
    shortName: 'Unaccepted',
    color: 'rgb(231, 76, 60)'
  },
  21: {
    name: 'Hack Success',
    shortName: 'Hack Success',
    color: 'rgb(82, 196, 26)'
  },
  22: {
    name: 'Hack Failure',
    shortName: 'Hack Failure',
    color: 'rgb(231, 76, 60)'
  },
  23: {
    name: 'Hack Skipped',
    shortName: 'Hack Skipped',
    color: '#001277'
  },
  '-1': {
    name: 'Unshown',
    shortName: 'Unshown',
    color: 'rgb(38, 38, 38)'
  }
};
export enum colorStyle {
  'grey' = 'rgb(191,191,191)',
  'Gray' = 'rgb(191,191,191)',
  'blue' = 'rgb(52, 152, 219)',
  'Blue' = 'rgb(52, 152, 219)',
  'green' = 'rgb(82, 196, 26)',
  'Green' = 'rgb(82, 196, 26)',
  'orange' = 'rgb(243, 156, 17)',
  'Orange' = 'rgb(243, 156, 17)',
  'red' = 'rgb(254, 76, 97)',
  'Red' = 'rgb(254, 76, 97)',
  'purple' = 'rgb(157, 61, 207)',
  'Purple' = 'rgb(157, 61, 207)',
  'cheater' = 'rgb(173, 139, 0)',
  'Cheater' = 'rgb(173, 139, 0)'
}

export const ContestRuleTypes = mapColorsToValues({
  '1': {
    id: 1,
    name: 'OI',
    color: 'orange-3'
  },
  '2': {
    id: 2,
    name: 'ICPC',
    color: 'purple-3'
  },
  '3': {
    id: 3,
    name: '乐多',
    color: 'gold-3'
  },
  '4': {
    id: 4,
    name: 'IOI',
    color: 'gold-3'
  },
  '5': {
    id: 5,
    name: 'CodeForces (暂不可用)',
    color: 'gold-3'
  }
} as const);

export const ContestVisibilityTypes = mapColorsToValues([
  {
    id: 0,
    name: '封禁比赛',
    color: 'grey-5',
    userCreatable: false,
    scope: 'disabled',
    invitation: false
  },
  {
    id: 1,
    name: '官方比赛',
    color: 'red-3',
    userCreatable: false,
    scope: 'global',
    invitation: false
  },
  {
    id: 2,
    name: '团队公开赛',
    color: 'green-4',
    userCreatable: false,
    scope: 'team',
    invitation: false
  },
  {
    id: 3,
    name: '团队内部赛',
    color: 'blue-3',
    userCreatable: true,
    scope: 'team',
    invitation: false
  },
  {
    id: 4,
    name: '个人公开赛',
    color: 'blue-3',
    userCreatable: false,
    scope: 'personal',
    invitation: false
  },
  {
    id: 5,
    name: '个人邀请赛',
    color: 'lapis-3',
    userCreatable: true,
    scope: 'personal',
    invitation: true
  },
  {
    id: 6,
    name: '团队邀请赛',
    color: 'lapis-3',
    userCreatable: true,
    scope: 'team',
    invitation: true
  },
  {
    id: 7,
    name: '团队公开赛 (待审核)',
    color: 'green-4',
    userCreatable: false,
    scope: 'team',
    invitation: false
  },
  {
    id: 8,
    name: '个人公开赛 (待审核)',
    color: 'lapis-3',
    userCreatable: false,
    scope: 'personal',
    invitation: false
  }
] as const);
export const contestType: string[] = [
  '',
  'OI',
  'ACM',
  '乐多',
  'IOI',
  'CodeForces (暂不可用)'
];
export const contestStyle: string[] = [
  '',
  'color: rgb(255, 255, 255); background: rgb(243, 156, 17);', // OI
  'color: rgb(255, 255, 255); background: rgb(157, 61, 207);', // ACM
  'color: rgb(255, 255, 255); background: rgb(255, 193, 22);', // 乐多
  'color: rgb(255, 255, 255); background: rgb(255, 193, 22);', // IOI
  'color: rgb(255, 255, 255); background: rgb(255, 193, 22);' // CodeForces (暂不可用)
];
export enum contestRated {
  'false' = 'display: none',
  'true' = 'color: rgb(255, 255, 255); background: rgb(82, 196, 26);'
}
export const contestVisibility: string[] = [
  '封禁比赛',
  '官方比赛',
  '团队公开赛',
  '团队内部赛',
  '个人公开赛',
  '个人邀请赛',
  '团队邀请赛',
  '团队公开赛 (待审核)',
  '个人公开赛 (待审核)'
];
export const contestVisibilityStyle: string[] = [
  '',
  'color: rgb(255, 255, 255); background: rgb(231, 76, 60);',
  'color: rgb(255, 255, 255); background: rgb(34, 112, 10);',
  'color: rgb(255, 255, 255); background: rgb(52, 152, 219);',
  'color: rgb(255, 255, 255); background: rgb(52, 152, 219);',
  'color: rgb(255, 255, 255); background: rgb(41, 73, 180);',
  'color: rgb(255, 255, 255); background: rgb(41, 73, 180);'
];

export enum difficultyID {
  '暂无评定' = 0,
  '入门' = 1,
  '普及-' = 2,
  '普及/提高-' = 3,
  '普及+/提高' = 4,
  '提高+/省选-' = 5,
  '省选/NOI-' = 6,
  'NOI/NOI+/CTSC' = 7
}

export enum problemset {
  '洛谷题库' = 'P',
  '入门与面试' = 'B',
  'CodeForces' = 'CF',
  'SPOJ' = 'SP',
  'AtCoder' = 'AT',
  'UVA' = 'UVA'
}

export const difficultyName = [
  '暂无评定',
  '入门',
  '普及-',
  '普及/提高-',
  '普及+/提高',
  '提高+/省选-',
  '省选/NOI-',
  'NOI/NOI+/CTSC'
];
// Reference: https://www.luogu.com.cn/paste/3ez54nl2
export const difficultyColor = [
  '#BFBFBF',
  '#FE4C61',
  '#F39C11',
  '#FFC116',
  '#52C41A',
  '#3498DB',
  '#9D3DCF',
  '#0E1D69'
];

// 动态加载标签数据，并缓存至本地
export type RawTag = { id: number; name: string; type: number; parent: number | null };
type TagsCache = { tags: RawTag[]; version?: number };
const TAG_SOURCE = 'https://www.luogu.com.cn/_lfe/tags';
const TAG_CACHE_KEY = 'luogu-tags-cache';
const TAG_COLORS: Record<number, string> = {
  1: '#52c41a',
  2: '#2949b4',
  3: '#13c2c2',
  4: '#3498db',
  5: '#f39c11',
  6: '#072401'
};

const globalTagCache =
  (globalThis as { __luoguTagsCache?: Partial<TagsCache> }).__luoguTagsCache ??
  {};
(globalThis as { __luoguTagsCache?: Partial<TagsCache> }).__luoguTagsCache =
  globalTagCache;

export const tagsData: Record<number, RawTag & { color: string }> = {};
export let tagsVersion: number | undefined;
let loadingTags: Promise<void> | undefined;

function applyTags(tags: TagsCache['tags'], version?: number) {
  for (const key of Object.keys(tagsData))
    delete (tagsData as Record<string, unknown>)[key];
  for (const tag of tags)
    tagsData[tag.id] = { ...tag, color: TAG_COLORS[tag.type] ?? '#000000' };
  tagsVersion = version;
}

function loadTagsFromCache() {
  try {
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(TAG_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as TagsCache;
        if (Array.isArray(parsed.tags)) {
          applyTags(parsed.tags, parsed.version);
          globalTagCache.tags = parsed.tags;
          globalTagCache.version = parsed.version;
          return;
        }
      }
    }
  } catch (err) {
    console.error('读取标签缓存失败', err);
  }
  if (Array.isArray(globalTagCache.tags))
    applyTags(globalTagCache.tags, globalTagCache.version);
}

function persistTagsCache(cache: TagsCache) {
  globalTagCache.tags = cache.tags;
  globalTagCache.version = cache.version;
  try {
    if (typeof localStorage !== 'undefined')
      localStorage.setItem(TAG_CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.error('写入标签缓存失败', err);
  }
}

async function fetchTagsFromRemote() {
  const { data } = await axios.get<{ tags: TagsCache['tags']; version?: number }>(
    TAG_SOURCE,
    { headers: { 'Cache-Control': 'no-cache' } }
  );
  if (Array.isArray(data.tags)) {
    applyTags(data.tags, data.version);
    persistTagsCache({ tags: data.tags, version: data.version });
  }
}

export function ensureTagsData(force = false) {
  if (loadingTags && !force) return loadingTags;
  loadingTags = fetchTagsFromRemote().catch(err => {
    console.error('Failed to refresh tags from Luogu', err);
  }).finally(() => {
    loadingTags = undefined;
  });
  return loadingTags;
}

loadTagsFromCache();
void ensureTagsData();


export const formatTime = (
  date: Date | number,
  fmt: string = 'yyyy-MM-dd hh:mm:ss'
) => {
  if (typeof date == 'number') date = new Date(date);
  const o = {
    'y+': date.getFullYear(),
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    'S+': date.getMilliseconds()
  };
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      if (k === 'y+') {
        fmt = fmt.replace(RegExp.$1, ('' + o[k]).substr(4 - RegExp.$1.length));
      } else if (k === 'S+') {
        let lens = RegExp.$1.length;
        lens = lens === 1 ? 3 : lens;
        fmt = fmt.replace(
          RegExp.$1,
          ('00' + o[k]).substr(('' + o[k]).length - 1, lens)
        );
      } else {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1
            ? o[k]
            : ('00' + o[k]).substr(('' + o[k]).length)
        );
      }
    }
  }
  return fmt;
};

export const changeTime = (x: number) => {
  let res = '';
  if (x >= 86400) {
    res += Math.floor(x / 86400).toString() + ' 天 ';
    x -= Math.floor(x / 86400) * 86400;
  }
  if (x >= 3600) {
    res += Math.floor(x / 3600).toString() + ' 小时 ';
    x -= Math.floor(x / 3600) * 3600;
  }
  if (x >= 60) {
    res += Math.floor(x / 60).toString() + ' 分 ';
    x -= Math.floor(x / 60) * 60;
  }
  if (x > 0) {
    res += x.toString() + ' 秒 ';
  }
  return res;
};

export const ArticleCategory = [
  '个人记录',
  '题解',
  '科技·工程',
  '算法·理论',
  '生活·游记',
  '学习·文化课',
  '休闲·娱乐',
  '闲话'
] as const;

export const TrainingTypes = [
  '隐藏题单',
  '官方题单',
  '团队私有',
  '团队精选',
  '团队作业',
  '个人私有',
  '个人精选',
  '团队公开',
  '个人公开'
];

export const languageFamily = {
  Pascal: { Pascal: { id: 1 }, 'Pascal with O2': { id: 1, O2: true } },
  C: { C: { id: 2 }, 'C with O2': { id: 2, O2: true } },
  'C++': {
    'C++14 (GCC 9)': { id: 28 },
    'C++14 (GCC 9) with O2': { id: 28, O2: true },
    'C++98': { id: 3 },
    'C++98 with O2': { id: 3, O2: true },
    'C++11': { id: 4 },
    'C++11 with O2': { id: 4, O2: true },
    'C++14': { id: 11 },
    'C++14 with O2': { id: 11, O2: true },
    'C++17': { id: 12 },
    'C++17 with O2': { id: 12, O2: true },
    'C++20': { id: 27 },
    'C++20 with O2': { id: 27, O2: true }
  },
  Python: {
    'Python 3': { id: 7 },
    'PyPy 3': { id: 25 }
  },
  Java: {
    'Java 8': { id: 8 },
    'Java 21': { id: 33 }
  },
  'Node.js LTS': { id: 9 },
  Ruby: { id: 13 },
  Go: { id: 14 },
  Rust: { Rust: { id: 15 }, 'Rust with O2': { id: 15, O2: true } },
  PHP: { id: 16 },
  'C# Mono': { id: 17 },
  Haskell: { Haskell: { id: 19 }, 'Haskell with O2': { id: 19, O2: true } },
  'Kotlin/JVM': { id: 21 },
  Scala: { id: 22 },
  Perl: { id: 23 },
  OCaml: { Ocaml: { id: 30 }, 'OCaml with O2': { id: 30, O2: true } },
  Julia: { id: 31 },
  Lua: { id: 32 }
} as const;
export const fileExtToLanguage = {
  pas: 'Pascal',
  c: 'C',
  cc: 'C++',
  cpp: 'C++',
  cxx: 'C++',
  py: 'Python',
  java: 'Java',
  js: 'Node.js LTS',
  rb: 'Ruby',
  go: 'Go',
  rs: 'Rust',
  php: 'PHP',
  cs: 'C# Mono',
  hs: 'Haskell',
  kt: 'Kotlin/JVM',
  scala: 'Scala',
  pl: 'Perl',
  ml: 'OCaml',
  jl: 'Julia',
  lua: 'Lua'
} as const satisfies Record<string, keyof typeof languageFamily>;

export const defaultLanguageVersion = {
  'C++': 'C++14 (GCC 9) with O2',
  C: 'C with O2',
  Pascal: 'Pascal with O2',
  Python: 'PyPy 3',
  Java: 'Java 21',
  Rust: 'Rust with O2',
  Haskell: 'Haskell with O2',
  OCaml: 'OCaml with O2'
};

export function getScoreColor(score: number): string {
  return score < 30
    ? 'rgb(231, 76, 60)'
    : score < 80
      ? 'rgb(243, 156, 17)'
      : 'rgb(82, 196, 26)';
}

export const LanguageString: Record<number, string> = {
  1: 'Pascal',
  2: 'C',
  3: 'C++98',
  4: 'C++11',
  5: '提交答案',
  6: 'Python 2',
  7: 'Python 3',
  8: 'Java 8',
  9: 'Node.js LTS',
  10: 'Shell',
  11: 'C++14',
  12: 'C++17',
  13: 'Ruby',
  14: 'Go',
  15: 'Rust',
  16: 'PHP',
  17: 'C# Mono',
  18: 'Visual Basic Mono',
  19: 'Haskell',
  20: 'Kotlin/Native',
  21: 'Kotlin/JVM',
  22: 'Scala',
  23: 'Perl',
  24: 'PyPy 2',
  25: 'PyPy 3',
  26: '文言',
  27: 'C++20',
  28: 'C++14 (GCC 9)',
  29: 'F#.NET',
  30: 'OCaml',
  31: 'Julia',
  32: 'Lua',
  33: 'Java 21'
};

export const vscodeLanguageId: Record<number, string> = {
  1: 'pascal',
  2: 'c',
  3: 'cpp',
  4: 'cpp',
  5: 'plaintext',
  6: 'python',
  7: 'python',
  8: 'java',
  9: 'javascript',
  10: 'shellscript',
  11: 'cpp',
  12: 'cpp',
  13: 'ruby',
  14: 'go',
  15: 'rust',
  16: 'php',
  17: 'csharp',
  18: 'vb',
  19: 'haskell',
  20: 'kotlin',
  21: 'kotlin',
  22: 'scala',
  23: 'perl',
  24: 'python',
  25: 'python',
  26: 'wenyan',
  27: 'cpp',
  28: 'cpp',
  29: 'fsharp',
  30: 'ocaml',
  31: 'julia',
  32: 'lua',
  33: 'java'
};
