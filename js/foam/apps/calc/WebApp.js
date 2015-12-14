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
  id: 'foam.apps.calc.WebApp',
  controller: 'foam.apps.calc.Calc',
  defaultView: 'foam.apps.calc.CalcView',
  appcacheManifest: true,
  precompileTemplates: true,
  version: '2.1.6-rc2',
  htmlFileName: 'index.html',
  htmlHeaders: [
    '<title>Calculator</title>',
    '<meta name="viewport" content="width=device-width, user-scalable=no">',
    '<meta name="mobile-web-app-capable" content="yes">',
    '<link rel="icon" sizes="32x32" href="icons/32.png">',
    '<link rel="icon" sizes="48x48" href="icons/48.png">',
    '<link rel="icon" sizes="64x64" href="icons/64.png">',
    '<link rel="icon" sizes="96x96" href="icons/96.png">',
    '<link rel="icon" sizes="128x128" href="icons/128.png">',
    '<link rel="icon" sizes="256x256" href="icons/256.png">',
    '<meta charset="utf-8">'
  ],

  resources: [
    'icons/32.png',
    'icons/48.png',
    'icons/64.png',
    'icons/96.png',
    'icons/128.png',
    'icons/256.png',
  ],
  coreFiles: [
    'stdlib',
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
    'value',
    'view',
    '../js/foam/ui/FoamTagView',
    '../js/foam/grammars/CSSDecl',
    'HTMLParser',
    'visitor',
    'dao',
    'arrayDAO',
    '../js/foam/ui/Window'
  ],
  extraFiles: [
    '../apps/acalc/Calc'
  ]
});
