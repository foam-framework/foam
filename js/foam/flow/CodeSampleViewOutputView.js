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

  constants: { ELEMENT_NAME: 'view-output' },

  properties: [
    {
      model_: 'StringProperty',
      name: 'data',
      postSet: function(old, nu) {
        if ( ! this.$ || old === nu ) return;
        this.$.innerHTML = nu;
      }
    },
    {
      name: 'state',
      documentation: function() {/* Either "hold" or "release". Used to control
        accumulation of updates (hold state), and showing of updates (release
        state). */},
      defaultValue: 'release',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        // Upon release, update innerHTML.
        if ( nu === 'release' ) {
          this.initHTML_();
        }
      }
    }
  ],

  methods: [
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
        DOM.initElementChildren(this.$, this.X);
        this.$.className = this.data.innerHTML.trim().length > 0 ? 'visible' : '';
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*<%= this.data.innerHTML %>*/},
    function CSS() {/*
      view-output {
        display: block;
        position: relative;
        background: #F5F5F5;
      }
      view-output.visible {
        padding-top: 5px;
      }
      view-output.visible::after {
        bottom: -4px;
        content: '';
        height: 4px;
        left: 0;
        position: absolute;
        right: 0;
        background-image: -webkit-linear-gradient(top,rgba(0,0,0,.12) 0%,rgba(0,0,0,0) 100%);
        background-image: linear-gradient(to bottom,rgba(0,0,0,.12) 0%,rgba(0,0,0,0) 100%);
      }
    */}
  ]
});
