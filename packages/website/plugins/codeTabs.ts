import {NunjucksPlugin, Pod} from '@amagaki/amagaki';
import hljs from 'highlight.js';

function mapLanguage(lang: string): string {
  const normalized = (lang || '').trim().toLowerCase();
  if (normalized === 'nunjucks' || normalized === 'njk' || normalized === 'jinja') {
    return 'twig';
  }
  if (normalized === 'shell' || normalized === 'sh') {
    return 'bash';
  }
  if (normalized === 'ts') {
    return 'typescript';
  }
  if (normalized === 'js') {
    return 'javascript';
  }
  if (normalized === 'yml') {
    return 'yaml';
  }
  return hljs.getLanguage(normalized) ? normalized : 'plaintext';
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

export function highlightCode(code: string, lang: string): string {
  const language = mapLanguage(lang);
  try {
    return hljs.highlight(code, {language}).value;
  } catch {
    return escapeHtml(code);
  }
}

export function highlightMarkdownHtml(html: string): string {
  return html.replace(
    /<pre><code(?: class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/g,
    (_match, lang: string | undefined, rawCode: string) => {
      const decoded = decodeHtmlEntities(rawCode).replace(/\n$/, '');
      const language = mapLanguage(lang || '');
      const highlighted = highlightCode(decoded, language);
      return `<pre><code class="hljs language-${escapeHtml(language)}">${highlighted}</code></pre>`;
    }
  );
}

let tabCounter = 0;

export const register = (pod: Pod) => {
  const nunjucksPlugin = pod.plugins.get('NunjucksPlugin') as NunjucksPlugin;

  nunjucksPlugin.addFilter('highlightCode', function (html: string) {
    if (!html) {
      return '';
    }
    return this.env.filters.safe(highlightMarkdownHtml(String(html)));
  });

  nunjucksPlugin.addFilter('codeTabs', function (value: string) {
    const blocks: Array<{lang: string; label: string; isFilename: boolean; code: string}> = [];
    const fenceRegex = /```([^\n]*)\n([\s\S]*?)```/g;
    let match: RegExpExecArray | null;
    while ((match = fenceRegex.exec(value)) !== null) {
      const header = match[1].trim();
      const code = match[2].replace(/\n$/, '');
      const titleMatch = header.match(/:title=(.*)$/i);
      const lang = header.replace(/:title=.*$/i, '').trim() || 'plaintext';
      const title = titleMatch ? titleMatch[1].trim() : '';
      blocks.push({
        lang,
        label: title || lang,
        isFilename: Boolean(title),
        code,
      });
    }

    if (blocks.length === 0) {
      return this.env.filters.safe(value);
    }

    // Single unlabeled block: render as a clean dark <pre><code> block.
    if (blocks.length === 1 && !blocks[0].isFilename) {
      const b = blocks[0];
      const language = mapLanguage(b.lang);
      const highlighted = highlightCode(b.code, language);
      return this.env.filters.safe(
        `\n<pre><code class="hljs language-${escapeHtml(language)}">${highlighted}</code></pre>\n`
      );
    }

    // Multiple tabs or titled filename block: render zero-JS CSS radio tabs.
    const tabSetId = `ct-${++tabCounter}`;
    const tabsHtml = blocks
      .map((b, index) => {
        const tabId = `${tabSetId}-${index}`;
        const labelClass = b.isFilename
          ? 'codeTabs__tabLabel codeTabs__tabLabel--filename'
          : 'codeTabs__tabLabel';
        return `<input class="codeTabs__tabRadio" type="radio" id="${tabId}" name="${tabSetId}"${
          index === 0 ? ' checked' : ''
        }><label for="${tabId}" class="${labelClass}"><span>${escapeHtml(b.label)}</span></label>`;
      })
      .join('');

    const panelsHtml = blocks
      .map(b => {
        const language = mapLanguage(b.lang);
        const highlighted = highlightCode(b.code, language);
        return `<pre><code class="hljs language-${escapeHtml(language)}">${highlighted}</code></pre>`;
      })
      .join('');

    return this.env.filters.safe(
      `\n<div class="codeTabs" data-num-tabs="${blocks.length}">${tabsHtml}<div class="codeTabs__blocks">${panelsHtml}</div></div>\n`
    );
  });
};
