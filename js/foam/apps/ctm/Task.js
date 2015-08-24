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
      defaultValue: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACkUlEQVR4AWWTTYhbRRzAfzPzPkzNNmUTbcm6yDauVVrYQlrQelj2IHiwgkfxoNKLlz3YIi14qh8H9SCCB/Ek6OLZiyc/ghUFPypSpFh7sGYbS2PWbLLm482b+duBEIL5PX4zzMDvzZvDUzCPgLp17sV7ssG4mFgrXrt+9YNPOoDwP9Tszu+bT6TxbXPOZ3ZTKQ4hgoiA94hyLbx5t9vafQewTFA/1usAqKW0ui8pfZYq1kIAhHD6AgizkDu+s270JLADoO8qx7x5/nDirWr43K75EABMZmB2jdH+0TSKP22P0+iOhIFmd+Hiz5XC6sldh3GQaANJiq6tZvmS6WTXf7FkvVzlRuJIJPIcrMX+AvC6QlAPfPRC+0hrWD7faLIYRxSPHufvZy5waXsBL7BR67H816ukgysksaBjDbibwH2qvnW2siO9NsCzl7Z56pbFvLbFG18sYB0IYBRcPN3lWOcMmgw0oAVcWtLRvrjoEYKfH6tgH3qYr5vFaYyAdcKX1/bjS2uo1KBijTIa4rwYAXgRFNA6kPBtsogWprEQnKD8zErAZ6L7WdYTEfzEj+VP99jKaGwU071Iw6n7B+NodJVpLAJjt6cQ1KEPn9vWRlWZcLK8ytnaGX66fjcA9ZU+5e7b7mjhigEhaHP5A1hR2fcbLP9afVnp6C1mKOiEE5XD+NxRuX2Z94/3QMn0dOf9JvCeyn9YJ7p8JD5o9hpE0SkQmL3pP/9y9ZEB5dRO40ykkfTlcSDXZg/kwd/sULLTuc+/EcBP/gGXZbyyNJ6PjTzNAfI7osMQ3D3R3uncuLmRO/9Sbu0Nj1AcWZ5fGQ8RT7hz+OxwMl3CQ1DJV+vAPIvX7i2t79eVreXmsAB9CM7zH+STX2CZEVcOAAAAAElFTkSuQmCC',
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
      code: function() {
        // TODO(markdittmer): Implement this.
        console.log('Open process', this.id);
      }
    },
    {
      name: 'kill',
      label: 'delete',
      code: function() {
        // TODO(markdittmer): Implement this.
        console.log('Kill process', this.id);
      }
    },
  ]
});
