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
  name: 'History',
  package: 'foam.apps.ctm',

  imports: [ 'timer' ],

  properties: [
    'timer',
    'data',
    {
      name: 'property',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) old.removeListener(this.onUpdate);
        if ( nu ) nu.addListener(this.onUpdate);
      }
    },
    {
      model_: 'IntProperty',
      name: 'numItems',
      defaultValue: 64
    },
    {
      model_: 'ArrayProperty',
      name: 'history',
      factory: function() { return [].sink; },
      preSet: function(_, nu) { return nu ? nu.sink : nu; }
    }
  ],

  listeners: [
    {
      name: 'onUpdate',
      code: function() {
        var value = this.data[this.property.name];
        if ( this.history.length === this.numItems ) this.history.shift();
        this.history.put(value);
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER.apply(this, arguments);
      this.timer.second$.addListener(this.onUpdate);
    }
  ]
});
