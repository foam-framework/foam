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
  [ '../js/foam/core/bootstrap/ModelFileDAO', IN_BROWSER ],
  [ '../js/node/dao/ModelFileDAO', IN_NODEJS ],
  [ '../js/node/dao/JSModelFileDAO', IN_NODEJS ],
  '../js/foam/ui/Window',
  'value',
  '../js/foam/patterns/ChildTreeTrait', // used in view, included here for backward compat of old apps
  'view',
  'view2',
  '../js/foam/ui/FoamTagView',
  'AbstractDAOView',
  'DAOListView',
  'daoView',
  'ChoiceView',
  'DetailView',
  'TableView',
  'cview',
  'RichTextView',
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
  'dao',
  'dao2',
  'arrayDAO',
  'diff',
  'index',
  'StackView',
  'MementoMgr',
  'DAOController',
  'models',
  'touch',
  [ 'glang', IN_BROWSER ],
  'oauth'
];
