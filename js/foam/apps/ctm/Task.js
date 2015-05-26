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
        return '<img src="' + obj.iconUrl + '">' + name;
      }
    },
    {
      model_: 'FloatProperty',
      name: 'memory',
      units: 'MB',
      tableFormatter: function(v) {
        return (Math.round(v * 100) / 100) + this.units;
      }
    },
    {
      model_: 'FloatProperty',
      name: 'cpu',
      label: 'CPU',
      units: '%',
      tableFormatter: function(v) {
        return (Math.round(v * 100) / 100) + this.units;
      }
    },
    {
      model_: 'FloatProperty',
      name: 'network',
      units: 'B/s',
      tableFormatter: function(v) {
        return (Math.round(v * 100) / 100) + ' ' + this.units;
      }
    },
    {
      model_: 'IntProperty',
      name: 'processId',
      label: 'Process ID'
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
  ]
});
