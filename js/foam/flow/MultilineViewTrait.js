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
      type: 'Boolean',
      name: 'scroll',
      defaultValue: true
    },
    {
      type: 'Int',
      name: 'minLines',
      defaultValue: 4
    },
    {
      type: 'Int',
      name: 'maxLines',
      defaultValue: 8
    },
    {
      type: 'Int',
      name: 'readOnlyMinLines',
      defaultValue: 4
    },
    {
      type: 'Int',
      name: 'readOnlyMaxLines',
      defaultValue: 8
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        Events.dynamicFn(function() {
          this.scroll; this.$;
          this.$.style['overflow'] = this.scroll ? 'auto' : 'initial';
        }.bind(this));
        Events.dynamicFn(function() {
          this.mode; this.scroll; this.minLines; this.readOnlyMinLines; this.$;
          if ( ! this.$ ) return;
          this.$.style['min-height'] = this.scroll ?
              (this.mode === 'read-only' ? this.readOnlyMinLines + 'em' :
              this.minLines + 'em') : 'initial';
        }.bind(this));
        Events.dynamicFn(function() {
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
