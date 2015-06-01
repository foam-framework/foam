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
  name: 'Task',
  package: 'foam.apps.ctm',

  requires: [
    // TODO(markdittmer): This has no business being in a data model.
    'foam.graphics.HTMLGraph'
  ],

  tableProperties: [
    // 'iconUrl',
    'name',
    'memory',
    'cpu',
    'network',
    'processId'
  ],

  properties: [
    {
      model_: 'IntProperty',
      name: 'id',
      hidden: true
    },
    {
      model_: 'StringProperty',
      name: 'iconUrl',
      label: '',
      view: 'foam.ui.ImageView',
      defaultValue: 'https://www.gstatic.com/images/icons/material/product/1x/chrome_16dp.png',
      hidden: true
    },
    {
      model_: 'StringProperty',
      name: 'name',
      label: 'Task',
      tableFormatter: function(name, obj) {
        return '<img src="' + obj.iconUrl + '"><span>' + name + '</span>';
      }
    },
    {
      model_: 'FloatProperty',
      name: 'memory',
      units: 'MB',
      tableFormatter: function(v, obj) {
        return obj.graphHTML(
            obj.memoryHistory,
            0, 2000,
            'red',
            (Math.round(v * 100) / 100) + this.units);
      },
      postSet: function() { this.storeHistory_.apply(this, arguments); }
    },
    {
      model_: 'FloatProperty',
      name: 'cpu',
      label: 'CPU',
      units: '%',
      tableFormatter: function(v, obj) {
        return obj.graphHTML(
            obj.cpuHistory,
            0, 100,
            'blue',
            (Math.round(v * 100) / 100) + this.units);
      },
      postSet: function() { this.storeHistory_.apply(this, arguments); }
    },
    {
      model_: 'FloatProperty',
      name: 'network',
      units: 'B/s',
      tableFormatter: function(v, obj) {
        return obj.graphHTML(
            obj.networkHistory,
            0, 1000,
            'green',
            (Math.round(v * 100) / 100) + this.units);
      },
      postSet: function() { this.storeHistory_.apply(this, arguments); }
    },
    {
      model_: 'IntProperty',
      name: 'processId',
      label: 'Process ID'
    },
    // TODO(markdittmer): This should be abstracted to a decorator.
    {
      model_: 'ArrayProperty',
      name: 'memoryHistory',
      hidden: true
    },
    {
      model_: 'ArrayProperty',
      name: 'cpuHistory',
      hidden: true
    },
    {
      model_: 'ArrayProperty',
      name: 'networkHistory',
      hidden: true
    },
    {
      model_: 'IntProperty',
      name: 'numHistoryItems',
      hidden: true,
      defaultValue: 64
    }
  ],

  actions: [
    {
      name: 'kill',
      label: 'End Process',
      action: function() {
        // TODO(markdittmer): Implement this.
        console.log('Kill process', this.id);
      }
    },
    {
      name: 'open',
      action: function() {
        // TODO(markdittmer): Implement this.
        console.log('Open process', this.id);
      }
    }
  ],

  methods: [
    function graphHTML(graphData, graphMin, graphMax, graphColor, dataText) {
      return '<div style="display: flex; align-items: stretch; align-content: stretch"><div style="width: 40%">' +
          dataText + '</div>' +
          this.HTMLGraph.create({
            data: graphData,
            min: graphMin,
            max: graphMax,
            width: this.numHistoryItems,
            graphColor: graphColor
          }).toHTML() +
              '</div>';
    },
    function storeHistory_(old, nu, prop) {
      var data = this[prop.name + 'History'];
      if ( data.length === this.numHistoryItems ) data.shift();
      data.push(nu);
    }
  ]
});
