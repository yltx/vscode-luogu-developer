import MarkdownIt from 'markdown-it';
import { katex, MarkdownItKatexOptions } from '@mdit/plugin-katex';
import markdownItHighlight from 'markdown-it-highlightjs';

const md = MarkdownIt()
  .use(markdownItHighlight)
  .use<MarkdownItKatexOptions>(katex, { allowInlineWithSpace: true });

// 将 luogu markdown 中嵌入的 bilibili 视频转换为指向视频的链接。Reference: https://www.luogu.com.cn/paste/l9faoe0v
const defaultRender = md.renderer.rules.image,
  aidRE = /^(([0-9]+)|(av[0-9]+))$/, // 匹配视频aid格式 允许纯数字或av+数字
  bvidRE = /^(BV[A-Za-z0-9]{10})$/; // 匹配视频bvid格式 BV+10个大小写字母/数字
md.renderer.rules.image = function (tokens, idx, options, env, self) {
  if (!defaultRender) throw new Error('image renderer is not defined');
  const token = tokens[idx],
    aIndex = token.attrIndex('src');
  if (!token.attrs) return defaultRender(tokens, idx, options, env, self);
  const url = new URL(token.attrs[aIndex][1]); // 将视频当作 url 处理
  if (
    url.protocol == 'bilibili:' &&
    (aidRE.test(url.pathname) || bvidRE.test(url.pathname))
  ) {
    const info: { aid?: string; bvid?: string; page: number; t: number } = {
      t: +(url.searchParams.get('t') || '0'),
      page: +(url.searchParams.get('page') || '1')
    }; // 若没有P号或时间标记，则默认为 0 与 1
    if (aidRE.test(url.pathname))
      info.aid = (url.pathname[0] != 'a' ? 'av' : '') + url.pathname; // 匹配 av 号。若匹配，将纯数字格式的 av 号开头也补上 "av"
    if (bvidRE.test(url.pathname)) info.bvid = url.pathname; // 匹配 bv 号
    return `
            <a href="https://www.bilibili.com/video/${
              info.bvid || info.aid
            }?p=${info.page}&t=${info.t}" class="bilivideo">
                <i class="fa-brands fa-bilibili"></i>
                在 bilibili 中打开视频 ${info.bvid || info.aid}
            </a>`;
  }
  return defaultRender(tokens, idx, options, env, self);
};

export default md;
