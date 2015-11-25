/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function IN_BROWSER() { return typeof vm == "undefined" || ! vm.runInThisContext; }
function IN_NODEJS() { return ! IN_BROWSER(); }
function IN_CHROME_APP() { return window.chrome && window.chrome.runtime && (!! window.chrome.runtime.id) };
function IN_BROWSER_NOT_APP() { return IN_BROWSER() && ! IN_CHROME_APP(); }
function IN_IE11() { return window.navigator &&
                     window.navigator.appName == 'Netscape' &&
                     window.navigator.userAgent.indexOf('Trident/') != -1; }
function AND(a, b) { return function() { return a() && b(); }; }
function NOT(a) { return function() { return ! a(); }; }

var __EXTRA_PROPERTIES__;

var files = [
//  ['ServiceWorker', function() { return window.navigator && navigator.serviceWorker; }],
  [ 'firefox',  function() { return window.navigator && navigator.userAgent.indexOf('Firefox') != -1; }],
  [ 'funcName', function() { return ! Number.name; }],
  [ 'safari',   function() { return window.navigator && navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1; }],
  [ 'internetexplorer',  function() { return ( window.Element && (!('remove' in Element.prototype))); }],
  [ 'node',     IN_NODEJS ],
  [ 'XMLHttpRequest', IN_NODEJS],
  [ 'i18n',     IN_BROWSER ],
  'stdlib',
  ['WeakMap',  function() { return ! this['WeakMap']; }],
  'async',
  'parse',
  'event',
  'JSONUtil',
  'XMLUtil',
  'context',
  'JSONParser',
  'TemplateUtil',
  [ 'ChromeEval', IN_CHROME_APP ],
  'FOAM',
  // To use FO, uncomment the next line
  // and comment out all lines from FObject to mm6Misc
  // inclusively
//  'experimental/fo',
//  'experimental/protobuffeatures',
  'FObject',

  'BootstrapModel',
  'mm1Model',
  'mm2Property',
  [ __EXTRA_PROPERTIES__, function() { return __EXTRA_PROPERTIES__; } ],
  'mm3Types',
  'mm4Method',
  'mm5Debug',
  'mm6Misc',
  '../js/foam/core/bootstrap/OrDAO',
  [ '../js/foam/core/bootstrap/IE11ModelDAO', IN_IE11 ],
  [ '../js/foam/core/bootstrap/BrowserFileDAO', AND(NOT(IN_IE11), IN_BROWSER_NOT_APP) ],
  [ '../js/node/dao/ModelFileDAO', IN_NODEJS ],
  '../js/foam/ui/Window',
  'value',
  'view',
  '../js/foam/ui/FoamTagView',
  'cview',
  '../js/foam/grammars/CSSDecl',
  'HTMLParser',
  'mlang',
  'mlang1',
  'mlang2',
  'QueryParser',
  'oam',
  'visitor',
  'messaging',
//  '../js/foam/dao/ProxyDAO',
  'dao',
  'arrayDAO',
  'index',
  'models',
  'oauth',
  [ 'ModelDAO', AND(NOT(IN_IE11), IN_BROWSER_NOT_APP) ],
  [ 'IE11ModelDAO', IN_IE11 ],
  [ '../js/foam/core/bootstrap/ChromeAppFileDAO', IN_CHROME_APP ],
  [ 'ChromeAppModelDAO', IN_CHROME_APP ],
  [ 'NodeModelDAO', IN_NODEJS ]
];
