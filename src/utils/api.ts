import _, { isAxiosError } from 'axios';
import { UserStatus } from '@/utils/shared';
import { loadUserIconCache, saveUserIconCache } from '@/utils/files';
import * as vscode from 'vscode';
import {
  Activity,
  ActivityData,
  ArticleData,
  ArticleDetails,
  ArticleListData,
  ContestData,
  DataResponse,
  EditArticleRequest,
  GetScoreboardResponse,
  LentilleDataResponse,
  List,
  LoginRequest,
  LoginResponse,
  ProblemData,
  ProblemSetData,
  RecordData,
  SolutionsData,
  UserSummary
} from 'luogu-api';
import { cookieString, praseCookie } from './workspaceUtils';
import { needLogin } from './uiUtils';

export const CSRF_TOKEN_REGEX = /<meta name="csrf-token" content="(.*)">/;

export namespace API {
  export const baseURL = 'https://www.luogu.com.cn/';
  export const apiURL = '/api';
  export const cookieDomain = 'luogu.com.cn';
  export const SEARCH_PROBLEM = (pid: string) =>
    `/problem/${pid}?_contentOnly=1`;
  export const SEARCH_CONTESTPROBLEM = (pid: string, cid: string) =>
    `/problem/${pid}?contestId=${cid}&_contentOnly=1`;
  export const SEARCH_SOLUTION = (pid: string, page: number) =>
    `/problem/solution/${pid}?page=${page}&_contentOnly=1`;
  export const INDEX = `/`;
  export const CAPTCHA_IMAGE = '/api/verify/captcha';
  export const LOGIN_CAPTCHA_IMAGE = `/lg4/captcha`;
  export const CONTEST = (cid: number) => `/contest/${cid}?_contentOnly=1`;
  export const LOGIN_ENDPOINT = `/do-auth/password`;
  export const SEND_MAIL_2fa = `${apiURL}/verify/sendTwoFactorCode`;
  export const LOGOUT = `/auth/logout`;
  export const FATE = `/index/ajax_punch`;
  export const FOLLOWED_BENBEN = (page: number) =>
    `${apiURL}/feed/watching?page=${page}`;
  export const USER_BENBEN = (page: number, user?: number) =>
    `${apiURL}/feed/list?page=${page}&user=${user !== undefined ? user : ''}`;
  export const BenbenReferer = 'https://www.luogu.com.cn/';
  export const BENBEN_POST = `${apiURL}/feed/postBenben`;
  export const BENBEN_DELETE = (id: number) => `${apiURL}/feed/delete/${id}`;
  export const UNLOCK_ENDPOINT = `/do-auth/totp`;
  export const ranklist = (cid: number, page: number) =>
    `/fe/api/contest/scoreboard/${cid}?page=${page}`;
  export const TRAINLISTDETAIL = (id: number) =>
    `/training/${id}?_contentOnly=1`;
  export const SEARCHTRAINLIST = (
    channel: string,
    keyword: string,
    page: number
  ) =>
    `/training/list?type=${channel}&page=${page}&keyword=${encodeURI(
      keyword
    )}&_contentOnly=1`;
  export const SOLUTION_REFERER = (pid: string) => `/problem/solution/${pid}`;
  export const MYARTICLE = `/article/mine?_contentOnly`,
    DELETE_ARTICLE = (lid: string) => `${apiURL}/article/delete/${lid}`,
    EDIT_ARTICLE = (lid: string) => `${apiURL}/article/edit/${lid}`,
    GET_ARTICLE = (lid: string) => `/article/${lid}?_contentOnly`,
    REQUEST_PROMOTION = (lid: string) => `/api/article/requestPromotion/${lid}`,
    WITHDRAW_PROMOTION = (lid: string) =>
      `/api/article/withdrawPromotion/${lid}`,
    CREATE_ARTICLE = '/api/article/new';
}

declare module 'axios' {
  export interface AxiosRequestConfig<
    // eslint-disable-next-line
    D = any
  > {
    myInterceptors_cookie?: Cookie | null | undefined;
    myInterceptors_notCheckCookie?: boolean;
  }
}

