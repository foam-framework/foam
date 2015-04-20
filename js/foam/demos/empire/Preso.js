/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.demos.empire',
  name: 'Preso',
  extendsModel: 'foam.flow.Section',

  constants: { ELEMENT_NAME: 'foam-demos-flow' },

  requires: [
    'foam.demos.physics.Collision',
    'foam.demos.physics.CollisionWithSpring',
    'foam.demos.physics.Spring',
    'foam.demos.physics.Bubbles',
    'foam.graphics.Circle',
    'foam.graphics.Gauge',
    'foam.flow.CodeSample',
    'foam.flow.Slides',
    'Timer',
    'foam.demos.graphics.Dragon',
    'foam.ui.md.TwoPaneView',
    'foam.ui.SwipeAltView',
    'foam.ui.ViewChoice',
    'foam.demos.InterpolatedClocks',
    'foam.demos.graphics.EyeCView',
    'foam.input.touch.GestureManager',
    'foam.input.touch.TouchManager'
  ],

  exports: [
    'gestureManager',
    'touchManager'
  ],

  properties: [
    {
      name: 'gestureManager',
      factory: function() {
        var gm = this.GestureManager.create();
        window.X.gestureManager = gm;
        return gm;
      }
    },
    {
      name: 'touchManager',
      factory: function() {
        // TODO(braden): HACK This should be just exporting the property, but
        // the context is not properly passed into views created using <foam>
        // tags right now. Clean up this and gestureManager below.
        var tm = this.TouchManager.create();
        window.X.touchManager = tm;
        return tm;
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER.apply(this, arguments);
      this.X.registerElement('circle', 'foam.graphics.Circle');
    }
  },

  templates: [
    function CSS() {/*
     slides {
        display: flex;
        flex-direction: column;
      }
      slides > deck {
        font-size: 200%;
        padding-left: 16px;
        overflow: hidden;
      }
      h1 {
        color: blue;
        font-size: 54px;
        margin-top: 16px;
        margin-bottom: 16px;
      }
      slides .twopane-left {
        width: 450px;
        height: 85%;
      }
      slides .twopane-right {
        background: white;
        padding-left: 100px;
      }
      .SlidePanel > div {
        margin-left: -16px;
        height: 100%;
      }
      .swipeAltOuter {
        height: 100%;
      }
    */},
    { name: 'toHTML' }
  ]
});
