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
  name: 'CodeSampleViewOutputView',
  package: 'foam.flow',
  extendsModel: 'foam.flow.Element',

  requires: [ 'foam.ui.ActionButton' ],
  imports: [ 'sampleCodeContext$' ],

  constants: { ELEMENT_NAME: 'view-output' },

  properties: [
    {
      name: 'sampleCodeContext'
    },
    {
      model_: 'StringProperty',
      name: 'data',
      postSet: function(old, nu) {
        if ( ! this.$ || old === nu ) return;
        this.$.innerHTML = nu;
      }
    },
    {
      name: 'height',
      defaultValue: 200
    },
    {
      name: 'state',
      documentation: function() {/* Either "hold" or "release". Used to control
        accumulation of updates (hold state), and showing of updates (release
        state). */},
      defaultValue: 'release'
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER.apply(this, arguments);
        Events.dynamic(function() {
          this.data && this.data.innerHTML; this.$; this.state;
          if ( ! this.$ || ! this.data || this.state !== 'release' ) return;
          this.initHTML_();
        }.bind(this));
      }
    },
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        this.initHTML_();
      }
    },
    {
      name: 'initHTML_',
      code: function() {
        if ( ! this.$ ) return;
        this.$.innerHTML = this.data.innerHTML;
        DOM.initElementChildren(this.$, this.sampleCodeContext);
        this.$.style.height = this.height + 'px';
        this.$.className = this.height > 0 ? 'visible' : '';
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*<%= this.data.innerHTML %>*/},
    function CSS() {/*
      view-output {
        position: relative;
        background: #F5F5F5;
        overflow: auto;
        display: flex;
        justify-content: center;
        flex-direction: column;
      }
      view-output.visible {
        padding: 5px;
      }
    */}
  ]
});