export const axios = (() => {
  const axios = _.create({
    baseURL: API.baseURL,
    withCredentials: true,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      Referer: 'https://www.luogu.com.cn/'
    },
    proxy: false,
    timeout: 6000,
    beforeRedirect: (options, { headers, statusCode }) => {
      if (statusCode === 302 && headers.location === '/auth/login') {
        needLogin();
        throw new Error('未登录');
      }
    }
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

  axios.interceptors.request.use(async config => {
    if (config.method !== 'get' && config.headers['X-CSRF-Token'] === undefined)
      config.headers['X-CSRF-Token'] = await csrfToken(
        config.myInterceptors_cookie || undefined
      ).catch(err => console.error(err));
    return config;
  });
  axios.interceptors.request.use(async config => {
    if (config.myInterceptors_cookie === null) return config;
    if (config.myInterceptors_cookie === undefined)
      config.myInterceptors_cookie =
        await globalThis.luogu.authProvider.cookie();
    config.headers.cookie = cookieString(config.myInterceptors_cookie);
    return config;
  });
  axios.interceptors.response.use(
    res => {
      if (res.config.myInterceptors_notCheckCookie) return res;
      if (res.config.myInterceptors_cookie?.uid) {
        const get = praseCookie(res.headers['set-cookie']);
        if (
          get.uid !== undefined &&
          get.uid != res.config.myInterceptors_cookie.uid
        )
          throw Error('UnknownCookie');
      }
      return res;
    },
    async err => {
      if (!isAxiosError(err) || !err.response) throw err;
      if (err.response.data.errorMessage === '未登录') {
        needLogin();
        throw err;
      }
      if (err.config?.myInterceptors_notCheckCookie) throw err;
      if (err.config?.myInterceptors_cookie?.uid) {
        const get = praseCookie(err.response.headers['set-cookie']);
        if (
          get.uid !== undefined &&
          get.uid != err.config.myInterceptors_cookie.uid
        ) {
          const sessions = await globalThis.luogu.authProvider.getSessions();
          if (sessions.length > 0) {
            globalThis.luogu.authProvider.removeSession(sessions[0].id);
            vscode.window
              .showErrorMessage('登录信息已经失效，请重新登录。', '登录')
              .then(async c => {
                if (c) vscode.commands.executeCommand('luogu.signin');
              });
          }
        }
      }
      throw err;
    }
  );
  axios.interceptors.response.use(
    res => {
      if (res.config.myInterceptors_notCheckCookie) return res;
      if (res.config.myInterceptors_cookie?.uid) {
        const get = praseCookie(res.headers['set-cookie']);
        if (
          get.uid !== undefined &&
          get.uid != res.config.myInterceptors_cookie.uid
        )
          throw new Error('UnknownCookie');
      }
      return res;
    },
    async err => {
      if (!isAxiosError(err) || !err.response) throw err;
      if (err.response.data.errorMessage === '未登录') {
        needLogin();
        throw err;
      }
      if (err.config?.myInterceptors_notCheckCookie) throw err;
      if (err.config?.myInterceptors_cookie?.uid) {
        const get = praseCookie(err.response.headers['set-cookie']);
        if (
          get.uid !== undefined &&
          get.uid != err.config.myInterceptors_cookie.uid
        ) {
          const sessions = await globalThis.luogu.authProvider.getSessions();
          if (sessions.length > 0) {
            globalThis.luogu.authProvider.removeSession(sessions[0].id);
            vscode.window
              .showErrorMessage('登录信息已经失效，请重新登录。', '登录')
              .then(async c => {
                if (c) vscode.commands.executeCommand('luogu.signin');
              });
          }
        }
      }
      throw err;
    }
  );
  axios.interceptors.request.use(config => {
    const url = new URL(config.url ?? '', config.baseURL);
    for (const [key, value] of Object.entries(config.params ?? {}))
      url.searchParams.set(key, String(value));
    if (url.searchParams.has('_contentOnly'))
      config.headers['x-lentille-request'] = 'content-only';
    return config;
  });

  return axios;
})();

export default axios;

export const genClientID = async function () {
  const cookies = (
    await axios.get(API.baseURL, {
      myInterceptors_notCheckCookie: true,
      myInterceptors_cookie: null
    })
  ).headers['set-cookie'];
  if (!cookies) throw new Error('Cookie not found in header');
  const s = praseCookie(cookies).clientID;
  if (!s) throw new Error('Cookie not found in header');
  return s;
};

export const csrfToken = async (cookie?: Cookie, path: string = API.baseURL) =>
  axios
    .get(path, {
      myInterceptors_cookie: cookie
    })
    .then(res => {
      const result = CSRF_TOKEN_REGEX.exec(res.data);
      return result ? result[1].trim() : null;
    });

export const searchProblem = async (pid: string) =>
  axios
    .get<DataResponse<ProblemData>>(API.SEARCH_PROBLEM(pid))
    .then(res => res.data)
    .then(res => {
      if (res.code !== 200) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error((res.currentData as any).errorMessage || '');
      }
      return res.currentData.problem;
    });

