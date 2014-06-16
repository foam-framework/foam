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
  ['firefox', function() { return navigator.userAgent.indexOf('Firefox') != -1; }],
  'stdlib',
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
  'XMLUtil',
  'context',
  'FOAM',
  'JSONParser',
  'TemplateUtil',
  // To use FO, uncomment the next line
  // and comment out all lines from AbstractPrototype to mm6Prototbuf
  // inclusively
//  'experimental/fo',
//  'experimental/protobuffeatures',
  'AbstractPrototype',
  'ModelProto',
  'mm1Model',
  'mm2Property',
  'mm3Types',
  'mm4Method',
  'mm5Misc',
  'mm6Protobuf',
  'value',
  'view',
  'ChoiceView',
  'DetailView',
  'TableView',
  'cview',
  'RichTextView',
  'listchoiceview',
  'scroll',
  'mlang',
  'QueryParser',
  'search',
  'async',
  'oam',
  'visitor',
  'dao',
  'ClientDAO',
  'diff',
  'SplitDAO',
  'index',
  'StackView',
  'MementoMgr',
  'DAOController',
  'ThreePaneController',
  'experimental/protobufparser',
  'experimental/protobuf',
  // remove below here
  'models',
  'touch',
  'glang',
  'oauth',
  '../apps/mailreader/view',
  '../apps/mailreader/email',
  'turntable'
];
