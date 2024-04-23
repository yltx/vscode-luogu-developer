import _ from 'axios';
import { UserStatus } from '@/utils/shared';
import { loadUserIconCache, saveUserIconCache } from '@/utils/files';
import * as vscode from 'vscode';
import {
  Activity,
  ActivityData,
  ContestData,
  DataResponse,
  GetScoreboardResponse,
  List,
  LoginRequest,
  LoginResponse,
  ProblemData,
  ProblemSetData,
  RecordData,
  SolutionsData,
  UserSummary
} from 'luogu-api';
import AgentKeepAlive from 'agentkeepalive';
import { cookieString, praseCookie } from './workspaceUtils';
import { Login } from '@/commands/login';

export const CSRF_TOKEN_REGEX = /<meta name="csrf-token" content="(.*)">/;

export namespace API {
  export const baseURL = 'https://www.luogu.com.cn';
  export const apiURL = '/api';
  export const cookieDomain = 'luogu.com.cn';
  export const SEARCH_PROBLEM = (pid: string) =>
    `/problem/${pid}?_contentOnly=1`;
  export const SEARCH_CONTESTPROBLEM = (pid: string, cid: string) =>
    `/problem/${pid}?contestId=${cid}&_contentOnly=1`;
  export const SEARCH_SOLUTION = (pid: string, page: number) =>
    `/problem/solution/${pid}?page=${page}&_contentOnly=1`;
  export const CAPTCHA_IMAGE = `${apiURL}/verify/captcha`;
  export const CONTEST = (cid: string) => `/contest/${cid}?_contentOnly=1`;
  export const LOGIN_ENDPOINT = `${apiURL}/auth/userPassLogin`;
  export const SEND_MAIL_2fa = `${apiURL}/verify/sendTwoFactorCode`;
  export const LOGIN_REFERER = `${baseURL}/auth/login`;
  export const UNLOCK_REFERER = `${baseURL}/auth/unlock`;
  export const LOGOUT = `${apiURL}/auth/logout`;
  export const FATE = `/index/ajax_punch`;
  export const FOLLOWED_BENBEN = (page: number) =>
    `${apiURL}/feed/watching?page=${page}`;
  export const USER_BENBEN = (page: number, user?: number) =>
    `${apiURL}/feed/list?page=${page}&user=${user !== undefined ? user : ''}`;
  export const BenbenReferer = 'https://www.luogu.com.cn/';
  export const BENBEN_POST = `${apiURL}/feed/postBenben`;
  export const BENBEN_DELETE = (id: number) => `${apiURL}/feed/delete/${id}`;
  export const UNLOCK_ENDPOINT = `${apiURL}/auth/unlock`;
  export const ranklist = (cid: string, page: number) =>
    `/fe/api/contest/scoreboard/${cid}?page=${page}`;
  export const TRAINLISTDETAIL = (id: number) =>
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
  // 使用 http keepalive，批量获取用户头像时效率显著提升。
  const keepAliveAgent = new AgentKeepAlive({
    timeout: 3000
  });
  const axios = _.create({
    baseURL: API.baseURL,
    withCredentials: true,
    headers: { 'X-Requested-With': 'XMLHttpRequest', Connection: 'keep-alive' },
    proxy: false,
    httpAgent: keepAliveAgent,
    httpsAgent: keepAliveAgent
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

  axios.interceptors.request.use(async config => {
    if (config.headers.Cookie === undefined)
      config.headers.Cookie = cookieString(await authProvider.cookie());
    return config;
  });

  return axios;
})();

export default axios;

export const genClientID = async function () {
  const cookies = (await axios.get(API.baseURL, { headers: { Cookie: '' } }))
    .headers['set-cookie'];
  if (!cookies) throw new Error('Cookie not found in header');
  const s = praseCookie(cookies).clientID;
  if (!s) throw new Error('Cookie not found in header');
  return s;
};

export const csrfToken = async (cookie?: Cookie, path: string = API.baseURL) =>
  axios
    .get(path, {
      headers: { Cookie: cookieString(cookie || (await authProvider.cookie())) }
    })
    .then(res => {
      const result = CSRF_TOKEN_REGEX.exec(res.data);
      return result ? result[1].trim() : null;
    })
    .catch(() => null);

export const searchProblem = async (pid: string) =>
  axios
    .get<DataResponse<ProblemData>>(API.SEARCH_PROBLEM(pid))
    .then(res => res.data)
    .then(res => {
      if (res.code !== 200) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw Error((res.currentData as any).errorMessage || '');
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
    .get<DataResponse<ProblemData>>(API.SEARCH_CONTESTPROBLEM(pid, cid))
    .then(res => res.data)
    .then(res => {
      if (res.code !== 200) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw Error((res.currentData as any).errorMessage || undefined);
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
    .get<DataResponse<ContestData>>(API.CONTEST(cid))
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
    .get<DataResponse<SolutionsData>>(API.SEARCH_SOLUTION(pid, 1))
    .then(res => res.data)
    .then(async resp => {
      if ((resp.currentData.solutions || null) === null) {
        throw Error('题目不存在');
      }
      const problem = resp.currentData.problem;
      const res = resp.currentData.solutions;
      if (res.perPage === null) res.perPage = Infinity;
      const result = Object.values(res.result);
      const pages = Math.ceil(res.count / res.perPage);
      for (let i = 2; i <= pages; i++) {
        const currentPage = (await axios.get(API.SEARCH_SOLUTION(pid, i)))
          .data as DataResponse<SolutionsData>;
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
    .get(API.SEARCHTRAINLIST(type, keyword, page))
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

export const searchTrainingdetail = async (id: number) =>
  axios
    .get<DataResponse<ProblemSetData>>(API.TRAINLISTDETAIL(id))
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

export const login = async (
  username: string,
  password: string,
  captcha: string,
  cookie?: Cookie
) => {
  return await axios
    .post<LoginResponse>(
      API.LOGIN_ENDPOINT,
      {
        username,
        password,
        captcha
      } as LoginRequest,
      {
        headers: {
          Referer: API.LOGIN_REFERER,
          'X-CSRF-Token': await csrfToken(cookie, API.LOGIN_REFERER),
          Cookie: cookieString(cookie || (await authProvider.cookie()))
        }
      }
    )
    .then(x => ({
      ...x.data,
      uid: praseCookie(x.headers['set-cookie']).uid
    }));
};

export const unlock = async (code: string, cookie?: Cookie) => {
  const csrf = await csrfToken(cookie);

  return await axios.post(
    API.UNLOCK_ENDPOINT,
    {
      code
    },
    {
      headers: {
        Referer: API.UNLOCK_REFERER,
        'X-CSRF-Token': csrf,
        Cookie: cookieString(cookie || (await authProvider.cookie()))
      }
    }
  );
};

export const getStatus = async () => {
  const session = await authProvider.getSessions();
  if (session.length === 0) return UserStatus.SignedOut.toString();
  const ret = (await fetch3kHomepage()).currentUser;
  if (ret) {
    globalThis.islogged = true;
    return UserStatus.SignedIn.toString();
  } else {
    globalThis.islogged = false;
    authProvider.removeSession(session[0].id);
    vscode.window
      .showErrorMessage('登录信息已经失效，请重新登录。', '登录')
      .then(async c => {
        if (c) Login();
      });
    return UserStatus.SignedOut.toString();
  }
};

export const sendMail2fa = async (captcha: string, cookie?: Cookie) =>
  axios.post(
    API.SEND_MAIL_2fa,
    { captcha, endpointType: 1 },
    {
      headers: {
        Referer: API.UNLOCK_REFERER,
        'X-CSRF-Token': await csrfToken(cookie),
        Cookie: cookieString(cookie || (await authProvider.cookie()))
      }
    }
  );

export const fetchResult = async (rid: number) =>
  axios
    .get<DataResponse<RecordData>>(`/record/${rid}?_contentOnly=1`)
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

export const fetch3kHomepage = async () =>
  axios
    .get(`/user/1?_contentOnly=1`)
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
        Origin: API.baseURL
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
    .get(API.FATE)
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
    .get(`/record/list?_contentOnly=1`)
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

export const searchUser = async (keyword: string, cookie?: Cookie) =>
  axios
    .get<{ users: [UserSummary | null] }>(
      `/api/user/search?keyword=${keyword}`,
      {
        headers: {
          Cookie: cookieString(cookie || (await authProvider.cookie()))
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

export const fetchFollowedBenben = async (page: number) =>
  axios
    .get<{ status: number; data: ActivityData[] }>(API.FOLLOWED_BENBEN(page), {
      headers: {
        'X-CSRF-Token': await csrfToken(),
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
      }
    })
    .then(data => data.data);

export const fetchUserBenben = async (page: number, user?: number) =>
  axios
    .get<{ feeds: List<Activity> }>(API.USER_BENBEN(page, user), {
      headers: {
        'X-CSRF-Token': await csrfToken(),
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
      }
    })
    .then(data => data.data);

// 只需要请求用户犇犇时不带 cookie 就可以获得到全网犇犇了（？）
export const fetchAllBenben = async (page: number) =>
  axios
    .get<{
      feeds: List<Activity>;
    }>(API.USER_BENBEN(page), { headers: { Cookie: '' } })
    .then(data => data.data);

export const postBenben = async (benbenText: string) =>
  axios
    .post<{ status: number; data: ActivityData }>(
      API.BENBEN_POST,
      {
        content: benbenText
      },
      {
        headers: {
          'X-CSRF-Token': await csrfToken(),
          Referer: API.BenbenReferer
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

export const deleteBenben = async (id: number) =>
  axios
    .post<{ status: number; data: [] }>(
      API.BENBEN_DELETE(id),
      {},
      {
        headers: {
          'X-CSRF-Token': await csrfToken(),
          Referer: API.BenbenReferer
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
      responseType: 'arraybuffer'
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
          Referer: API.SOLUTION_REFERER(pid)
        }
      }
    )
    .then(data => data.data as { status: number; data: number | string })
    .catch(err => {
      throw err;
    });

export const parseProblemID = async (name: string) => {
  const regexs = [
    /(AT_\w*)/i,
    /(CF[0-9]{1,4}[A-Z][0-9]{0,1})/i,
    /(SP[0-9]{1,5})/i,
    /(P[0-9]{4,5})/i,
    /(UVA[0-9]{1,5})/i,
    /(U[0-9]{1,6})/i,
    /(T[0-9]{1,6})/i,
    /(B[0-9]{4})/i
  ];
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

const delay = (t: number) => new Promise(resolve => setTimeout(resolve, t));
export const loadUserIcon = async (uid: number) => {
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
      throw new Error('获取用户头像失败');
    }
    saveUserIconCache(uid, image);
    console.log(`Get usericon; uid: ${uid}`);
    return image;
  }
};

export const getRanklist = async (cid: string, page: number) => {
  return axios
    .get<GetScoreboardResponse>(API.ranklist(cid, page))
    .then(res => res.data)
    .catch(err => {
      throw err;
    });
};

export const getErrorMessage = (err: unknown) => {
  if (err instanceof Error) return err.message;
  return String(err);
};

export async function submitCode(
  id: string,
  code: string,
  language: number = 0,
  enableO2: boolean = false
) {
  const url = `/fe/api/problem/submit/${id}`;
  return axios
    .post<{ rid: number }>(
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
          Referer: `${API.baseURL}/problem/${id}`
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
export async function checkCookie(c: Cookie) {
  const res = await axios.get('/', {
    headers: { Cookie: cookieString(c) }
  });
  const cookie = res.headers['set-cookie'];
  let flag = false;
  if (cookie)
    for (const cookie_info of cookie) {
      if (cookie_info.match('_uid')?.index == 0) {
        const match_res = cookie_info.match('(?<==).*?(?=;)');
        if (match_res && match_res[0] === c.uid.toString()) flag = true;
      }
    }
  return flag;
}
export const getCaptcha = async (c?: Cookie) =>
  axios
    .get(API.CAPTCHA_IMAGE, {
      responseType: 'arraybuffer',
      headers: {
        Cookie: cookieString(c || (await authProvider.cookie()))
      }
    })
    .then(x => Buffer.from(x.data, 'binary'));
