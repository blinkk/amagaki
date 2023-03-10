import * as dom from '@blinkk/degu/lib/dom/dom.js';
import * as func from '@blinkk/degu/lib/func/func.js';

import {LitElement, css, html} from 'lit';

import {AttributeHighlighter as DeguAttributeHighlighter} from '@blinkk/degu/lib/ui/attribute-highlighter.js';
import {customElement} from 'lit/decorators.js';

// Adds required styles to page only ever once.
const addStylesToPage = func.runOnlyOnce(() => {
  dom.addStylesToPage(`
    .attribute-highlighter {
      align-items: left;
      color: #FFF;
      background: #000;
      border-radius: 3px;
      box-shadow: none !important;
      display: flex;
      flex-direction: column;
      font-size: 11px;
      height: auto;
      justify-content: center;
      left: var(--left);
      margin: 0 !important;
      max-width: var(--max-width);
      padding: 0px 8px;
      position: fixed !important;
      // Slight off center.
      top: calc(var(--center) + 10px);
      transform: translateX(-50%) translateY(0%);
      transition: transform 0.3s ease;
      transform-origin: top center;
      z-index: 9999;
      cursor: pointer;
    }
    .attribute-highlighter span {
        display: block;
    }
    .attribute-highlighter.active,
    .attribute-highlighter:active,  {
        z-index: 10000;
        transform: translateX(-50%) translateY(0%) scale(1.2);
    }
    .attribute-highlighter:hover {
        cursor: pointer;
        z-index: 10000;
    }
    .attribute-highlighter.up {
        top: calc(var(--center) - 10px + (var(--height)  * -1));
    }
  `);
});

@customElement('attribute-highlighter')
export class AttributeHighlighter extends LitElement {
  private attributeHighlighter?: DeguAttributeHighlighter;
  private show = false;
  connectedCallback() {
    super.connectedCallback();

    // Add styles to page.
    addStylesToPage();

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'a') {
        this.toggleA11yHighlight();
      }
    });
  }

  private toggleA11yHighlight() {
    this.show = !this.show;
    if (this.show) {
      this.attributeHighlighter = new DeguAttributeHighlighter({
        cssClassName: 'attribute-highlighter',
        scopeQuerySelector: 'page-module',
        attributes: [
          {attribute: 'alt', querySelector: 'img'},
          {attribute: 'aria-label', querySelector: 'img'},
        ],
        warnMissingAttributes: [
          {
            attribute: 'alt',
            querySelector: 'img',
          },
        ],
      });
      this.attributeHighlighter.refresh();
    } else {
      this.attributeHighlighter?.dispose();
    }
  }

  createRenderRoot() {
    return this;
  }
}
