import hljs from 'highlight.js';
import md from 'markdown-it';

/**
 * 处理MD语法
 * 使用 parseMD.render(e.msg);
 */
export const parseMD: any = new md('default', {
  breaks: true,
  linkify: true,
  typographer: true,
  highlight: (str: any, lang: any) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang }).value +
          '</code></pre>'
        );
      } catch (__) {}
    }

    return (
      '<pre class="hljs"><code>' +
      parseMD.utils.escapeHtml(str) +
      '</code></pre>'
    );
  },
});