export const searchContestProblem = async (pid: string, cid: string) =>
  axios
    .get<DataResponse<ProblemData>>(API.SEARCH_CONTESTPROBLEM(pid, cid))
    .then(res => res.data)
    .then(res => {
      if (res.code !== 200) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error((res.currentData as any).errorMessage || undefined);
      }
      return res.currentData.problem;
    })
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw new Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

export const getProblemData = async (pid: string, cid?: number) =>
  axios
    .get<
      DataResponse<ProblemData>
    >(cid ? API.SEARCH_CONTESTPROBLEM(pid, cid.toString()) : API.SEARCH_PROBLEM(pid))
    .then(x => {
      return x.data.currentData;
    });

export const searchContest = async (cid: number) =>
  axios
    .get<DataResponse<ContestData>>(API.CONTEST(cid))
    .then(res => res?.data?.currentData)
    .then(async res => {
      // console.log(res)
      if ((res || null) === null) {
        throw new Error('比赛不存在');
      }
      return res;
    })
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw new Error('请求超时，请重试');
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
        throw new Error('题目不存在');
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
        else throw new Error('未找到题解');
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
        throw new Error('请求超时，请重试');
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
        throw new Error('题单不存在');
      }
      return res;
    })
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw new Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

export const searchTrainingdetail = async (id: number) =>
  axios
    .get<DataResponse<ProblemSetData>>(API.TRAINLISTDETAIL(id))
    .then(res => res.data.currentData)
    .then(async res => {
      // console.log(res)
      if ((res || null) === null) {
        throw new Error('题单不存在');
      }
      return res;
    })
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw new Error('请求超时，请重试');
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
        myInterceptors_cookie: cookie,
        myInterceptors_notCheckCookie: true
      }
    )
    .then(x => ({
      ...x.data,
      uid: praseCookie(x.headers['set-cookie']).uid
    }));
};

export const unlock = async (code: string, cookie?: Cookie) => {
  return await axios.post<void>(
    API.UNLOCK_ENDPOINT,
    {
      code
    },
    {
      headers: {
        'X-CSRF-Token': await csrfToken(cookie, '/auth/login')
      },
      myInterceptors_cookie: cookie
    }
  );
};

export const getStatus = async () => {
  const session = await globalThis.luogu.authProvider.getSessions();
  if (session.length === 0) return UserStatus.SignedOut.toString();
  const status = await globalThis.luogu.authProvider
    .cookie()
    .then(x => (x.uid !== 0 ? checkCookie(x) : false));
  if (status) {
    return UserStatus.SignedIn.toString();
  } else {
    globalThis.luogu.authProvider.removeSession(session[0].id);
    vscode.window
      .showErrorMessage('登录信息已经失效，请重新登录。', '登录')
      .then(async c => {
        if (c) vscode.commands.executeCommand('luogu.signin');
      });
    return UserStatus.SignedOut.toString();
  }
};

export const sendMail2fa = async (captcha: string, cookie?: Cookie) =>
  axios.post(
    API.SEND_MAIL_2fa,
    { captcha, endpointType: 1 },
    {
      myInterceptors_cookie: cookie
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
        throw new Error('请求超时，请重试');
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
        throw new Error('请求超时，请重试');
      } else {
        throw err;
      }
    });
export const logout = async () =>
  axios.post<void>(API.LOGOUT, undefined, {
    myInterceptors_notCheckCookie: true,
    maxRedirects: 0,
    validateStatus: status => (200 <= status && status < 300) || status === 302
  });

export const getFate = async () =>
  axios
    .get(API.FATE)
    .then(data => data?.data)
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw new Error('请求超时，请重试');
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
        throw new Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

export const searchUser = async (keyword: string, cookie?: Cookie) =>
  axios
    .get<{ users: [UserSummary | null] }>(
      `/api/user/search?keyword=${keyword}`,
      {
        myInterceptors_cookie: cookie
      }
    )
    .then(data => data?.data)
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw new Error('请求超时，请重试');
      } else {
        throw err;
      }
    });

export const fetchFollowedBenben = async (page: number) =>
  axios
    .get<{
      status: number;
      data: ActivityData[];
    }>(API.FOLLOWED_BENBEN(page))
    .then(data => data.data);

export const fetchUserBenben = async (page: number, user?: number) =>
  axios
    .get<{ feeds: List<Activity> }>(API.USER_BENBEN(page, user))
    .then(data => data.data);

