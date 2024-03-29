import MarkdownIt from 'markdown-it';
import { faBilibili } from '@fortawesome/free-brands-svg-icons/faBilibili';
import { icon } from '@fortawesome/fontawesome-svg-core';
import {
  provideVSCodeDesignSystem,
  vsCodeLink
} from '@vscode/webview-ui-toolkit';

provideVSCodeDesignSystem().register(vsCodeLink());

const md = new MarkdownIt({ linkify: true });

{
  const defaultLinkOpenRender =
    md.renderer.rules.link_open ||
    ((tokens, idx, options, env, self) =>
      self.renderToken(tokens, idx, options));

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    tokens[idx].tag = 'vscode-link';
    const oldurl = tokens[idx].attrGet('href');
    if (oldurl && oldurl[0] === '/')
      tokens[idx].attrSet('href', 'https://www.luogu.com.cn' + oldurl);
    return defaultLinkOpenRender(tokens, idx, options, env, self);
  };

  const defaultLinkCloseRender =
    md.renderer.rules.link_close ||
    ((tokens, idx, options, env, self) =>
      self.renderToken(tokens, idx, options));
  md.renderer.rules.link_close = function (tokens, idx, options, env, self) {
    tokens[idx].tag = 'vscode-link';
    return defaultLinkCloseRender(tokens, idx, options, env, self);
  };
}

{
  const BilibiliIcon = icon(faBilibili).html[0];
  const defaultImageRender = md.renderer.rules.image,
    aidRE = /^bilibili:(([0-9]+)|(av[0-9]+))$/, // 匹配视频aid格式 允许纯数字或av+数字
    bvidRE = /^bilibili:(BV[A-Za-z0-9]{10})$/; // 匹配视频bvid格式 BV+10个大小写字母/数字
  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    if (!defaultImageRender) throw new Error('image renderer is not defined');
    const token = tokens[idx],
      aIndex = token.attrIndex('src');
    if (!token.attrs)
      return defaultImageRender(tokens, idx, options, env, self);
    if (
      aidRE.test(token.attrs[aIndex][1]) ||
      bvidRE.test(token.attrs[aIndex][1])
    ) {
      const url = new URL(token.attrs[aIndex][1]);
      const info: { aid?: string; bvid?: string; page: number; t: number } = {
        t: +(url.searchParams.get('t') || '0'),
        page: +(url.searchParams.get('page') || '1')
      }; // 若没有P号或时间标记，则默认为 0 与 1
      if (aidRE.test(token.attrs[aIndex][1]))
        info.aid = (url.pathname[0] != 'a' ? 'av' : '') + url.pathname; // 匹配 av 号。若匹配，将纯数字格式的 av 号开头也补上 "av"
      if (bvidRE.test(token.attrs[aIndex][1])) info.bvid = url.pathname; // 匹配 bv 号
      return `
            <vscode-link href="https://www.bilibili.com/video/${
              info.bvid || info.aid
            }?p=${info.page}&t=${info.t}" class="bilivideo">
                ${BilibiliIcon}
                在 bilibili 中打开视频 ${info.bvid || info.aid}
            </vscode-link>`;
    }
    return defaultImageRender(tokens, idx, options, env, self);
  };
}

export default md;
