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
  package: 'foam.apps.ctm',
  name: 'TaskHistoryGraph',
  extends: 'foam.ui.SimpleView',

  requires: [ 'foam.graphics.Graph' ],
  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( nu ) this.graph.data = nu;
        else      this.graph.data = [].sink;
      }
    },
    {
      // type: 'foam.apps.ctm.TaskManager',
      name: 'taskManager'
    },
    {
      name:  'width',
      defaultValue: 100
    },
    {
      name:  'height',
      defaultValue: 50
    },
    {
      name:  'maxValue',
      defaultValue: -1
    },
    {
      // type: 'foam.graphics.Graph',
      name: 'graph',
      lazyFactory: function() {
        return this.Graph.create({
          width: this.width,
          height: this.height,
          maxValue: this.maxValue,
          graphColor: 'lightgray',
          axisColor: 'rgb(137,137,137)',
          axisSize: 1
        });
      }
    }
  ],

  templates: [
    function toHTML() {/* %%graph */}
  ]
});
