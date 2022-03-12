import '@shoelace-style/shoelace/dist/themes/dark.css';

import {PageBuilderInspector} from './page-module-inspector';
import {PageInspector} from './page-inspector';
import {SlDropdown} from '@shoelace-style/shoelace';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('/_page-builder/');

const ELEMENTS = [PageBuilderInspector, PageInspector, SlDropdown];
