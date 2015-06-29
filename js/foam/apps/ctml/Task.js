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
  package: 'foam.apps.ctml',
  name: 'Task',

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
      aliases: ['t', 'task'],
      label: 'Task',
      tableFormatter: function(name, obj) {
        return '<img src="' + obj.iconUrl + '"><span>' + name + '</span>';
      }
    },
    {
      model_: 'FloatProperty',
      name: 'memory',
      aliases: ['m', 'mem', 'mb'],
      units: 'MB',
      tableFormatter: function(v, obj) {
        return (Math.round(v * 100) / 100) + this.units;
      }
    },
    {
      model_: 'FloatProperty',
      name: 'cpu',
      aliases: ['c'],
      label: 'CPU',
      units: '%',
      tableFormatter: function(v, obj) {
        return (Math.round(v * 100) / 100) + this.units;
      }
    },
    {
      model_: 'FloatProperty',
      name: 'network',
      aliases: ['n', 'net', 'b', 'bandwidth'],
      units: 'B/s',
      tableFormatter: function(v, obj) {
        return (Math.round(v * 100) / 100) + this.units;
      }
    },
    {
      model_: 'IntProperty',
      name: 'processId',
      aliases: ['p', 'pid', 'procid'],
      label: 'Process ID'
    }
  ],

  actions: [
    {
      name: 'open',
      label: 'open_in_browser',
      action: function() {
        // TODO(markdittmer): Implement this.
        console.log('Open process', this.id);
      }
    },
    {
      name: 'kill',
      label: 'delete',
      action: function() {
        // TODO(markdittmer): Implement this.
        console.log('Kill process', this.id);
      }
    },
  ]
});
