const {JSDOM} = require('jsdom');
const commonTags = require('common-tags');
const hljs = require('highlight.js');
const marked = require('marked');
const uuid = require('uuid');

const register = pod => {
  marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: function (code, lang) {
      lang = lang === 'nunjucks' ? 'twig' : lang;
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, {language}).value;
    },
  });
  const nunjucksPlugin = pod.plugins.get('NunjucksPlugin');
  nunjucksPlugin.addFilter('codeTabs', function (value) {
    const tabSetId = `t-${uuid.v1()}`;
    const titleRegex = /:title=(.*)$/gim;
    const titles = (value.match(titleRegex) || []).map(item => {
      return item.replace(':title=', '');
    });
    value = value.replace(titleRegex, '');
    const html = marked(value).trim();
    const dom = new JSDOM(html);
    const languages = Array.from(
      dom.window.document.querySelectorAll('code')
    ).map(el => {
      return el.className.replace('language-', '');
    });
    return this.env.filters.safe(
      commonTags.oneLine`
      <div class="codeTabs" data-num-tabs="${languages.length}">
        ${languages
          .map((language, index) => {
            const tabId = `t-${uuid.v1()}`;
            return `
              <input
                class="codeTabs__tabRadio"
                type="radio"
                id="${tabId}"
                name="${tabSetId}"
                ${index === 0 ? 'checked' : ''}
              >
              <label
                for="${tabId}"
                class="codeTabs__tabLabel ${
                  titles[index] ? 'codeTabs__tabLabel--filename' : ''
                }"
              >
                <span>${titles[index] || language}</span>
              </label>
            `;
          })
          .join('')}
        <div class="codeTabs__blocks" tabindex="1">
        ` +
        html +
        commonTags.oneLine`
        </div>
      </div>
    `
    );
  });
};

module.exports = {
  register: register,
};
