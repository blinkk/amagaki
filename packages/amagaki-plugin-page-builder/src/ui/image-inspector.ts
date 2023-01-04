import * as dom from '@blinkk/degu/lib/dom/dom';
import * as func from '@blinkk/degu/lib/func/func';

import {ImageInspector as DeguImageInspector} from '@blinkk/degu/lib/ui/image-inspector';
import {LitElement, css, html} from 'lit';
import {customElement} from 'lit/decorators.js';

// Adds required styles to page only ever once.
const addStylesToPage = func.runOnlyOnce(() => {
  dom.addStylesToPage(`
    .image-inspector {
      display: flex;
      flex-direction: column;
      background: #000;
      color: #FFF;
      box-shadow: none !important;
      font-size: 12px;
      line-height: 18px;
      left: var(--left);
      margin: 0 !important;
      pointer-events: none;
      position: fixed !important;
      top: var(--top);
      width: var(--width);
      max-width: var(--max-width);
      height: fit-content;
      min-width: 200px;
      padding: 8px;
      z-index: 9;
      text-align: left !important;
    }

    .image-inspector strong {
      font-size: inherit;
      line-height: inherit;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .image-inspector span {
      display: block;
    }
  `);
});

@customElement('image-inspector')
export class ImageInspector extends LitElement {
  static STORAGE_KEY = 'inspectorImage';
  static QUERY_PARAM_KEY = 'images';
  private imageInspector?: DeguImageInspector;
  private show = false;
  private imageInspectorInitialized = false;
  connectedCallback() {
    super.connectedCallback();

    // Add styles to page.
    addStylesToPage();

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'i') {
        this.toggleImageInspector();
      }
    });
    if (this.enabledOnLoad) {
      this.toggleImageInspector();
    }
  }

  get enabledOnLoad() {
    return localStorage.getItem(ImageInspector.STORAGE_KEY) || new URLSearchParams(window.location.search).has(ImageInspector.QUERY_PARAM_KEY);
  }

  private toggleImageInspector() {
    
    this.show = !this.show;

    if (this.show) {
      this.imageInspector = new DeguImageInspector({
        cssClassName: 'image-inspector',
        querySelector: 'page-module:not([partial="header"]):not([partial="footer"]) img',
      });

      window.addEventListener('load', (event) => {
        this.imageInspector.run();
      });
    } else {
      this.imageInspector?.dispose();
    }

    if (this.show && !this.imageInspectorInitialized) {
      this.imageInspectorInitialized = true;
    }

    this.show ? localStorage.setItem(ImageInspector.STORAGE_KEY, 'true') : localStorage.removeItem(ImageInspector.STORAGE_KEY);
  }

  createRenderRoot() {
    return this;
  }
}
