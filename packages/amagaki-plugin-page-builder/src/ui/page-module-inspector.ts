import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('page-module-inspector')
export class PageBuilderInspector extends LitElement {
  private pageModule: HTMLElement | null = null;

  @property({attribute: 'edit-content-link'})
  editContentLink?: string;

  @property({attribute: 'submit-issue-link'})
  submitIssueLink?: string;

  @property({type: Boolean, attribute: 'draft'})
  draft: boolean = false;

  @property({type: Number, attribute: 'position'})
  position?: number;

  @property({attribute: 'partial'})
  partial?: string;

  @property({attribute: 'size'})
  size?: string;

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

  get shouldShowMenu() {
    return this.editContentLink || this.submitIssueLink;
  }

  get permalink() {
    return (this.shadowRoot?.querySelector('a') as HTMLAnchorElement).href;
  }

  copyLink() {
    navigator.clipboard.writeText(this.permalink);
  }

  navigateTo(url: string, newWindow?: Boolean) {
    if (newWindow) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  }

  static get styles() {
    return [
      css`
        .help-box {
          background: #2C2C2C;
          border-bottom-right-radius: 7px;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
          font-size: 12px;
          font-weight: 500;
          line-height: 12px;
          padding: 8px 12px;
          position: absolute;
          z-index: 999;
        }
        :host([neutral]) .help-box {
          background: rgba(0, 0,0,.15);
          color: #2c2c2c;
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
        .help-box sl-button::part(base) {
          --sl-input-height-medium: 24px;
          border-color: transparent;
          background: transparent;
          height: 24px;
          width: 24px;
        }
        .help-box sl-button::part(label) {
          border-radius: 100%;
          filter: invert(1);
          height: 21px;
          padding: 0;
          width: 22px;
        }
        .help-box sl-button:hover::part(label) {
          background: rgba(0, 0, 0, .15);
        }
        .help-box sl-badge {
          margin-bottom: -5px;
          margin-right: -2px;
          margin-top: -5px;
        }
        .help-box sl-dropdown {
          height: 24px;
          margin-bottom: -10px;
          margin-right: -10px;
          margin-top: -7px;
          transform: translateY(-1px);
          width: 24px;
        }
        .help-box sl-dropdown sl-menu::part(base) {
          z-index: 999;
        }
        .help-box sl-dropdown sl-menu-item::part(base) {
          color: white;
        }
        .help-box sl-dropdown sl-menu-item a {
          display: inline-block;
          color: inherit;
          text-decoration: none;
        }
        .help-box sl-dropdown sl-menu-item::part(base) .menu-item__chevron {
          display: none;
        }
        .help-box sl-dropdown sl-menu-item sl-icon {
          display: inline-block;
          filter: invert(1);
          height: 24px;
          margin-right: 10px;
          margin-top: -3px;
          vertical-align: middle;
          width: 24px;
        }
      `,
    ];
  }

  render() {
    return this.enabled
      ? html`
        <link href="/_page-builder/page-builder-ui.min.css" rel="stylesheet">
        <div class="help-box">
          <div class="help-box__label">
            <a href="#${this.elementId}">
              ${this.position}. ${this.partial}
              ${this.size && ` (${this.size})` || ''}
            </a>
            ${this.draft && html`
              <sl-badge variant="warning" pill>Draft</sl-badge>
            ` || ''}
          </div>
          ${this.shouldShowMenu && html`
            <sl-dropdown distance="1">
              <sl-button slot="trigger" circle="true">
                <img style="max-width: 100%" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0xNi41OSA4LjU5TDEyIDEzLjE3IDcuNDEgOC41OSA2IDEwbDYgNiA2LTZ6Ii8+PC9zdmc+">
              </sl-button>
              <sl-menu>
                <sl-menu-item @click="${this.copyLink}">
                  <sl-icon src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0xNiAxSDRjLTEuMSAwLTIgLjktMiAydjE0aDJWM2gxMlYxem0zIDRIOGMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxMWMxLjEgMCAyLS45IDItMlY3YzAtMS4xLS45LTItMi0yem0wIDE2SDhWN2gxMXYxNHoiLz48L3N2Zz4="></sl-icon>
                  Copy link
                </sl-menu-item>
                ${this.editContentLink && html`
                  <sl-menu-item @click="${(e: MouseEvent) => this.navigateTo(this.editContentLink!, true)}">
                    <sl-icon src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zIDE3LjI1VjIxaDMuNzVMMTcuODEgOS45NGwtMy43NS0zLjc1TDMgMTcuMjV6TTIwLjcxIDcuMDRjLjM5LS4zOS4zOS0xLjAyIDAtMS40MWwtMi4zNC0yLjM0Yy0uMzktLjM5LTEuMDItLjM5LTEuNDEgMGwtMS44MyAxLjgzIDMuNzUgMy43NSAxLjgzLTEuODN6Ii8+PC9zdmc+"></sl-icon>
                    Edit content
                  </sl-menu-item>
                `}
                ${this.submitIssueLink && html`
                  <sl-menu-item @click="${(e: MouseEvent) => this.navigateTo(this.submitIssueLink!, true)}">
                    <sl-icon src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0yMCA4aC0yLjgxYy0uNDUtLjc4LTEuMDctMS40NS0xLjgyLTEuOTZMMTcgNC40MSAxNS41OSAzbC0yLjE3IDIuMTdDMTIuOTYgNS4wNiAxMi40OSA1IDEyIDVjLS40OSAwLS45Ni4wNi0xLjQxLjE3TDguNDEgMyA3IDQuNDFsMS42MiAxLjYzQzcuODggNi41NSA3LjI2IDcuMjIgNi44MSA4SDR2MmgyLjA5Yy0uMDUuMzMtLjA5LjY2LS4wOSAxdjFINHYyaDJ2MWMwIC4zNC4wNC42Ny4wOSAxSDR2MmgyLjgxYzEuMDQgMS43OSAyLjk3IDMgNS4xOSAzczQuMTUtMS4yMSA1LjE5LTNIMjB2LTJoLTIuMDljLjA1LS4zMy4wOS0uNjYuMDktMXYtMWgydi0yaC0ydi0xYzAtLjM0LS4wNC0uNjctLjA5LTFIMjBWOHptLTYgOGgtNHYtMmg0djJ6bTAtNGgtNHYtMmg0djJ6Ii8+PC9zdmc+"></sl-icon>
                    Submit issue
                  </sl-menu-item>
                `}
              </sl-menu>
            </sl-dropdown>
          `}
        </div>
        `
      : '';
  }
}
