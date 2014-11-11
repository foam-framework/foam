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

var files = [
//  ['ServiceWorker', function() { return window.navigator && navigator.serviceWorker; }],
  ['firefox', function() { return window.navigator && navigator.userAgent.indexOf('Firefox') != -1; }],
  ['safari', function() { return window.navigator && navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1; }],
  [ 'i18n', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  'stdlib',
  ['WeakMap', function() { return ! this['WeakMap']; }],
  'io',
  'writer',
  'socket',
  'hash',
  'base64',
  'encodings',
  'utf8',
  'parse',
  'event',
  'JSONUtil',
  'HTMLParser',
  'XMLUtil',
  'context',
  'FOAM',
  'JSONParser',
  'TemplateUtil',
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
  [ 'value', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ 'view', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ 'layout', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ 'daoView', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ 'ChoiceView', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ 'DetailView', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ 'TableView', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ 'cview', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ 'cview2', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ 'RichTextView', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ 'listchoiceview', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ 'scroll', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  'mlang',
  'QueryParser',
  'search',
  'async',
  'oam',
  'visitor',
  'messaging',
  'dao',
  'arrayDAO',
  'ClientDAO',
  'diff',
  'SplitDAO',
  'index',
  [ 'StackView', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ 'MementoMgr', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ 'DAOController', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ 'ThreePaneController', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  'experimental/protobufparser',
  'experimental/protobuf',
  // remove below here
  'models',
  [ 'touch', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ 'glang', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  'oauth',
  [ '../apps/mailreader/view', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ '../apps/mailreader/email', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ '../lib/email/email', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ 'turntable', function() { return typeof vm == "undefined" || vm.Script !== vm; } ],
  [ 'CORE', function() { return typeof vm == "undefined" || vm.Script !== vm; } ]
];
