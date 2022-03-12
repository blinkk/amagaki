import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('page-module-placeholder')
export class PageModulePlaceholder extends LitElement {

  @property({attribute: 'partial'})
  partial?: string;

  static get styles() {
    return [
      css`
        :host {
          background: rgba(0, 0,0,.05);
          border-radius: 5px;
          box-sizing: border-box;
          color: #2c2c2c;
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
          font-size: 16px;
          font-weight: 500;
          line-height: 24px;
          padding: 16px 24px;
          text-align: center;
        }
        .small {
          font-size: 12px;
          line-height: 16px;
          margin-top: 8px;
        }
      `,
    ];
  }

  render() {
    return html`
      <div>Warning: No page module named <u>${this.partial}</u> was found.</div>
      <div class="small">This template must be set up by a developer before it can be used.</div>
    `;
  }
}
