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
  id: 'foam.apps.calc.ChromeApp',
  controller: 'foam.apps.calc.Calc',
  defaultView: 'foam.apps.calc.CalcView',
  precompileTemplates: true,
  version: '2.1.6-rc2',
  htmlFileName: 'AppCalc.html',
  htmlHeaders: [
    '<title>Calculator</title>',
    '<meta charset="utf-8">'
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
    '../js/foam/ui/AbstractDAOView',
    '../js/foam/ui/DAOListView',
    '../js/foam/ui/DetailView',
    '../js/foam/grammars/CSSDecl',
    'HTMLParser',
    'visitor',
    'dao',
    'arrayDAO',
    '../js/foam/ui/Window',
    '../js/foam/i18n/IdGenerator',
    '../js/foam/i18n/Visitor',
    '../js/foam/i18n/MessagesExtractor',
    '../js/foam/i18n/ChromeMessagesInjector',
    '../js/foam/i18n/GlobalController',
  ],
  extraModels: [
    'foam.ui.FoamTagView'
  ]
});
