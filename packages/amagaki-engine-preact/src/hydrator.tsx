import {ComponentType, h} from 'preact';
import {render} from 'preact/compat';

export type PartialComponentType = ComponentType<{partial: any}>;

export interface PartialHydratorOptions {
  components: PartialComponentType[];
}

export class PartialHydrator {
  components: Record<string, PartialComponentType>;

  constructor(options: PartialHydratorOptions) {
    this.components = this.buildComponentMap(options.components);
  }

  private buildComponentMap(components: PartialComponentType[]) {
    const componentMap: Record<string, PartialComponentType> = {};
    for (const component of components) {
      componentMap[component.name] = component;
    }
    return componentMap;
  }

  static register(options: PartialHydratorOptions) {
    const manager = new PartialHydrator(options);
    document.addEventListener('DOMContentLoaded', () => {
      manager.hydratePartials();
    });
    return manager;
  }

  hydratePartialFromContext(
    name: string,
    contextEl: HTMLElement,
    containerEl: HTMLElement
  ) {
    const getContext = () => JSON.parse(contextEl?.textContent ?? '');
    try {
      const Element = this.components[name];
      if (Element) {
        render(<Element partial={getContext()} />, containerEl);
      }
    } catch (err) {
      console.error(`Error initializing partial: ${name}`);
      throw err;
    }
  }

  watchAndRehydrate(
    name: string,
    contextEl: HTMLElement,
    containerEl: HTMLElement
  ) {
    const contextObserver = new window.MutationObserver(() => {
      this.hydratePartialFromContext(name, contextEl, containerEl);
    });
    contextObserver.observe(contextEl, {
      characterData: true,
      characterDataOldValue: true,
      attributes: false,
      childList: false,
      subtree: true,
    });
  }

  hydratePartials() {
    const els = Array.from(
      document.querySelectorAll('page-module')
    ) as HTMLElement[];
    for (const el of els) {
      const contextEl = el.querySelector('page-module-context') as HTMLElement;
      const containerEl = el.querySelector(
        'page-module-container'
      ) as HTMLElement;
      const partialName = el?.getAttribute('partial') as string;
      contextEl &&
        this.hydratePartialFromContext(partialName, contextEl, containerEl);
      contextEl && this.watchAndRehydrate(partialName, contextEl, containerEl);
    }
  }
}
