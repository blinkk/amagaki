import '@shoelace-style/shoelace/dist/themes/dark.css';

import {PageBuilderInspector} from './page-module-inspector';
import {PageInspector} from './page-inspector';
import {PageModulePlaceholder} from './page-module-placeholder';
import {SlDropdown} from '@shoelace-style/shoelace';
import {setBasePath} from '@shoelace-style/shoelace/dist/utilities/base-path.js';

// Update the base path for loading Shoelace assets.
setBasePath('/_page-builder/');

// Ensure modules are referenced in order to include them in the bundle.
[PageBuilderInspector, PageInspector, PageModulePlaceholder, SlDropdown];
