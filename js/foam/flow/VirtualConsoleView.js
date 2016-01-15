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
  name: 'VirtualConsoleView',
  package: 'foam.flow',
  extends: 'foam.flow.Element',

  traits: [ 'foam.flow.MultilineViewTrait' ],

  constants: { ELEMENT_NAME: 'virtual-console' },

  properties: [
    {
      name: 'data',
      // type: 'foam.flow.VirtualConsole',
      required: true
    },
    {
      name: 'state',
      documentation: function() {/* Either "hold" or "release". Used to control
        accumulation of updates (hold state), and showing of updates (release
        state). */},
      defaultValue: 'release',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        // Upon release, clear the console before showing updates.
        if ( nu === 'release' ) this.data.clear();
        // Delay data DAO puts in hold state.
        this.data.delayPuts = nu === 'hold';
      }
    },
    {
      type: 'Boolean',
      name: 'scrollable',
      defaultValue: true
    }
  ],

  methods: [
    function initHTML() { this.setScrollableCSS_(); }
  ],

  listeners: [
    function setScrollableCSS_() {
      if ( ! this.$ ) return;
      
      var style = this.$.style;
      if ( this.scrollable ) {
        style.overflow = 'auto';
      } else {
        style['max-height'] = 'initial';
        style.overflow = 'initial';
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*
      $$console_
    */},
    function CSS() {/*
      virtual-console {
        display: block;
        padding-top: 5px;
        min-height: 4em;
        max-height: 8em;
        font: 12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
        overflow: auto;
        background: #E0E0E0;
      }
      virtual-console console-log {
        display: block;
      }
    */}
  ]
});
