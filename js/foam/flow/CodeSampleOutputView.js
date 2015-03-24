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
  name: 'CodeSampleOutputView',
  package: 'foam.flow',
  extendsModel: 'foam.flow.Element',

  requires: [
    'foam.flow.CodeSampleOutput',
    'foam.ui.md.Flare'
  ],

  constants: { ELEMENT_NAME: 'code-sample-output' },

  properties: [
    {
      name: 'data',
      type: 'foam.flow.CodeSampleOutput',
      required: true
    },
    {
      name: 'flare',
      type: 'foam.ui.md.Flare',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) old.flareState$.removeListener(this.onFlareStateChange);
        if ( nu ) nu.flareState$.addListener(this.onFlareStateChange);
      }
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        var ret = this.SUPER.apply(this, arguments);
        return ret;
      }
    },
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        // Setup flare that will be fired by this.reset() action.
        this.flare = this.Flare.create({
          element: this.$,
          color: 'rgb(240,147,0)',
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
          this.flare && this.flare.flareState;
          this.virtualConsoleView;
          var vc = this.virtualConsoleView;
          if ( ! vc.$ || ! vc.data ) return;
          if ( this.flare.flareState === 'detached' ) {
            if ( vc.$.className !== '' ) this.$.className = '';
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
      action: function() {
        this.flare && this.flare.fire();
        // TODO(markdittmer): If there is no flare, we need to publish events
        // that will simulate the flare (or similar) for our children's sake.
      }
    }
  ],

  listeners: [
    {
      name: 'onFlareStateChange',
      code: function(_, __, ___, newState) {
        if ( newState === 'growing' ) {
          this.viewOutputView.state = this.virtualConsoleView.state = 'hold';
        } else {
          this.viewOutputView.state = this.virtualConsoleView.state = 'release';
        }

        // TODO(markdittmer): We should be using this.setClass() here, but
        // it's not working right now.
        if ( ! this.$ ) return;
        if ( newState === 'detached' ) {
          if ( this.$.className !== '' ) this.$.className = '';
        } else {
          if ( this.$.className !== 'animating' ) this.$.className = 'animating';
        }
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*
      $$viewOutput
      $$virtualConsole{
        minLines: 8,
        maxLines: 8
      }
    */},
    function CSS() {/*
      code-sample-output {
        display: block;
        position: relative;
      }
      code-sample-output.animating {
        overflow: hidden;
      }
    */}
  ]
});
