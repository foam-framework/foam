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

CLASS({
  name: 'CodeSampleOutput',
  package: 'foam.flow',

  requires: [
    'foam.flow.CodeSampleViewOutput',
    'foam.flow.CodeSampleViewOutputView',
    'foam.flow.VirtualConsole',
    'foam.flow.VirtualConsoleView'
  ],

  properties: [
    {
      name: 'viewOutput',
      // type: 'foam.flow.CodeSampleViewOutput',
      factory: function() { return this.CodeSampleViewOutput.create(); },
      view: 'foam.flow.CodeSampleViewOutputView'
    },
    {
      name: 'virtualConsole',
      // type: 'foam.flow.VirtualConsole',
      factory: function() { return this.VirtualConsole.create(); },
      view: 'foam.flow.VirtualConsoleView'
    }
  ]
});
