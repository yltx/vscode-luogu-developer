import _ from 'axios';
import { UserStatus } from '@/utils/shared';
import luoguStatusBar from '@/views/luoguStatusBar';
import {
  cookieConfig,
  changeCookieByCookies,
  loadUserIconCache,
  saveUserIconCache
} from '@/utils/files';
import * as vscode from 'vscode';
import {
  ArticleDetails,
  DataResponse,
  List,
  ProblemSummary,
  SolutionsData
} from '@/model/luogu-api';
import { assert } from 'console';
import Problem from '@/model/Problem';
import exp from 'constants';

export const CSRF_TOKEN_REGEX = /<meta name="csrf-token" content="(.*)">/;

export namespace API {
  export const baseURL = 'https://www.luogu.com.cn';
  export const apiURL = '/api';
  export const cookieDomain = 'luogu.com.cn';
  // export const SEARCH_PROBLEM = (pid: string) => `${apiURL}/problem/detail/${pid}`
  export const SEARCH_PROBLEM = (pid: string) =>
    `/problem/${pid}?_contentOnly=1`;
  export const SEARCH_CONTESTPROBLEM = (pid: string, cid: string) =>
    `/problem/${pid}?contestId=${cid}&_contentOnly=1`;
  export const SEARCH_SOLUTION = (pid: string, page: number) =>
    `/problem/solution/${pid}?page=${page}&_contentOnly=1`;
  export const CAPTCHA_IMAGE = `${apiURL}/verify/captcha`;
  export const CONTEST = (cid: string) => `/contest/${cid}?_contentOnly=1`;
  export const LOGIN_ENDPOINT = `${apiURL}/auth/userPassLogin`;
  export const SYNCLOGIN_ENDPOINT = `${apiURL}/auth/syncLogin`;
  export const LOGIN_REFERER = `${baseURL}/auth/login`;
  export const UNLOCK_REFERER = `${baseURL}/auth/unlock`;
  export const LOGOUT = `${apiURL}/auth/logout`;
  export const FATE = `/index/ajax_punch`;
  export const BENBEN = (mode: string, page: number) =>
    `${apiURL}/feed/${mode}?page=${page}`;
  export const BenbenReferer = 'https://www.luogu.com.cn/';
  export const BENBEN_POST = `${apiURL}/feed/postBenben`;
  export const BENBEN_DELETE = (id: string) => `${apiURL}/feed/delete/${id}`;
  export const UNLOCK_ENDPOINT = `${apiURL}/auth/unlock`;
  export const ranklist = (cid: string, page: number) =>
    `/fe/api/contest/scoreboard/${cid}?page=${page}`;
  export const TRAINLISTDETAIL = (id: any) =>
    `${baseURL}/training/${id}?_contentOnly=1`;
  export const SEARCHTRAINLIST = (
    channel: string,
    keyword: string,
    page: number
  ) =>
    `${baseURL}/training/list?type=${channel}&page=${page}&keyword=${encodeURI(
      keyword
    )}&_contentOnly=1`;
  export const SOLUTION_REFERER = (pid: string) =>
    `${baseURL}/problem/solution/${pid}`;
}

export const axios = (() => {
  const axios = _.create({
    baseURL: API.baseURL,
    withCredentials: true,
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
    proxy: false
  });

  const defaults = axios.defaults;
  if (!defaults.transformRequest) {
    defaults.transformRequest = [];
  } else if (!(defaults.transformRequest instanceof Array)) {
    defaults.transformRequest = [defaults.transformRequest];
  }
  defaults.transformRequest.push((data, headers) => {
    headers['User-Agent'] =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36';
    return data;
  });
  defaults.timeout = 6000;

  return axios;
})();

export default axios;

export const genCookies = async function () {
  let res = await axios.get(API.baseURL);
  changeCookieByCookies(res.headers['set-cookie']);
};

export const csrfToken = async () =>
  axios
    .get(API.baseURL, cookieConfig())
    .then(res => {
      const result = CSRF_TOKEN_REGEX.exec(res.data);
      console.log(result ? result[1].trim() : null);
      return result ? result[1].trim() : null;
    })
    .catch(() => '');

export const captcha = async () =>
  axios
    .get(API.CAPTCHA_IMAGE, {
      params: {
        _t: new Date().getTime()
      },
      responseType: 'arraybuffer',
      ...cookieConfig()
    })
    .then(resp => (resp.data ? Buffer.from(resp.data, 'binary') : null))
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw Error('请求超时，请重试');
      } else {
        throw err;
      }
    });
export const searchProblem = async (pid: string) =>
  axios
    .get(API.SEARCH_PROBLEM(pid), cookieConfig())
    .then(res => res.data)
    .then(res => {
      if (res.code !== 200) {
        throw Error(res.currentData.errorMessage);
      }
      return res.currentData.problem;
    })
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

export const searchContestProblem = async (pid: string, cid: string) =>
  axios
    .get(API.SEARCH_CONTESTPROBLEM(pid, cid), cookieConfig())
    .then(res => res.data)
    .then(res => {
      if (res.code !== 200) {
        throw Error(res.currentData.errorMessage);
      }
      return res.currentData.problem;
    })
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

