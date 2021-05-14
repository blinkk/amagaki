const commonTags = require('common-tags');
const marked = require('marked');
const uuid = require('uuid');
const {JSDOM} = require('jsdom');

const register = pod => {
  const nunjucksPlugin = pod.plugins.get('NunjucksPlugin');
  nunjucksPlugin.addFilter('codeTabs', function (value) {
    const tabSetId = `t-${uuid.v1()}`;
    const html = marked(value).trim();
    const dom = new JSDOM(html);
    const languages = Array.from(
      dom.window.document.querySelectorAll('code')
    ).map(el => {
      return el.className.replace('language-', '');
    });
    return this.env.filters.safe(
      commonTags.oneLine`
      <div class="codeTabs">
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
                class="codeTabs__tabLabel"
              >
                <span>${language}</span>
              </label>
            `;
          })
          .join('')}
        <div class="codeTabs__blocks" tabindex="1">
          ${html}
        </div>
      </div>
    `
    );
  });
};

module.exports = {
  register: register,
};
