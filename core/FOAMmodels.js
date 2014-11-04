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
  ['firefox', function() { return window.navigator && navigator.userAgent.indexOf('Firefox') != -1; }],
  ['safari', function() { return window.navigator && navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1; }],
  [ 'i18n', function() { return typeof module !== "undefined"; } ],
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
  // and comment out all lines from FObject to mm6Prototbuf
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
  'mm6Protobuf',
  [ 'value', function() { return typeof module !== "undefined"; } ],
  [ 'view', function() { return typeof module !== "undefined"; } ],
  [ 'layout', function() { return typeof module !== "undefined"; } ],
  [ 'daoView', function() { return typeof module !== "undefined"; } ],
  [ 'ChoiceView', function() { return typeof module !== "undefined"; } ],
  [ 'DetailView', function() { return typeof module !== "undefined"; } ],
  [ 'TableView', function() { return typeof module !== "undefined"; } ],
  [ 'cview', function() { return typeof module !== "undefined"; } ],
  [ 'cview2', function() { return typeof module !== "undefined"; } ],
  [ 'RichTextView', function() { return typeof module !== "undefined"; } ],
  [ 'listchoiceview', function() { return typeof module !== "undefined"; } ],
  [ 'scroll', function() { return typeof module !== "undefined"; } ],
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
  [ 'StackView', function() { return typeof module !== "undefined"; } ],
  [ 'MementoMgr', function() { return typeof module !== "undefined"; } ],
  [ 'DAOController', function() { return typeof module !== "undefined"; } ],
  [ 'ThreePaneController', function() { return typeof module !== "undefined"; } ],
  'experimental/protobufparser',
  'experimental/protobuf',
  // remove below here
  'models',
  [ 'touch', function() { return typeof module !== "undefined"; } ],
  [ 'glang', function() { return typeof module !== "undefined"; } ],
  'oauth',
  [ '../apps/mailreader/view', function() { return typeof module !== "undefined"; } ],
  [ '../apps/mailreader/email', function() { return typeof module !== "undefined"; } ],
  [ '../lib/email/email', function() { return typeof module !== "undefined"; } ],
  [ 'turntable', function() { return typeof module !== "undefined"; } ],
  [ 'CORE', function() { return typeof module !== "undefined"; } ]
];
