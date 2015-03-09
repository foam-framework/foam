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
  name: 'MultilineViewTrait',
  package: 'foam.flow',

properties: [
    {
      model_: 'IntProperty',
      name: 'minLines',
      defaultValue: 4
    },
    {
      model_: 'IntProperty',
      name: 'maxLines',
      defaultValue: 8
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        Events.dynamic(function() {
          this.minLines; this.$; if ( ! this.$ ) return;
          this.$.style['min-height'] = this.minLines + 'em';
        }.bind(this));
        Events.dynamic(function() {
          this.maxLines; this.$; if ( ! this.$ ) return;
          this.$.style['max-height'] = this.maxLines + 'em';
        }.bind(this));
      }
    }
  ]
});
