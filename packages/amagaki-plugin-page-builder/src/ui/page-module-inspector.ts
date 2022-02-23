import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('page-module-inspector')
export class PageBuilderInspector extends LitElement {
  private pageModule: HTMLElement | null = null;

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    // Update after DOM is generated to update the module ID.
    window.addEventListener('DOMContentLoaded', () => {
      this.addIdToPageModule();
      this.requestUpdate();
    });
  }

  addIdToPageModule() {
    this.pageModule = this.parentElement as HTMLElement;
    if (this.pageModule && !this.pageModule.id) {
      this.pageModule.id = `m${this.position}`
    }
  }

  get enabled() {
    return new URLSearchParams(window.location.search).get('help') !== '0';
  }

  get elementId() {
    return this.pageModule?.id;
  }

  get pageModuleElement() {
    return this.closest('page-module') as HTMLElement;
  }

  get position() {
    return this.pageModuleElement?.getAttribute('position');
  }

  get partial() {
    return this.pageModuleElement?.getAttribute('partial');
  }

  static get styles() {
    return [
      css`
        .help-box {
          background: #2C2C2C;
          border-bottom-right-radius: 5px;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
          font-size: 12px;
          font-weight: 500;
          line-height: 12px;
          padding: 8px 12px;
          position: absolute;
          z-index: 999;
        }
        .help-box__label {
          cursor: default;
          display: inline-block;
        }
        .help-box__label a {
          color: inherit;
          text-decoration: none;
        }
        .help-box__label a:hover {
          text-decoration: underline;
        }
      `,
    ];
  }

  render() {
    return this.enabled
      ? html`
        <div class="help-box">
          <div class="help-box__label">
            <a href="#${this.elementId}">
              ${this.position}. ${this.partial}
            </a>
          </div>
        </div>
        `
      : '';
  }
}
