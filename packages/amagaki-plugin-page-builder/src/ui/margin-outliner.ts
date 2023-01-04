import * as dom from '@blinkk/degu/lib/dom/dom';
import * as func from '@blinkk/degu/lib/func/func';

import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {MarginOutliner as DeguMarginOutliner} from '@blinkk/degu/lib/ui/margin-outliner';
import Spacing from 'spacingjs/src/spacing.js';

// Adds required styles to page only ever once.
const addStylesToPage = func.runOnlyOnce(() => {
  dom.addStylesToPage(`
    .margin-outliner-spacer {
      align-items: center;
      background: rgba(26,115,232, 0.15);
      box-shadow: none !important;
      display: flex;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
      font-size: 12px;
      height: var(--height);
      justify-content: center;
      left: var(--left);
      margin: 0 !important;
      pointer-events: none;
      position: fixed !important;
      top: var(--top);
      width: var(--width);
      z-index: 9;
    }

    .margin-outliner-spacer--padding {
      background: rgba(255, 255, 0, .15);
    }
  `);
});

@customElement('margin-outliner')
export class MarginOutliner extends LitElement {
  private marginOutliner?: DeguMarginOutliner;
  private show = false;
  private spacingInitialized = false;
  private spacingStyleElement?: HTMLStyleElement;

  static DEFAULT_MARGINS = [4, 8, 10, 12, 16, 20, 24, 32, 40, 50, 60, 80, 100, 120];
  static STORAGE_KEY = 'inspectorMargins';
  static QUERY_PARAM_KEY = 'margins';

  @property({type: Array, attribute: 'margins'})
  margins?: number[];

  connectedCallback() {
    super.connectedCallback();
    addStylesToPage();
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'm') {
        this.toggleMarginOutliner();
      }
    });
    if (this.enabledOnLoad) {
      this.toggleMarginOutliner();
    }
  }

  get enabledOnLoad() {
    return localStorage.getItem(MarginOutliner.STORAGE_KEY) || new URLSearchParams(window.location.search).has(MarginOutliner.QUERY_PARAM_KEY);
  }

  setSpacingStylesShown(enabled: boolean) {
    if (enabled) {
      this.spacingStyleElement?.remove();
    } else {
      const styleEl = document.createElement('style') as HTMLStyleElement;
      styleEl.textContent = `
        [class^="spacing-js"] {
          display: none !important;
        }
      `;
      document.head.appendChild(styleEl);
      this.spacingStyleElement = styleEl;
    }
  }

  private toggleMarginOutliner() {
    this.show = !this.show;
    if (this.show) {
      this.marginOutliner = new DeguMarginOutliner({
        sizes: MarginOutliner.DEFAULT_MARGINS,
        cssClassName: 'margin-outliner-spacer',
        querySelector: 'page-module div:not(.image-inspector)',
      });
      this.marginOutliner.run();
      this.setSpacingStylesShown(true);
    } else {
      this.marginOutliner?.dispose();
      this.setSpacingStylesShown(false);
    }
    if (this.show && !this.spacingInitialized) {
      Spacing.start();
      this.spacingInitialized = true;
    }
    this.show ? localStorage.setItem(MarginOutliner.STORAGE_KEY, 'true') : localStorage.removeItem(MarginOutliner.STORAGE_KEY);
  }

  createRenderRoot() {
    return this;
  }
}
