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
    'Timer',
    'com.google.sweeper.Game',
    'foam.demos.InterpolatedClocks',
    'foam.demos.graphics.Dragon',
    'foam.demos.graphics.EyeCView',
    'foam.demos.physics.Bubbles',
    'foam.demos.physics.Collision',
    'foam.demos.physics.CollisionWithSpring',
    'foam.demos.physics.Spring',
    'foam.documentation.diagram.DocDiagramView',
    'foam.flow.CodeSample',
    'foam.flow.CodeSample',
    'foam.flow.Slides',
    'foam.graphics.Circle',
    'foam.graphics.Gauge',
    'foam.input.touch.GestureManager',
    'foam.input.touch.TouchManager',
    'foam.ui.AlternateView',
    'foam.ui.JSView',
    'foam.ui.SwipeAltView',
    'foam.ui.TableView',
    'foam.ui.ViewChoice',
    'foam.ui.md.TwoPaneView'
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
      li.d1 { margin-left: 16px; font-size: 30px;}
      li.d2 { margin-left: 32px; font-size: 28px; }
      li.d3 { margin-left: 48px; font-size: 26px; }
      li.d4 { margin-left: 64px; font-size: 24px; }
    */},
    { name: 'toHTML' }
  ]
});
