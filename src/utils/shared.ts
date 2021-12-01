'use strict';

export enum UserStatus {
  SignedIn = 1,
  SignedOut = 2
}

export enum Languages {
  'Auto' = 0,
  'Pascal' = 1,
  'C' = 2,
  'C++14 (GCC 9)' = 28,
  'C++98' = 3,
  'C++11' = 4,
  'C++14' = 11,
  'C++17' = 12,
  'C++20' = 27,
  'Python 2' = 6,
  'Python 3' = 7,
  'Java 8' = 8,
  'Node.js LTS' = 9,
  'Go' = 14,
  'Ruby' = 13,
  'Rust' = 15,
  'PHP' = 16,
  'C# Mono' = 17,
  // 'VisualBasic' = 18,
  'Haskell' = 19,
  // 'Kotlin/Native' = 20,
  'Kotlin/JVM' = 21,
  'Scala' = 22,
  'Perl' = 23,
  'PyPy2' = 24,
  'PyPy3' = 25 // ,
  // '文言' = 26
}

export enum ProblemState {
  'Waiting' = 0,
  'Judging' = 1,
  'Compile Error' = 2,
  'OLE' = 3,
  'MLE' = 4,
  'TLE' = 5,
  'WA' = 6,
  'RE' = 7,
  'Accepted' = 12,
  'Unaccepted' = 14,
  'Hack Success' = 21,
  'Hack Failure' = 22,
  'Hack Skipped' = 23
}

export const fileExtention = {
  'pas': 'pascal',
  'pp': 'pascal',
  'lpr': 'pascal',
  'dpr': 'pascal',
  'c': 'c',
  'cpp': 'cpp',
  'cxx': 'cpp',
  'cc': 'cpp',
  'c++': 'cpp',
  'C': 'cpp',
  'py': 'python',
  'java': 'java',
  'js': 'nodejs',
  'go': 'go',
  'ruby': 'ruby',
  'rust': 'rust',
  'php': 'php',
  'cs': 'c#',
  'vb': 'vb',
  'vbs': 'vb',
  'hs': 'haskell',
  'kt': 'kotlin',
  'scala': 'scala',
  'perl': 'perl',
  'wy': 'wy'
}

export const languageList = {
  'pascal': ['Pascal'],
  'c': ['C'],
  'cpp': ['C++14 (GCC 9)', 'C++98', 'C++11', 'C++14', 'C++17', 'C++20'],
  'python': ['Python 2', 'Python 3', 'PyPy2', 'PyPy3'],
  'java': ['Java 8'],
  'nodejs': 'Node.js LTS',
  'go': ['Go'],
  'ruby': ['Ruby'],
  'rust': ['Rust'],
  'php': ['PHP'],
  'c#': ['C# Mono'],
  'vb': ['VisualBasic'],
  'haskell': ['Haskell'],
  'kotlin': [/* 'Kotlin/Native',*/ 'Kotlin/JVM'],
  'scala': ['Scala'],
  'perl': ['Perl'] // ,
  // 'wy': ['文言']
}

export const stateColor: string[] = ['rgb(20, 85, 143)', 'rgb(52, 152, 219)', 'rgb(250, 219, 20)', '#001277', '#001277', '#001277', '#fb6340', '#8e44ad', '', '', '', 'rgb(14, 29, 105)', 'rgb(82, 196, 26)', '', 'rgb(231, 76, 60)'];
export enum resultState {
  'OLE' = 3,
  'MLE' = 4,
  'TLE' = 5,
  'WA' = 6,
  'RE' = 7,
  'UKE' = 11,
  'AC' = 12
}
export enum colorStyle {
  'grey' = 'font-weight: bold; color: rgb(191,191,191);',
  'Gray' = 'font-weight: bold; color: rgb(191,191,191);',
  'blue' = 'font-weight: bold; color: rgb(52, 152, 219);',
  'Blue' = 'font-weight: bold; color: rgb(52, 152, 219);',
  'green' = 'font-weight: bold; color: rgb(82, 196, 26);',
  'Green' = 'font-weight: bold; color: rgb(82, 196, 26);',
  'orange' = 'font-weight: bold; color: rgb(243, 156, 17);',
  'Orange' = 'font-weight: bold; color: rgb(243, 156, 17);',
  'red' = 'font-weight: bold; color: rgb(254, 76, 97);',
  'Red' = 'font-weight: bold; color: rgb(254, 76, 97);',
  'purple' = 'font-weight: bold; color: rgb(157, 61, 207);',
  'Purple' = 'font-weight: bold; color: rgb(157, 61, 207);',
  'cheater' = 'font-weight: bold; color: rgb(173, 139, 0);',
  'Cheater' = 'font-weight: bold; color: rgb(173, 139, 0);'
}
export const contestType: string[] = ['', 'OI', 'ACM', '乐多', 'IOI', 'CodeForces (暂不可用)']
export const contestStyle: string[] = ['',
  'color: rgb(255, 255, 255); background: rgb(243, 156, 17);',// OI
  'color: rgb(255, 255, 255); background: rgb(157, 61, 207);',// ACM
  'color: rgb(255, 255, 255); background: rgb(255, 193, 22);',// 乐多
  'color: rgb(255, 255, 255); background: rgb(255, 193, 22);',// IOI
  'color: rgb(255, 255, 255); background: rgb(255, 193, 22);'// CodeForces (暂不可用)
]
export enum contestRated {
  'false' = 'display: none',
  'true' = 'color: rgb(255, 255, 255); background: rgb(82, 196, 26);'
}
export const contestVisibility: string[] = ['',
  '官方比赛',
  '团队公开赛',
  '团队内部赛',
  '个人公开赛',
  '个人邀请赛',
  '团队邀请赛'
]
export const contestVisibilityStyle: string[] = ['',
  'color: rgb(255, 255, 255); background: rgb(231, 76, 60);',
  'color: rgb(255, 255, 255); background: rgb(34, 112, 10);',
  'color: rgb(255, 255, 255); background: rgb(52, 152, 219);',
  'color: rgb(255, 255, 255); background: rgb(52, 152, 219);',
  'color: rgb(255, 255, 255); background: rgb(41, 73, 180);',
  'color: rgb(255, 255, 255); background: rgb(41, 73, 180);'
]

export enum difficluty {
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
