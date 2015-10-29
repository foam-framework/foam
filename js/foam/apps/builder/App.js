/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

__DATA({
  model_: 'foam.build.WebApplication',
  id: 'foam.apps.builder.App',
  controller: 'foam.apps.builder.Builder',
  defaultView: 'foam.apps.builder.BuilderView',
  htmlFileName: 'unused.html',
  precompileTemplates: true,
  coreFiles: [
    'funcName',
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
    'ChromeEval',
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
  ]
});
