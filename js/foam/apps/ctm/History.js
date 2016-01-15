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
  name: 'History',

  imports: [ 'clock$' ],

  properties: [
    {
      name: 'data',
    },
    {
      name: 'property',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) old.removeListener(this.tick);
        if ( nu ) nu.addListener(this.tick);
      }
    },
    {
      type: 'Int',
      name: 'numItems',
      defaultValue: 64
    },
    {
      type: 'Array',
      name: 'history',
      factory: function() { return [].sink; },
      preSet: function(_, nu) { return nu ? nu.sink : nu; }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.clock$.addListener(this.tick);
    }
  ],

  listeners: [
    {
      name: 'tick',
      code: function() {
        var value = this.data[this.property.name];
        if ( this.history.length === this.numItems ) this.history.shift();
        this.history.put(value);
      }
    }
  ]
});
