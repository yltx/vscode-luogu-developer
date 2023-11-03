import MarkdownIt from 'markdown-it';
import { katex,MarkdownItKatexOptions } from '@mdit/plugin-katex';
import markdownItHighlight from 'markdown-it-highlightjs';
;

const md = MarkdownIt().use(markdownItHighlight).use<MarkdownItKatexOptions>(katex,{allowInlineWithSpace:true});


const defaultRender = md.renderer.rules.image,
    aidRE = /^(([0-9]+)|(av[0-9]+))$/,
    bvidRE = /^(BV[A-Za-z0-9]{10})$/;

md.renderer.rules.image = function (tokens, idx, options, env, self) {
    if (!defaultRender) throw new Error('image renderer is not defined');
    let token = tokens[idx], aIndex = token.attrIndex('src');
    if (!token.attrs) return defaultRender(tokens, idx, options, env, self);
    let url = new URL(token.attrs[aIndex][1]);
    if (url.protocol == "bilibili:" && (aidRE.test(url.pathname) || bvidRE.test(url.pathname))) {
        let info: { aid?: string, bvid?: string, page: number, t: number }
            = { t: +(url.searchParams.get("t") || "0"), page: +(url.searchParams.get("page") || "1") };
        if (aidRE.test(url.pathname)) info.aid = url.pathname[0] != 'a' ? 'av' : url.pathname;
        if (bvidRE.test(url.pathname)) info.bvid = url.pathname;
        return`
            <a href="https://www.bilibili.com/video/${info.bvid||info.aid}?p=${info.page}&t=${info.t}" class="bilivideo">
                <i class="fa-brands fa-bilibili"></i>
                在 bilibili 中打开视频 ${info.bvid||info.aid}
            </a>`
    }
    return defaultRender(tokens, idx, options, env, self);
};


export default md
