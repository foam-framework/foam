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

var files = [
//  ['ServiceWorker', function() { return window.navigator && navigator.serviceWorker; }],
  [ 'firefox',  function() { return window.navigator && navigator.userAgent.indexOf('Firefox') != -1; }],
  [ 'funcName', function() { return ! Number.name; }],
  [ 'safari',   function() { return window.navigator && navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1; }],
  [ 'node',     IN_NODEJS ],
  [ 'i18n',     IN_BROWSER ],
  'stdlib',
  ['WeakMap',  function() { return ! this['WeakMap']; }],
  'writer',
  'socket',
  'async',
  'parse',
  'event',
  'JSONUtil',
  'XMLUtil',
  'context',
  'JSONParser',
  'TemplateUtil',
  'FOAM',
  // To use FO, uncomment the next line
  // and comment out all lines from FObject to mm5Misc
  // inclusively
//  'experimental/fo',
//  'experimental/protobuffeatures',
  'FObject',
  'BootstrapModel',
  'mm1Model',
  'mm2Property',
  'mm3Types',
  'mm4Method',
  'mm5Misc',
  [ '../js/foam/core/bootstrap/BrowserFileDAO', IN_BROWSER ],
  [ '../js/node/dao/ModelFileDAO', IN_NODEJS ],
  '../js/foam/ui/Window',
  'value',
  'view',
  '../js/foam/ui/FoamTagView',
  'cview',
  'listchoiceview',
  'scroll',
  'HTMLParser',
  'mlang',
  'mlang2',
  'QueryParser',
  'search',
  'oam',
  'visitor',
  'messaging',
//  '../js/foam/dao/ProxyDAO',
  'dao',
  'arrayDAO',
  'index',
  'models',
  'oauth',
  [ 'ModelDAO', IN_BROWSER ],
  [ 'NodeModelDAO', IN_NODEJS ]
];