export const searchContest = async (cid: string) =>
  axios
    .get(API.CONTEST(cid), cookieConfig())
    .then(res => res?.data?.currentData)
    .then(async res => {
      // console.log(res)
      if ((res || null) === null) {
        throw Error('比赛不存在');
      }
      return res;
    })
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

export const searchSolution = async (pid: string) =>
  axios
    .get(API.SEARCH_SOLUTION(pid, 1), cookieConfig())
    .then(res => res.data)
    .then(async resp => {
      if ((resp.currentData.solutions || null) === null) {
        throw Error('题目不存在');
      }
      let problem = resp.currentData.problem as ProblemSummary;
      let res = resp.currentData.solutions as List<ArticleDetails>;
      if (res.perPage === null) res.perPage = Infinity;
      let result = Object.values(res.result);
      let pages = Math.ceil(res.count / res.perPage);
      for (let i = 2; i <= pages; i++) {
        const currentPage = (
          await axios.get(API.SEARCH_SOLUTION(pid, i), cookieConfig())
        ).data as DataResponse<SolutionsData>;
        if (currentPage.code == 200)
          result.push(
            ...Object.values(currentPage.currentData.solutions.result)
          );
        else throw Error('未找到题解');
      }
      return {
        solutions: result,
        problem: problem
      };
    })
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

export const searchTraininglist = async (
  type: string,
  keyword: string,
  page: number
) =>
  axios
    .get(API.SEARCHTRAINLIST(type, keyword, page), cookieConfig())
    .then(res => res?.data?.currentData)
    .then(async res => {
      // console.log(res)
      if ((res || null) === null) {
        throw Error('题单不存在');
      }
      return res;
    })
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

export const searchTrainingdetail = async (id: any) =>
  axios
    .get(API.TRAINLISTDETAIL(id), cookieConfig())
    .then(res => res?.data?.currentData)
    .then(async res => {
      // console.log(res)
      if ((res || null) === null) {
        throw Error('题单不存在');
      }
      return res;
    })
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

/**
 * @api 登录
 * @async
 * @param {string} username 用户名
 * @param {string} password 密码
 * @param {string} captcha 验证码
 */
export const login = async (
  username: string,
  password: string,
  captcha: string
) => {
  const csrf = await csrfToken();

  return await axios.post(
    API.LOGIN_ENDPOINT,
    {
      username,
      password,
      captcha
    },
    {
      headers: {
        Referer: API.LOGIN_REFERER,
        'X-CSRF-Token': csrf,
        ...cookieConfig().headers
      }
    }
  );
};

export const unlock = async (code: string) => {
  const csrf = await csrfToken();

  return await axios.post(
    API.UNLOCK_ENDPOINT,
    {
      code
    },
    {
      headers: {
        Referer: API.UNLOCK_REFERER,
        'X-CSRF-Token': csrf,
        ...cookieConfig().headers
      }
    }
  );
};

export const getStatus = async () => {
  const ret = (await fetchHomepage()).currentUser;
  if (ret) {
    globalThis.islogged = true;
    luoguStatusBar.updateStatusBar(UserStatus.SignedIn);
    return UserStatus.SignedIn.toString();
  } else {
    globalThis.islogged = false;
    luoguStatusBar.updateStatusBar(UserStatus.SignedOut);
    return UserStatus.SignedOut.toString();
  }
};

export const fetchResult = async (rid: number) =>
  axios
    .get(`/record/${rid}?_contentOnly=1`, cookieConfig())
    .then(data => data?.data.currentData)
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

export const fetchHomepage = async () =>
  axios
    .get(`/user/1?_contentOnly=1`, cookieConfig())
    .then(data => data?.data)
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw Error('请求超时，请重试');
      } else {
        throw err;
      }
    });
export const logout = async () =>
  axios
    .post(API.LOGOUT, '', {
      headers: {
        'X-CSRF-Token': await csrfToken(),
        Referer: API.baseURL,
        Origin: API.baseURL,
        ...cookieConfig().headers
      }
    })
    .then(data => data?.data)
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

export const getFate = async () =>
  axios
    .get(API.FATE, cookieConfig())
    .then(data => data?.data)
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

export const fetchRecords = async () =>
  axios
    .get(`/record/list?_contentOnly=1`, cookieConfig())
    .then(data => data?.data)
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

export const searchUser = async (keyword: string) =>
  axios
    .get(`/api/user/search?keyword=${keyword}`, cookieConfig())
    .then(data => data?.data)
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

export const fetchBenben = async (mode: string, page: number) =>
  axios
    .get(API.BENBEN(mode, page), {
      headers: {
        'X-CSRF-Token': await csrfToken(),
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
        ...cookieConfig().headers
      }
    })
    .then(data => data?.data)
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

export const postBenben = async (benbenText: string) =>
  axios
    .post(
      API.BENBEN_POST,
      {
        content: benbenText
      },
      {
        headers: {
          'X-CSRF-Token': await csrfToken(),
          Referer: API.BenbenReferer,
          ...cookieConfig().headers
        }
      }
    )
    .then(data => data?.data)
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