// 只需要请求用户犇犇时不带 cookie 就可以获得到全网犇犇了（？）
export const fetchAllBenben = async (page: number) =>
  axios
    .get<{
      feeds: List<Activity>;
    }>(API.USER_BENBEN(page), {
      myInterceptors_notCheckCookie: true,
      myInterceptors_cookie: null
    })
    .then(data => data.data);

export const postBenben = async (benbenText: string) =>
  axios
    .post<{ status: number; data: ActivityData }>(API.BENBEN_POST, {
      content: benbenText
    })
    .then(data => {
      return data.data.data;
    });

export const deleteBenben = async (id: number) =>
  axios
    .post<{ status: number; data: [] }>(API.BENBEN_DELETE(id), {})
    .then(data => data?.data)
    .catch(err => {
      if (err.response) {
        throw err.response.data;
      } else if (err.request) {
        throw new Error('请求超时，请重试');
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

export const postVote = async (id: number, type: number) =>
  axios
    .post(`/api/blog/vote/${id}`, { Type: type })
    .then(data => data.data as { status: number; data: number | string })
    .catch(err => {
      throw err;
    });

export const parseProblemID = (name: string) => {
  const regexs = [
    /^(AT_\w*)\./i,
    /^(CF[0-9]{1,4}[A-Z][0-9]{0,1})\./i,
    /^(SP[0-9]{1,5})\./i,
    /^(P[0-9]{4,5})\./i,
    /^(UVA[0-9]{1,5})\./i,
    /^(U[0-9]{1,6})\./i,
    /^(T[0-9]{1,6})\./i,
    /^(B[0-9]{4})\./i
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

export const getRanklist = async (cid: number, page: number) => {
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
  { pid, cid }: { pid: string; cid?: number },
  code: string,
  language: number = 0,
  enableO2: boolean = false
) {
  const url =
    `/fe/api/problem/submit/${pid}` + (cid ? `?contestId=${cid}` : '');
  return axios
    .post<{ rid: number }>(url, {
      code: code,
      lang: language,
      enableO2: enableO2,
      verify: ''
    })
    .then(res => res.data.rid);
}
export async function checkCookie(c: Cookie) {
  const res = await axios.get('/', {
    myInterceptors_notCheckCookie: true,
    myInterceptors_cookie: c
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
export const getLoginCaptcha = async (c?: Cookie) =>
    axios
      .get(API.LOGIN_CAPTCHA_IMAGE, {
        responseType: 'arraybuffer',
        myInterceptors_cookie: c
      })
      .then(x => Buffer.from(x.data, 'binary')),
  getCaptcha = async (c?: Cookie) =>
    axios
      .get(API.CAPTCHA_IMAGE, {
        responseType: 'arraybuffer',
        myInterceptors_cookie: c
      })
      .then(x => Buffer.from(x.data, 'binary'));

export const listMyArticles = async (params: {
    type?: 'all' | 'promotion';
    page?: number;
  }) =>
    axios
      .get<LentilleDataResponse<ArticleListData>>(API.MYARTICLE, {
        params
      })
      .then(x => x.data),
  listMyAllArticles = async (type?: 'all' | 'promotion') =>
    listMyArticles({ type }).then(async res => [
      ...Object.values(res.data.articles.result),
      ...(
        await Promise.all(
          Array.from(
            {
              length:
                Math.ceil(
                  res.data.articles.count /
                    (res.data.articles.perPage || res.data.articles.count)
                ) - 1
            },
            (_, i) =>
              listMyArticles({ type, page: i + 2 }).then(x =>
                Object.values(x.data.articles.result)
              )
          )
        )
      ).flat()
    ]),
  deleteArticle = async (lid: string) =>
    axios.post<{ lid: string }>(API.DELETE_ARTICLE(lid)).then(x => x.data),
  editArticle = async (lid: string, data: EditArticleRequest) =>
    axios
      .post<{ article: ArticleDetails }>(API.EDIT_ARTICLE(lid), data)
      .then(x => x.data),
  getArticle = async (lid: string) =>
    axios
      .get<LentilleDataResponse<ArticleData>>(API.GET_ARTICLE(lid))
      .then(x => x.data),
  requestPromotion = async (lid: string) =>
    axios.post<void>(API.REQUEST_PROMOTION(lid)).then(x => x.data),
  withdrawPromotion = async (lid: string) =>
    axios.post<void>(API.WITHDRAW_PROMOTION(lid)).then(x => x.data),
  createArticle = async (data: EditArticleRequest) =>
    axios
      .post<{ article: ArticleDetails }>(API.CREATE_ARTICLE, data)
      .then(x => x.data.article);
