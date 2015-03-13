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
  extendsModel: 'foam.flow.Element',
  traits: [ 'foam.flow.MultilineViewTrait' ],

  requires: [ 'foam.ui.md.Flare' ],

  constants: { ELEMENT_NAME: 'virtual-console' },

  properties: [
    {
      name: 'data',
      type: 'foam.flow.VirtualConsole',
      required: true
    },
    {
      name: 'flare',
      type: 'foam.ui.md.Flare',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) old.state$.removeListener(this.onFlareStateChange);
        if ( nu ) nu.state$.addListener(this.onFlareStateChange);
      }
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        // Setup flare that will be fired by this.reset() action.
        this.flare = this.Flare.create({
          element: this.$,
          color: 'rgb(241, 250, 65)',
          cssPosition: 'absolute',
          startX: 0.9,
          startY: 0.0,
          fadeTime: 600
        });

        // Change this.$ CSS class when flare enters or leaves detached state.
        //
        // TODO(markdittmer): We should be using this.setClass() here, but
        // it's not working right now.
        Events.dynamic(function() {
          this.flare && this.flare.state; this.$;
          if ( ! this.$ || ! this.data ) return;
          if ( this.flare.state === 'detached' ) {
            if ( this.$.className !== '' ) this.$.className = '';
          } else {
            if ( this.$.className !== 'animating' ) this.$.className = 'animating';
          }
        }.bind(this));
      }
    }
  ],

  actions: [
    {
      name: 'reset',
      action: function() { this.flare && this.flare.fire(); }
    }
  ],

  listeners: [
    {
      name: 'onFlareStateChange',
      documentation: function() {/* When flare transitions from the "growing"
        to the "fading" state, it is time to clear the console from the last
        run, and fill in the console from the latest run. This is achieved by
        delaying puts to the console DAO during the "growing" state, then
        clearing the console and releasing delayed puts when entering the
        "fading" state.
      */},
      code: function(_, __, ___, newState) {
        if ( ! this.data ) return;
        if ( newState === 'fading' ) {
          this.data.clear();
        }
        this.data.delayPuts = this.flare ? (this.flare.state === 'growing') : false;
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
        position: relative;
        padding-top: 5px;
        min-height: 4em;
        max-height: 8em;
        font: 12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
        overflow: auto;
      }
      virtual-console.animating {
        overflow: hidden;
      }
    */}
  ]
});
