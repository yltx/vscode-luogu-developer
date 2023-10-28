import MarkdownIt from 'markdown-it';
import markdownKatex from '@luogu-dev/markdown-it-katex';
import markdownItHighlight from 'markdown-it-highlightjs';

const md = new MarkdownIt().use(markdownKatex).use(markdownItHighlight);

export default md