export const deleteBenben = async (id: string) =>
  axios
    .post(
      API.BENBEN_DELETE(id),
      {},
      {
        headers: {
          'X-CSRF-Token': await csrfToken(),
          Referer: API.BenbenReferer,
          ...cookieConfig().headers
        }
      }
    )
    .then(data => data?.data)
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

export const userIcon = async (uid: number) =>
  axios
    .get(`https://cdn.luogu.com.cn/upload/usericon/${uid}.png`, {
      responseType: 'arraybuffer',
      ...cookieConfig()
    })
    .then(resp => (resp.data ? Buffer.from(resp.data, 'binary') : null))
    .catch(function (err) {
      console.error(err);
      return null;
    });

export const postVote = async (id: number, type: number, pid: string) =>
  axios
    .post(
      `/api/blog/vote/${id}`,
      { Type: type },
      {
        headers: {
          'X-CSRF-Token': await csrfToken(),
          Referer: API.SOLUTION_REFERER(pid),
          ...cookieConfig().headers
        }
      }
    )
    .then(data => data.data as { status: number; data: number | string })
    .catch(err => {
      throw err;
    });

export const parseProblemID = async (name: string) => {
  const regexs = new Array(
    /(AT_\w*)/i,
    /(CF[0-9]{1,4}[A-Z][0-9]{0,1})/i,
    /(SP[0-9]{1,5})/i,
    /(P[0-9]{5})/i,
    /(UVA[0-9]{1,5})/i,
    /(U[0-9]{1,6})/i,
    /(T[0-9]{1,6})/i,
    /(B[0-9]{4})/i
  );
  for (const regex of regexs) {
    const m = regex.exec(name);
    if (m !== null) {
      let ret = '';
      m.forEach(match => {
        ret = match;
      });
      if (ret !== '') {
        return ret;
      }
    }
  }
  return '';
};

export const parseUID = async (name: string) => {
  const regex = /([0-9]{1,7})/i;
  const m = regex.exec(name);
  if (m !== null) {
    let ret = '';
    m.forEach(match => {
      ret = match;
    });
    if (ret !== '') {
      return ret;
    }
  }
  return '';
};

export const prettyTime = (time: number) => {
  let mistiming = Math.round(new Date().getTime() / 1000) - time;
  const postfix = mistiming > 0 ? '前' : '后';
  mistiming = Math.abs(mistiming);
  const arrr = ['年', '个月', '星期', '天', '小时', '分钟', '秒'];
  const arrn = [31536000, 2592000, 604800, 86400, 3600, 60, 1];

  for (let i = 0; i < 7; i++) {
    const inm = Math.floor(mistiming / arrn[i]);
    if (inm !== 0) {
      return inm + arrr[i] + postfix;
    }
  }
  return undefined;
};

const delay = (t: number) => new Promise(resolve => setTimeout(resolve, t));
export const loadUserIcon = async (uid: number) => {
  // tslint:disable-next-line: radix
  let image = loadUserIconCache(uid);
  if (image) return image;
  else {
    image = await userIcon(uid);
    let cnt = 0;
    while (!image && cnt <= 3) {
      await delay(200);
      image = await userIcon(uid);
      cnt++;
    }
    if (image === null) {
      vscode.window.showErrorMessage('获取用户头像失败');
      return;
    }
    saveUserIconCache(uid, image);
    console.log(`Get usericon; uid: ${uid}`);
    return image;
  }
};

export const getRanklist = async (cid: string, page: number) => {
  return axios
    .get(API.ranklist(cid, page), cookieConfig())
    .then(res => res.data)
    .catch(err => {
      throw err;
    });
};

export const getErrorMessage = (err: unknown) => {
  if (err instanceof Error) return err.message;
  return String(err);
};

/**
 * @api 提交代码
 * @async
 * @param {string} id 提交id
 * @param {string} code 代码
 * @param {number} language 选择语言
 * @param {boolean} enableO2 是否启用O2优化
 *
 * @returns {number} 测评id
 */
export async function submitCode(
  id: string,
  code: string,
  language: number = 0,
  enableO2: boolean = false
): Promise<any> {
  const url = `/fe/api/problem/submit/${id}`;
  return axios
    .post(
      url,
      {
        code: code,
        lang: language,
        enableO2: enableO2,
        verify: ''
      },
      {
        headers: {
          'X-CSRF-Token': await csrfToken(),
          Referer: `${API.baseURL}/problem/${id}`,
          ...cookieConfig().headers
        }
      }
    )
    .then(res => {
      if (res.status === 200) {
        return res.data.rid;
      } else if (res.status === 401) {
        vscode.window.showErrorMessage('您没有登录');
        throw Error('您没有登录');
      } else {
        throw res.data;
      }
    })
    .catch(err => {
      if (err.response) {
        throw err.response.data.data ?? err.response.data;
      } else if (err.request) {
        throw new Error('请求超时，请重试');
      } else {
        throw err;
      }
    })
    .catch(err => {
      console.error(err);
      throw err;
    });
}
