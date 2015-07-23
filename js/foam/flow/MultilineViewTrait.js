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
      model_: 'BooleanProperty',
      name: 'scroll',
      defaultValue: true
    },
    {
      model_: 'IntProperty',
      name: 'minLines',
      defaultValue: 4
    },
    {
      model_: 'IntProperty',
      name: 'maxLines',
      defaultValue: 8
    },
    {
      model_: 'IntProperty',
      name: 'readOnlyMinLines',
      defaultValue: 4
    },
    {
      model_: 'IntProperty',
      name: 'readOnlyMaxLines',
      defaultValue: 8
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        Events.dynamic(function() {
          this.scroll; this.$;
          this.$.style['overflow'] = this.scroll ? 'auto' : 'initial';
        }.bind(this));
        Events.dynamic(function() {
          this.mode; this.scroll; this.minLines; this.readOnlyMinLines; this.$;
          if ( ! this.$ ) return;
          this.$.style['min-height'] = this.scroll ?
              (this.mode === 'read-only' ? this.readOnlyMinLines + 'em' :
              this.minLines + 'em') : 'initial';
        }.bind(this));
        Events.dynamic(function() {
          this.mode; this.scroll; this.maxLines; this.readOnlyMaxLines; this.$;
          if ( ! this.$ ) return;
          this.$.style['max-height'] = this.scroll ?
              (this.mode === 'read-only' ? this.readOnlyMaxLines + 'em' :
              this.maxLines + 'em') : 'initial';
        }.bind(this));
      }
    }
  ]
});
