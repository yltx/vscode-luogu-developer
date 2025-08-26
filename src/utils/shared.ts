'use strict';

import { mapColorsToValues } from './color';

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
    color: 'blue-3',
    userCreatable: false,
    scope: 'personal',
    invitation: false
  }
] as const);

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

// https://www.luogu.com.cn/_lfe/tags version 1735629686
export const tagsData = Object.fromEntries(
  [
    {
      id: -2,
      name: '语言入门（请选择[入门与面试]题库）',
      type: 2,
      parent: null
    },
    {
      id: 1,
      name: '模拟',
      type: 2,
      parent: 110
    },
    {
      id: 2,
      name: '字符串',
      type: 2,
      parent: null
    },
    {
      id: 3,
      name: '动态规划 DP',
      type: 2,
      parent: null
    },
    {
      id: 4,
      name: '搜索',
      type: 2,
      parent: null
    },
    {
      id: 5,
      name: '数学',
      type: 2,
      parent: null
    },
    {
      id: 6,
      name: '图论',
      type: 2,
      parent: null
    },
    {
      id: 7,
      name: '贪心',
      type: 2,
      parent: 110
    },
    {
      id: 8,
      name: '计算几何',
      type: 2,
      parent: null
    },
    {
      id: 9,
      name: '暴力数据结构',
      type: 2,
      parent: 308
    },
    {
      id: 10,
      name: '高精度',
      type: 2,
      parent: 308
    },
    {
      id: 11,
      name: '树形数据结构',
      type: 2,
      parent: null
    },
    {
      id: 12,
      name: '递推',
      type: 2,
      parent: 110
    },
    {
      id: 13,
      name: '博弈论',
      type: 2,
      parent: null
    },
    {
      id: 14,
      name: '1997',
      type: 4,
      parent: null
    },
    {
      id: 15,
      name: '1998',
      type: 4,
      parent: null
    },
    {
      id: 16,
      name: '1999',
      type: 4,
      parent: null
    },
    {
      id: 17,
      name: '2000',
      type: 4,
      parent: null
    },
    {
      id: 18,
      name: '2001',
      type: 4,
      parent: null
    },
    {
      id: 19,
      name: '2002',
      type: 4,
      parent: null
    },
    {
      id: 20,
      name: '2003',
      type: 4,
      parent: null
    },
    {
      id: 21,
      name: '2004',
      type: 4,
      parent: null
    },
    {
      id: 22,
      name: '2005',
      type: 4,
      parent: null
    },
    {
      id: 23,
      name: '2006',
      type: 4,
      parent: null
    },
    {
      id: 24,
      name: '2007',
      type: 4,
      parent: null
    },
    {
      id: 25,
      name: '2008',
      type: 4,
      parent: null
    },
    {
      id: 26,
      name: '2009',
      type: 4,
      parent: null
    },
    {
      id: 27,
      name: '2010',
      type: 4,
      parent: null
    },
    {
      id: 28,
      name: '2011',
      type: 4,
      parent: null
    },
    {
      id: 29,
      name: '2012',
      type: 4,
      parent: null
    },
    {
      id: 30,
      name: '2013',
      type: 4,
      parent: null
    },
    {
      id: 31,
      name: '2014',
      type: 4,
      parent: null
    },
    {
      id: 32,
      name: '2015',
      type: 4,
      parent: null
    },
    {
      id: 33,
      name: '2016',
      type: 4,
      parent: null
    },
    {
      id: 34,
      name: '2017',
      type: 4,
      parent: null
    },
    {
      id: 35,
      name: '2018',
      type: 4,
      parent: null
    },
    {
      id: 36,
      name: '2019',
      type: 4,
      parent: null
    },
    {
      id: 37,
      name: '2020',
      type: 4,
      parent: null
    },
    {
      id: 38,
      name: '重庆',
      type: 1,
      parent: null
    },
    {
      id: 39,
      name: '四川',
      type: 1,
      parent: null
    },
    {
      id: 40,
      name: '河南',
      type: 1,
      parent: null
    },
    {
      id: 41,
      name: '莫队',
      type: 2,
      parent: 308
    },
    {
      id: 42,
      name: '线段树',
      type: 2,
      parent: 11
    },
    {
      id: 43,
      name: '倍增',
      type: 2,
      parent: 110
    },
    {
      id: 44,
      name: '线性数据结构',
      type: 2,
      parent: null
    },
    {
      id: 45,
      name: '二分',
      type: 2,
      parent: 110
    },
    {
      id: 46,
      name: 'USACO',
      type: 3,
      parent: 428
    },
    {
      id: 47,
      name: '并查集',
      type: 2,
      parent: 11
    },
    {
      id: 48,
      name: '各省省选',
      type: 3,
      parent: 426
    },
    {
      id: 49,
      name: '点分治',
      type: 2,
      parent: 230
    },
    {
      id: 50,
      name: '平衡树',
      type: 2,
      parent: 11
    },
    {
      id: 51,
      name: '堆',
      type: 2,
      parent: 11
    },
    {
      id: 52,
      name: '集训队互测',
      type: 3,
      parent: 426
    },
    {
      id: 53,
      name: '树状数组',
      type: 2,
      parent: 11
    },
    {
      id: 54,
      name: '递归',
      type: 2,
      parent: 110
    },
    {
      id: 55,
      name: '树上启发式合并',
      type: 2,
      parent: 230
    },
    {
      id: 56,
      name: '单调队列',
      type: 2,
      parent: 44
    },
    {
      id: 57,
      name: 'POI（波兰）',
      type: 3,
      parent: 428
    },
    {
      id: 58,
      name: '2021',
      type: 4,
      parent: null
    },
    {
      id: 59,
      name: '2022',
      type: 4,
      parent: null
    },
    {
      id: 60,
      name: '2023',
      type: 4,
      parent: null
    },
    {
      id: 61,
      name: '2024',
      type: 4,
      parent: null
    },
    {
      id: 62,
      name: '2025',
      type: 4,
      parent: null
    },
    {
      id: 63,
      name: 'LGV 引理',
      type: 2,
      parent: 271
    },
    {
      id: 64,
      name: '矩阵树定理',
      type: 2,
      parent: 271
    },
    {
      id: 65,
      name: '颜色段均摊（珂朵莉树 ODT）',
      type: 2,
      parent: 44
    },
    {
      id: 66,
      name: '原根',
      type: 2,
      parent: 72
    },
    {
      id: 67,
      name: '三分',
      type: 2,
      parent: 308
    },
    {
      id: 68,
      name: 'Kruskal 重构树',
      type: 2,
      parent: 6
    },
    {
      id: 69,
      name: '多项式',
      type: 2,
      parent: null
    },
    {
      id: 70,
      name: '福建省历届夏令营',
      type: 3,
      parent: 427
    },
    {
      id: 71,
      name: '矩阵运算',
      type: 2,
      parent: 271
    },
    {
      id: 72,
      name: '数论',
      type: 2,
      parent: null
    },
    {
      id: 73,
      name: '算法',
      type: 6,
      parent: null
    },
    {
      id: 74,
      name: '数据结构',
      type: 6,
      parent: null
    },
    {
      id: 75,
      name: '来源',
      type: 6,
      parent: null
    },
    {
      id: 76,
      name: '时间',
      type: 6,
      parent: null
    },
    {
      id: 77,
      name: 'NOI',
      type: 3,
      parent: 426
    },
    {
      id: 78,
      name: '离散化',
      type: 2,
      parent: 308
    },
    {
      id: 79,
      name: '网络流',
      type: 2,
      parent: 6
    },
    {
      id: 80,
      name: '高级数据结构',
      type: 6,
      parent: null
    },
    {
      id: 81,
      name: '洛谷原创',
      type: 3,
      parent: 429
    },
    {
      id: 82,
      name: 'NOIP 普及组',
      type: 3,
      parent: 426
    },
    {
      id: 83,
      name: 'NOIP 提高组',
      type: 3,
      parent: 426
    },
    {
      id: 85,
      name: 'APIO',
      type: 3,
      parent: 426
    },
    {
      id: 87,
      name: '地区',
      type: 6,
      parent: null
    },
    {
      id: 88,
      name: '浙江',
      type: 1,
      parent: null
    },
    {
      id: 89,
      name: '上海',
      type: 1,
      parent: null
    },
    {
      id: 90,
      name: '福建',
      type: 1,
      parent: null
    },
    {
      id: 91,
      name: '江苏',
      type: 1,
      parent: null
    },
    {
      id: 92,
      name: '安徽',
      type: 1,
      parent: null
    },
    {
      id: 93,
      name: '湖南',
      type: 1,
      parent: null
    },
    {
      id: 94,
      name: '北京',
      type: 1,
      parent: null
    },
    {
      id: 95,
      name: '河北',
      type: 1,
      parent: null
    },
    {
      id: 96,
      name: '广东',
      type: 1,
      parent: null
    },
    {
      id: 97,
      name: '山东',
      type: 1,
      parent: null
    },
    {
      id: 98,
      name: '吉林',
      type: 1,
      parent: null
    },
    {
      id: 99,
      name: 'NOI 导刊',
      type: 3,
      parent: 427
    },
    {
      id: 100,
      name: 'cdq 分治',
      type: 2,
      parent: 11
    },
    {
      id: 101,
      name: '后缀自动机 SAM',
      type: 2,
      parent: 2
    },
    {
      id: 102,
      name: 'IOI',
      type: 3,
      parent: 428
    },
    {
      id: 103,
      name: '交互题',
      type: 5,
      parent: null
    },
    {
      id: 104,
      name: '提交答案',
      type: 5,
      parent: null
    },
    {
      id: 105,
      name: '特殊题目',
      type: 6,
      parent: null
    },
    {
      id: 107,
      name: 'Special Judge',
      type: 5,
      parent: null
    },
    {
      id: 108,
      name: 'O2优化',
      type: 5,
      parent: null
    },
    {
      id: 110,
      name: '﻿基础算法',
      type: 2,
      parent: null
    },
    {
      id: 111,
      name: '枚举',
      type: 2,
      parent: 110
    },
    {
      id: 112,
      name: '分治',
      type: 2,
      parent: 110
    },
    {
      id: 113,
      name: '排序',
      type: 2,
      parent: 110
    },
    {
      id: 114,
      name: '山西',
      type: 1,
      parent: null
    },
    {
      id: 115,
      name: 'CCO（加拿大）',
      type: 3,
      parent: 428
    },
    {
      id: 116,
      name: 'CCC（加拿大）',
      type: 3,
      parent: 428
    },
    {
      id: 117,
      name: 'CEOI（中欧）',
      type: 3,
      parent: 428
    },
    {
      id: 118,
      name: 'eJOI（欧洲）',
      type: 3,
      parent: 428
    },
    {
      id: 119,
      name: '快速排序',
      type: 6,
      parent: null
    },
    {
      id: 120,
      name: '堆排序',
      type: 6,
      parent: null
    },
    {
      id: 121,
      name: '希尔排序',
      type: 6,
      parent: null
    },
    {
      id: 122,
      name: '信息论',
      type: 2,
      parent: 5
    },
    {
      id: 123,
      name: '查找算法',
      type: 6,
      parent: null
    },
    {
      id: 124,
      name: '顺序查找',
      type: 6,
      parent: null
    },
    {
      id: 126,
      name: '广度优先搜索 BFS',
      type: 2,
      parent: 4
    },
    {
      id: 127,
      name: '深度优先搜索 DFS',
      type: 2,
      parent: 4
    },
    {
      id: 128,
      name: '剪枝',
      type: 2,
      parent: 4
    },
    {
      id: 129,
      name: '记忆化搜索',
      type: 2,
      parent: 4
    },
    {
      id: 130,
      name: '启发式搜索',
      type: 2,
      parent: 4
    },
    {
      id: 131,
      name: '迭代加深搜索',
      type: 2,
      parent: 4
    },
    {
      id: 132,
      name: '启发式迭代加深搜索 IDA*',
      type: 2,
      parent: 4
    },
    {
      id: 133,
      name: 'Dancing Links',
      type: 2,
      parent: 4
    },
    {
      id: 134,
      name: '爬山算法 Local search',
      type: 2,
      parent: 4
    },
    {
      id: 135,
      name: '模拟退火',
      type: 2,
      parent: 4
    },
    {
      id: 136,
      name: '随机调整',
      type: 2,
      parent: 4
    },
    {
      id: 137,
      name: '遗传算法',
      type: 2,
      parent: 4
    },
    {
      id: 139,
      name: '背包 DP',
      type: 2,
      parent: 3
    },
    {
      id: 140,
      name: '环形 dp',
      type: 6,
      parent: null
    },
    {
      id: 141,
      name: '数位 DP',
      type: 2,
      parent: 3
    },
    {
      id: 143,
      name: '多维状态',
      type: 6,
      parent: null
    },
    {
      id: 144,
      name: '区间 DP',
      type: 2,
      parent: 3
    },
    {
      id: 146,
      name: '动态规划优化',
      type: 2,
      parent: null
    },
    {
      id: 148,
      name: '优先队列',
      type: 2,
      parent: 146
    },
    {
      id: 149,
      name: '矩阵加速',
      type: 2,
      parent: 146
    },
    {
      id: 150,
      name: '斜率优化',
      type: 2,
      parent: 146
    },
    {
      id: 151,
      name: '状态压缩',
      type: 2,
      parent: 146
    },
    {
      id: 152,
      name: '树形 DP',
      type: 2,
      parent: 3
    },
    {
      id: 153,
      name: '凸完全单调性（wqs 二分）',
      type: 2,
      parent: 146
    },
    {
      id: 154,
      name: '四边形不等式',
      type: 2,
      parent: 146
    },
    {
      id: 155,
      name: '图论建模',
      type: 2,
      parent: 6
    },
    {
      id: 156,
      name: '邻接矩阵',
      type: 6,
      parent: null
    },
    {
      id: 157,
      name: '邻接表',
      type: 6,
      parent: null
    },
    {
      id: 158,
      name: '图遍历',
      type: 2,
      parent: 6
    },
    {
      id: 159,
      name: '拓扑排序',
      type: 2,
      parent: 6
    },
    {
      id: 160,
      name: '最短路',
      type: 2,
      parent: 6
    },
    {
      id: 161,
      name: '江西',
      type: 1,
      parent: null
    },
    {
      id: 162,
      name: '贵州',
      type: 1,
      parent: null
    },
    {
      id: 163,
      name: '广西',
      type: 1,
      parent: null
    },
    {
      id: 164,
      name: '陕西',
      type: 1,
      parent: null
    },
    {
      id: 166,
      name: '生成树',
      type: 2,
      parent: 6
    },
    {
      id: 167,
      name: '辽宁',
      type: 1,
      parent: null
    },
    {
      id: 168,
      name: '云南',
      type: 1,
      parent: null
    },
    {
      id: 169,
      name: '生成树的另类算法',
      type: 6,
      parent: null
    },
    {
      id: 170,
      name: '次小生成树',
      type: 6,
      parent: null
    },
    {
      id: 171,
      name: '特殊生成树',
      type: 6,
      parent: null
    },
    {
      id: 172,
      name: '平面图',
      type: 2,
      parent: 6
    },
    {
      id: 173,
      name: '最小环',
      type: 2,
      parent: 6
    },
    {
      id: 174,
      name: '负权环',
      type: 2,
      parent: 6
    },
    {
      id: 175,
      name: '连通块',
      type: 2,
      parent: 6
    },
    {
      id: 176,
      name: '2-SAT',
      type: 2,
      parent: 6
    },
    {
      id: 177,
      name: '平面图欧拉公式',
      type: 2,
      parent: 6
    },
    {
      id: 179,
      name: '强连通分量',
      type: 2,
      parent: 6
    },
    {
      id: 180,
      name: 'Tarjan',
      type: 2,
      parent: 6
    },
    {
      id: 181,
      name: '双连通分量',
      type: 2,
      parent: 6
    },
    {
      id: 182,
      name: '欧拉回路',
      type: 2,
      parent: 6
    },
    {
      id: 183,
      name: 'AOV',
      type: 6,
      parent: null
    },
    {
      id: 184,
      name: 'AOE',
      type: 6,
      parent: null
    },
    {
      id: 185,
      name: '差分约束',
      type: 2,
      parent: 6
    },
    {
      id: 186,
      name: '仙人掌',
      type: 2,
      parent: 6
    },
    {
      id: 187,
      name: '二分图',
      type: 2,
      parent: 6
    },
    {
      id: 188,
      name: '匈牙利算法',
      type: 6,
      parent: null
    },
    {
      id: 189,
      name: '一般图的最大匹配',
      type: 2,
      parent: 6
    },
    {
      id: 190,
      name: 'Konig定理',
      type: 6,
      parent: null
    },
    {
      id: 191,
      name: '带权二分图匹配',
      type: 6,
      parent: null
    },
    {
      id: 192,
      name: 'KM算法',
      type: 6,
      parent: null
    },
    {
      id: 193,
      name: '稳定婚姻系统',
      type: 6,
      parent: null
    },
    {
      id: 195,
      name: 'Dinic',
      type: 6,
      parent: null
    },
    {
      id: 196,
      name: 'Sap',
      type: 6,
      parent: null
    },
    {
      id: 197,
      name: '上下界网络流',
      type: 2,
      parent: 6
    },
    {
      id: 198,
      name: '最小割',
      type: 2,
      parent: 6
    },
    {
      id: 199,
      name: '闭合图',
      type: 6,
      parent: null
    },
    {
      id: 200,
      name: '最小点权覆盖集',
      type: 6,
      parent: null
    },
    {
      id: 201,
      name: '最大点权独立集',
      type: 6,
      parent: null
    },
    {
      id: 202,
      name: '分数规划',
      type: 2,
      parent: 467
    },
    {
      id: 203,
      name: '最大密度子图',
      type: 6,
      parent: null
    },
    {
      id: 204,
      name: '费用流',
      type: 2,
      parent: 6
    },
    {
      id: 205,
      name: '最短路增广费用流',
      type: 6,
      parent: null
    },
    {
      id: 207,
      name: '最小费用可行流',
      type: 6,
      parent: null
    },
    {
      id: 208,
      name: '树的遍历',
      type: 2,
      parent: 230
    },
    {
      id: 209,
      name: '树上距离',
      type: 6,
      parent: null
    },
    {
      id: 210,
      name: '节点到根的距离',
      type: 6,
      parent: null
    },
    {
      id: 211,
      name: '最近公共祖先 LCA',
      type: 2,
      parent: 230
    },
    {
      id: 212,
      name: '节点间的距离',
      type: 6,
      parent: null
    },
    {
      id: 213,
      name: '树的直径',
      type: 2,
      parent: 230
    },
    {
      id: 214,
      name: '霍夫曼树',
      type: 2,
      parent: 308
    },
    {
      id: 215,
      name: '可并堆',
      type: 2,
      parent: 11
    },
    {
      id: 216,
      name: '斜堆',
      type: 6,
      parent: null
    },
    {
      id: 217,
      name: '二项堆',
      type: 6,
      parent: null
    },
    {
      id: 218,
      name: 'AVL',
      type: 6,
      parent: null
    },
    {
      id: 219,
      name: 'Treap',
      type: 6,
      parent: null
    },
    {
      id: 220,
      name: 'SBT',
      type: 6,
      parent: null
    },
    {
      id: 221,
      name: 'Splay',
      type: 6,
      parent: null
    },
    {
      id: 222,
      name: '静态排序树',
      type: 6,
      parent: null
    },
    {
      id: 223,
      name: '替罪羊树',
      type: 6,
      parent: null
    },
    {
      id: 224,
      name: '二维线段树',
      type: 6,
      parent: null
    },
    {
      id: 225,
      name: '矩形树',
      type: 6,
      parent: null
    },
    {
      id: 227,
      name: '动态树',
      type: 6,
      parent: null
    },
    {
      id: 228,
      name: '树链剖分',
      type: 2,
      parent: 230
    },
    {
      id: 229,
      name: '动态树 LCT',
      type: 2,
      parent: 11
    },
    {
      id: 230,
      name: '树论',
      type: 2,
      parent: null
    },
    {
      id: 231,
      name: 'RMQ',
      type: 6,
      parent: null
    },
    {
      id: 232,
      name: '树套树',
      type: 2,
      parent: 11
    },
    {
      id: 233,
      name: '可持久化线段树',
      type: 2,
      parent: 11
    },
    {
      id: 234,
      name: '可持久化',
      type: 2,
      parent: 11
    },
    {
      id: 235,
      name: '哈希 hashing',
      type: 2,
      parent: 308
    },
    {
      id: 236,
      name: 'ELFhash',
      type: 6,
      parent: null
    },
    {
      id: 237,
      name: 'SDBM',
      type: 6,
      parent: null
    },
    {
      id: 238,
      name: 'BKDR',
      type: 6,
      parent: null
    },
    {
      id: 239,
      name: '素数判断,质数,筛法',
      type: 2,
      parent: 72
    },
    {
      id: 241,
      name: '最大公约数 gcd',
      type: 2,
      parent: 72
    },
    {
      id: 242,
      name: '扩展欧几里德算法',
      type: 2,
      parent: 72
    },
    {
      id: 243,
      name: '不定方程',
      type: 2,
      parent: 72
    },
    {
      id: 244,
      name: '进制',
      type: 2,
      parent: 72
    },
    {
      id: 246,
      name: '群论',
      type: 2,
      parent: null
    },
    {
      id: 247,
      name: '置换',
      type: 2,
      parent: 246
    },
    {
      id: 248,
      name: 'Pólya 定理',
      type: 2,
      parent: 246
    },
    {
      id: 249,
      name: '虚树',
      type: 2,
      parent: 230
    },
    {
      id: 250,
      name: '中国剩余定理 CRT',
      type: 2,
      parent: 72
    },
    {
      id: 251,
      name: '莫比乌斯反演',
      type: 2,
      parent: 72
    },
    {
      id: 252,
      name: '组合数学',
      type: 2,
      parent: null
    },
    {
      id: 253,
      name: '排列组合',
      type: 2,
      parent: 252
    },
    {
      id: 254,
      name: '前缀和',
      type: 2,
      parent: 44
    },
    {
      id: 255,
      name: '二项式定理',
      type: 2,
      parent: 252
    },
    {
      id: 256,
      name: '康托展开',
      type: 2,
      parent: 252
    },
    {
      id: 257,
      name: '袋与球问题',
      type: 6,
      parent: null
    },
    {
      id: 258,
      name: '鸽笼原理',
      type: 2,
      parent: 252
    },
    {
      id: 259,
      name: '容斥原理',
      type: 2,
      parent: 252
    },
    {
      id: 260,
      name: '斐波那契数列',
      type: 2,
      parent: 252
    },
    {
      id: 261,
      name: 'Catalan 数',
      type: 2,
      parent: 252
    },
    {
      id: 262,
      name: 'Stirling 数',
      type: 2,
      parent: 252
    },
    {
      id: 263,
      name: 'A*  算法',
      type: 2,
      parent: 4
    },
    {
      id: 264,
      name: '生成函数',
      type: 2,
      parent: 252
    },
    {
      id: 265,
      name: '线性规划',
      type: 2,
      parent: 467
    },
    {
      id: 266,
      name: '概率论',
      type: 2,
      parent: null
    },
    {
      id: 267,
      name: '简单概率',
      type: 6,
      parent: null
    },
    {
      id: 268,
      name: '条件概率',
      type: 2,
      parent: 266
    },
    {
      id: 269,
      name: 'Bayes',
      type: 6,
      parent: null
    },
    {
      id: 270,
      name: '期望',
      type: 2,
      parent: 266
    },
    {
      id: 271,
      name: '线性代数',
      type: 2,
      parent: null
    },
    {
      id: 272,
      name: '矩阵乘法',
      type: 2,
      parent: 271
    },
    {
      id: 273,
      name: '线性递推',
      type: 2,
      parent: 271
    },
    {
      id: 274,
      name: '高斯消元',
      type: 2,
      parent: 271
    },
    {
      id: 275,
      name: '异或方程组',
      type: 6,
      parent: null
    },
    {
      id: 276,
      name: '逆元',
      type: 2,
      parent: 72
    },
    {
      id: 277,
      name: '线性基',
      type: 2,
      parent: 271
    },
    {
      id: 278,
      name: '微积分',
      type: 2,
      parent: null
    },
    {
      id: 280,
      name: '导数',
      type: 2,
      parent: 278
    },
    {
      id: 281,
      name: '积分',
      type: 2,
      parent: 278
    },
    {
      id: 282,
      name: '定积分',
      type: 2,
      parent: 278
    },
    {
      id: 283,
      name: '三维计算几何',
      type: 2,
      parent: 8
    },
    {
      id: 284,
      name: '级数',
      type: 2,
      parent: 278
    },
    {
      id: 285,
      name: '基本数组',
      type: 6,
      parent: null
    },
    {
      id: 286,
      name: '向量',
      type: 2,
      parent: 8
    },
    {
      id: 287,
      name: '栈',
      type: 2,
      parent: 44
    },
    {
      id: 288,
      name: '队列',
      type: 2,
      parent: 44
    },
    {
      id: 289,
      name: '分块',
      type: 2,
      parent: 44
    },
    {
      id: 290,
      name: 'ST 表',
      type: 2,
      parent: 44
    },
    {
      id: 291,
      name: '凸包',
      type: 2,
      parent: 8
    },
    {
      id: 292,
      name: '叉积',
      type: 2,
      parent: 8
    },
    {
      id: 293,
      name: '线段相交',
      type: 2,
      parent: 8
    },
    {
      id: 295,
      name: '半平面交',
      type: 2,
      parent: 8
    },
    {
      id: 296,
      name: '最近点对',
      type: 6,
      parent: null
    },
    {
      id: 298,
      name: '扫描线',
      type: 2,
      parent: 8
    },
    {
      id: 299,
      name: '旋转卡壳',
      type: 2,
      parent: 8
    },
    {
      id: 300,
      name: '字典树 Trie',
      type: 2,
      parent: 2
    },
    {
      id: 301,
      name: 'AC 自动机',
      type: 2,
      parent: 2
    },
    {
      id: 302,
      name: 'KMP 算法',
      type: 2,
      parent: 2
    },
    {
      id: 303,
      name: '后缀数组 SA',
      type: 2,
      parent: 2
    },
    {
      id: 304,
      name: '后缀树',
      type: 2,
      parent: 2
    },
    {
      id: 305,
      name: '有限状态自动机',
      type: 2,
      parent: 2
    },
    {
      id: 307,
      name: '简单密码学',
      type: 6,
      parent: null
    },
    {
      id: 308,
      name: '其它技巧',
      type: 2,
      parent: null
    },
    {
      id: 309,
      name: '随机化',
      type: 2,
      parent: 308
    },
    {
      id: 311,
      name: '博弈树',
      type: 2,
      parent: 13
    },
    {
      id: 312,
      name: 'Shannon 开关游戏',
      type: 6,
      parent: null
    },
    {
      id: 313,
      name: '快速傅里叶变换 FFT',
      type: 2,
      parent: 69
    },
    {
      id: 314,
      name: '位运算',
      type: 2,
      parent: 308
    },
    {
      id: 316,
      name: '整体二分',
      type: 2,
      parent: 11
    },
    {
      id: 318,
      name: '构造',
      type: 2,
      parent: 308
    },
    {
      id: 320,
      name: '基环树',
      type: 2,
      parent: 230
    },
    {
      id: 321,
      name: 'K-D Tree',
      type: 2,
      parent: 11
    },
    {
      id: 322,
      name: 'Lucas 定理',
      type: 2,
      parent: 72
    },
    {
      id: 323,
      name: '插头 DP',
      type: 2,
      parent: 3
    },
    {
      id: 324,
      name: '快速数论变换 NTT',
      type: 2,
      parent: 69
    },
    {
      id: 325,
      name: '回文自动机 PAM',
      type: 2,
      parent: 2
    },
    {
      id: 326,
      name: '快速沃尔什变换 FWT',
      type: 2,
      parent: 69
    },
    {
      id: 327,
      name: '快速莫比乌斯变换 FMT',
      type: 2,
      parent: 69
    },
    {
      id: 328,
      name: '天津',
      type: 1,
      parent: null
    },
    {
      id: 329,
      name: 'Manacher 算法',
      type: 2,
      parent: 2
    },
    {
      id: 330,
      name: '差分',
      type: 2,
      parent: 44
    },
    {
      id: 331,
      name: '清华集训',
      type: 3,
      parent: 427
    },
    {
      id: 332,
      name: '网络流与线性规划 24 题',
      type: 3,
      parent: 427
    },
    {
      id: 333,
      name: 'COCI（克罗地亚）',
      type: 3,
      parent: 428
    },
    {
      id: 334,
      name: 'BalticOI（波罗的海）',
      type: 3,
      parent: 428
    },
    {
      id: 335,
      name: 'ICPC',
      type: 3,
      parent: 430
    },
    {
      id: 336,
      name: 'JOI（日本）',
      type: 3,
      parent: 428
    },
    {
      id: 337,
      name: '洛谷月赛',
      type: 3,
      parent: 429
    },
    {
      id: 338,
      name: '2026',
      type: 4,
      parent: null
    },
    {
      id: 339,
      name: '2027',
      type: 4,
      parent: null
    },
    {
      id: 340,
      name: '2028',
      type: 4,
      parent: null
    },
    {
      id: 341,
      name: '2077',
      type: 4,
      parent: null
    },
    {
      id: 342,
      name: 'CSP S 提高级',
      type: 3,
      parent: 426
    },
    {
      id: 343,
      name: 'CSP J 入门级',
      type: 3,
      parent: 426
    },
    {
      id: 344,
      name: '1996',
      type: 4,
      parent: null
    },
    {
      id: 345,
      name: '双指针 two-pointer',
      type: 2,
      parent: 308
    },
    {
      id: 346,
      name: 'AGM',
      type: 3,
      parent: 428
    },
    {
      id: 347,
      name: 'NOI Online',
      type: 3,
      parent: 426
    },
    {
      id: 348,
      name: 'Ynoi',
      type: 3,
      parent: 427
    },
    {
      id: 350,
      name: '圆方树',
      type: 2,
      parent: 6
    },
    {
      id: 351,
      name: '通信题',
      type: 5,
      parent: null
    },
    {
      id: 353,
      name: '顺序结构',
      type: 2,
      parent: -2
    },
    {
      id: 354,
      name: '分支结构',
      type: 2,
      parent: -2
    },
    {
      id: 355,
      name: '循环结构',
      type: 2,
      parent: -2
    },
    {
      id: 356,
      name: '数组',
      type: 2,
      parent: -2
    },
    {
      id: 357,
      name: '字符串（入门）',
      type: 2,
      parent: -2
    },
    {
      id: 358,
      name: '结构体',
      type: 2,
      parent: -2
    },
    {
      id: 359,
      name: '函数与递归',
      type: 2,
      parent: -2
    },
    {
      id: 360,
      name: '链表',
      type: 2,
      parent: 44
    },
    {
      id: 361,
      name: '蓝桥杯国赛',
      type: 3,
      parent: 430
    },
    {
      id: 362,
      name: '2078',
      type: 4,
      parent: null
    },
    {
      id: 363,
      name: '蓝桥杯省赛',
      type: 3,
      parent: 430
    },
    {
      id: 364,
      name: 'Dilworth 定理',
      type: 2,
      parent: 6
    },
    {
      id: 365,
      name: 'Ad-hoc',
      type: 2,
      parent: 308
    },
    {
      id: 367,
      name: '2029',
      type: 4,
      parent: null
    },
    {
      id: 368,
      name: '笛卡尔树',
      type: 2,
      parent: 308
    },
    {
      id: 369,
      name: '拟阵',
      type: 2,
      parent: 467
    },
    {
      id: 370,
      name: 'Nim 积',
      type: 2,
      parent: 13
    },
    {
      id: 371,
      name: '根号分治',
      type: 2,
      parent: 308
    },
    {
      id: 372,
      name: '拉格朗日反演',
      type: 2,
      parent: 252
    },
    {
      id: 373,
      name: '模拟费用流',
      type: 2,
      parent: 308
    },
    {
      id: 374,
      name: '分散层叠',
      type: 2,
      parent: 308
    },
    {
      id: 375,
      name: '均摊分析',
      type: 2,
      parent: 308
    },
    {
      id: 376,
      name: '分类讨论',
      type: 2,
      parent: 308
    },
    {
      id: 377,
      name: '李超线段树',
      type: 2,
      parent: 11
    },
    {
      id: 378,
      name: '吉司机线段树 segment tree beats',
      type: 2,
      parent: 11
    },
    {
      id: 379,
      name: '线段树合并',
      type: 2,
      parent: 11
    },
    {
      id: 380,
      name: '折半搜索 meet in the middle',
      type: 2,
      parent: 4
    },
    {
      id: 381,
      name: 'XCPC',
      type: 3,
      parent: 430
    },
    {
      id: 382,
      name: '动态树分治',
      type: 2,
      parent: 230
    },
    {
      id: 383,
      name: '传智杯',
      type: 3,
      parent: 430
    },
    {
      id: 385,
      name: '单调栈',
      type: 2,
      parent: 44
    },
    {
      id: 386,
      name: '语言月赛',
      type: 3,
      parent: 429
    },
    {
      id: 387,
      name: '杨表',
      type: 2,
      parent: 252
    },
    {
      id: 388,
      name: '类欧几里得算法',
      type: 2,
      parent: 72
    },
    {
      id: 389,
      name: 'PA（波兰）',
      type: 3,
      parent: 428
    },
    {
      id: 390,
      name: 'THUPC',
      type: 3,
      parent: 430
    },
    {
      id: 391,
      name: 'Berlekamp-Massey(BM) 算法',
      type: 2,
      parent: 69
    },
    {
      id: 393,
      name: 'ROI（俄罗斯）',
      type: 3,
      parent: 428
    },
    {
      id: 394,
      name: 'EGOI（欧洲/女生）',
      type: 3,
      parent: 428
    },
    {
      id: 396,
      name: '梯度下降法',
      type: 2,
      parent: 4
    },
    {
      id: 397,
      name: '湖北',
      type: 1,
      parent: null
    },
    {
      id: 398,
      name: '黑龙江',
      type: 1,
      parent: null
    },
    {
      id: 399,
      name: '海南',
      type: 1,
      parent: null
    },
    {
      id: 400,
      name: '甘肃',
      type: 1,
      parent: null
    },
    {
      id: 401,
      name: '青海',
      type: 1,
      parent: null
    },
    {
      id: 402,
      name: '台湾',
      type: 1,
      parent: null
    },
    {
      id: 403,
      name: '内蒙古',
      type: 1,
      parent: null
    },
    {
      id: 404,
      name: '西藏',
      type: 1,
      parent: null
    },
    {
      id: 405,
      name: '宁夏',
      type: 1,
      parent: null
    },
    {
      id: 406,
      name: '新疆',
      type: 1,
      parent: null
    },
    {
      id: 407,
      name: '香港',
      type: 1,
      parent: null
    },
    {
      id: 408,
      name: '澳门',
      type: 1,
      parent: null
    },
    {
      id: 409,
      name: 'GESP',
      type: 3,
      parent: 431
    },
    {
      id: 410,
      name: 'Prüfer 序列',
      type: 2,
      parent: 230
    },
    {
      id: 411,
      name: '调和级数',
      type: 2,
      parent: 72
    },
    {
      id: 412,
      name: '拉格朗日乘数法',
      type: 2,
      parent: 5
    },
    {
      id: 413,
      name: '近似算法',
      type: 2,
      parent: 308
    },
    {
      id: 414,
      name: '随机算法',
      type: 6,
      parent: null
    },
    {
      id: 415,
      name: '欧拉降幂',
      type: 2,
      parent: 72
    },
    {
      id: 416,
      name: '集合幂级数，子集卷积',
      type: 2,
      parent: 69
    },
    {
      id: 417,
      name: '拉格朗日插值法',
      type: 2,
      parent: 5
    },
    {
      id: 419,
      name: 'Lyndon 分解',
      type: 2,
      parent: 2
    },
    {
      id: 420,
      name: '济南',
      type: 1,
      parent: null
    },
    {
      id: 421,
      name: '南京',
      type: 1,
      parent: null
    },
    {
      id: 422,
      name: '青岛',
      type: 1,
      parent: null
    },
    {
      id: 423,
      name: 'Stern-Brocot 树',
      type: 2,
      parent: 72
    },
    {
      id: 424,
      name: '2079',
      type: 4,
      parent: null
    },
    {
      id: 426,
      name: 'NOI 系列赛事',
      type: 3,
      parent: null
    },
    {
      id: 427,
      name: '经典套题',
      type: 3,
      parent: null
    },
    {
      id: 428,
      name: '国际知名赛事',
      type: 3,
      parent: null
    },
    {
      id: 429,
      name: '洛谷比赛',
      type: 3,
      parent: null
    },
    {
      id: 430,
      name: '大学竞赛',
      type: 3,
      parent: null
    },
    {
      id: 431,
      name: '其他竞赛',
      type: 3,
      parent: null
    },
    {
      id: 432,
      name: 'THUSC',
      type: 3,
      parent: 431
    },
    {
      id: 434,
      name: '高校校赛',
      type: 3,
      parent: 430
    },
    {
      id: 435,
      name: 'DP 套 DP',
      type: 2,
      parent: 146
    },
    {
      id: 436,
      name: 'NOISG（新加坡）',
      type: 3,
      parent: 428
    },
    {
      id: 437,
      name: 'NordicOI（北欧）',
      type: 3,
      parent: 428
    },
    {
      id: 438,
      name: 'THUWC',
      type: 3,
      parent: 431
    },
    {
      id: 439,
      name: 'BalkanOI（巴尔干半岛）',
      type: 3,
      parent: 428
    },
    {
      id: 440,
      name: 'KOI（韩国）',
      type: 3,
      parent: 428
    },
    {
      id: 441,
      name: 'RMI（罗马尼亚）',
      type: 3,
      parent: 428
    },
    {
      id: 442,
      name: 'CSP-X',
      type: 3,
      parent: 431
    },
    {
      id: 443,
      name: '动态 DP',
      type: 2,
      parent: 146
    },
    {
      id: 444,
      name: '线性 DP',
      type: 2,
      parent: 3
    },
    {
      id: 445,
      name: 'SG 函数',
      type: 2,
      parent: 13
    },
    {
      id: 446,
      name: '线段树分治',
      type: 2,
      parent: 308
    },
    {
      id: 447,
      name: '离线处理',
      type: 2,
      parent: 308
    },
    {
      id: 448,
      name: '整除分块',
      type: 2,
      parent: 72
    },
    {
      id: 449,
      name: '极角排序',
      type: 2,
      parent: 8
    },
    {
      id: 450,
      name: '弦图',
      type: 2,
      parent: 6
    },
    {
      id: 451,
      name: 'Dirichlet 卷积',
      type: 2,
      parent: 72
    },
    {
      id: 452,
      name: '大步小步算法 BSGS',
      type: 2,
      parent: 72
    },
    {
      id: 453,
      name: '二次剩余',
      type: 2,
      parent: 72
    },
    {
      id: 454,
      name: '行列式',
      type: 2,
      parent: 271
    },
    {
      id: 455,
      name: 'Bézout 定理',
      type: 2,
      parent: 72
    },
    {
      id: 456,
      name: '概率生成函数',
      type: 2,
      parent: 266
    },
    {
      id: 457,
      name: '随机游走 Markov Chain',
      type: 2,
      parent: 266
    },
    {
      id: 458,
      name: '鞅的停时定理',
      type: 2,
      parent: 266
    },
    {
      id: 459,
      name: 'WC',
      type: 3,
      parent: 426
    },
    {
      id: 460,
      name: 'CTSC/CTS',
      type: 3,
      parent: 426
    },
    {
      id: 461,
      name: '杜教筛',
      type: 2,
      parent: 72
    },
    {
      id: 462,
      name: '欧拉函数',
      type: 2,
      parent: 72
    },
    {
      id: 463,
      name: '决策单调性',
      type: 2,
      parent: 146
    },
    {
      id: 464,
      name: '状压 DP',
      type: 2,
      parent: 3
    },
    {
      id: 465,
      name: 'bitset',
      type: 2,
      parent: 308
    },
    {
      id: 466,
      name: '特征值',
      type: 2,
      parent: 271
    },
    {
      id: 467,
      name: '组合优化',
      type: 2,
      parent: null
    },
    {
      id: 468,
      name: '整数规划',
      type: 2,
      parent: 467
    },
    {
      id: 469,
      name: '半正定规划',
      type: 2,
      parent: 467
    },
    {
      id: 470,
      name: '原始对偶',
      type: 2,
      parent: 467
    },
    {
      id: 471,
      name: '最大流最小割定理',
      type: 2,
      parent: 467
    },
    {
      id: 472,
      name: '全局平衡二叉树',
      type: 2,
      parent: 230
    },
    {
      id: 473,
      name: '哈希表',
      type: 2,
      parent: 44
    },
    {
      id: 474,
      name: 'Z 函数',
      type: 2,
      parent: 2
    },
    {
      id: 475,
      name: '筛法',
      type: 2,
      parent: 72
    },
    {
      id: 476,
      name: 'Floyd 算法',
      type: 2,
      parent: 6
    },
    {
      id: 477,
      name: '启发式合并',
      type: 2,
      parent: 308
    }
  ].map(x => [
    x.id,
    {
      ...x,
      color:
        {
          1: '#52c41a',
          2: '#2949b4',
          3: '#13c2c2',
          4: '#3498db',
          5: '#f39c11',
          6: '#072401'
        }[x.type] ?? '#000000'
    }
  ])
);

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
    'C++20 with O2': { id: 27, O2: true },
    'C++23': { id: 34 },
    'C++23 with O2': { id: 34, O2: true }
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
  33: 'Java 21',
  34: 'C++23'
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
  33: 'java',
  34: 'cpp'
};
