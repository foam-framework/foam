/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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

__DATA({
  model_: 'foam.build.WebApplication',
  id: 'com.google.mail.WebApp',
  controller: 'com.google.mail.MobileController',
  version: "1.1.5",
  includeFoamCSS: true,
  precompileTemplates: true,
  appcacheManifest: true,
  coreFiles: [
    'firefox',
    'internetexplorer',
    'funcName',
    'safari',
    'stdlib',
    'WeakMap',
    'async',
    'parse',
    'event',
    'JSONUtil',
    'XMLUtil',
    'context',
    'JSONParser',
    'TemplateUtil',
    'FOAM',
    'FObject',
    'BootstrapModel',
    'mm1Model',
    'mm2Property',
    'mm3Types',
    'mm4Method',
    'mm6Misc',
    '../js/foam/ui/Window',
    'value',
    'view',
    '../js/foam/ui/FoamTagView',
    '../js/foam/grammars/CSSDecl',
    'HTMLParser',
    'mlang',
    'mlang1',
    'mlang2',
    'QueryParser',
    'visitor',
    'messaging',
    'dao',
    'arrayDAO',
    'index',
    'models',
    'oauth',
    'NullModelDAO'
  ],
  htmlHeaders: [
    '<meta charset="utf-8"/>',
    '<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1"/>',
    '<meta name="mobile-web-app-capable" content="yes"/>'
  ]
});
