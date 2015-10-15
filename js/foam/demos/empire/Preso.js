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
  extends: 'foam.flow.Section',

  constants: { ELEMENT_NAME: 'foam-demos-flow' },

  requires: [
    'com.google.sweeper.Game',
    'foam.demos.InterpolatedClocks',
    'foam.demos.graphics.Dragon',
    'foam.demos.graphics.EyeCView',
    'foam.demos.physics.Bubbles',
    'foam.demos.physics.Baloons',
    'foam.demos.physics.Collision',
    'foam.demos.physics.CollisionWithSpring',
    'foam.demos.physics.Spring',
    'foam.demos.wat.Grid',
    'foam.demos.wat.Slides',
    'foam.documentation.diagram.DocDiagramView',
    'foam.documentation.diagram.DocModelDiagramView',
    'foam.flow.CodeSample',
    'foam.flow.Section',
    'foam.graphics.Circle',
    'foam.graphics.Gauge',
    'foam.input.touch.GestureManager',
    'foam.input.touch.TouchManager',
    'foam.ui.AlternateView',
    'foam.ui.JSView',
    'foam.ui.SwipeAltView',
    'foam.ui.TableView',
    'foam.ui.ViewChoice',
    'foam.ui.md.SlideStyles',
    'foam.ui.md.TwoPaneView',
    'foam.util.Timer',
    'foam.memento.FragmentMementoMgr'
  ],

  imports: [
    'FOAMWindow'
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

      // Ensure that SlideStyles CSS gets installed.
      this.SlideStyles.create();

      this.X.registerModel(this.Slides, 'foam.flow.Slides');
      this.X.registerModel(this.Grid, 'foam.flow.Grid');

      this.X.registerElement('circle', 'foam.graphics.Circle');
      this.Slides.getProperty('installCSS').documentInstallFn.call(
        this.Slides.getPrototype(), this.X);
      this.Slides.getProperty('registerElement').documentInstallFn.call(
        this.Slides.getPrototype(), this.X);

      this.CodeSample.getProperty('installCSS').documentInstallFn.call(
        this.CodeSample.getPrototype(), this.X);
      this.CodeSample.getProperty('registerElement').documentInstallFn.call(
        this.CodeSample.getPrototype(), this.X);

      this.Section.getProperty('installCSS').documentInstallFn.call(
        this.Section.getPrototype(), this.X);
      this.Section.getProperty('registerElement').documentInstallFn.call(
        this.Section.getPrototype(), this.X);
    }
  },

  templates: [
    function CSS() {/*
     body {
        overflow: hidden;
     }
     slides > deck {
        font-size: 200%;
        padding-left: 16px;
      }
      body slides deck,
      body slides deck grid .grid-card .card-inset {
        display: block;
      }
      slides .card-grid .card .card-inset {
        padding-left: 16px;
      }
      h1, foam-components .heading-card .small-heading {
        color: blue;
        font-size: 54px;
      }
      foam-components .heading-card {
        min-height: initial;
      }
      foam-components .small-heading {
        display: block;
        -webkit-margin-before: 0.67em;
        -webkit-margin-after: 0.67em;
        -webkit-margin-start: 0px;
        -webkit-margin-end: 0px;
        font-weight: bold;
        border: 0;
        margin: 0;
        padding: 0;
      }
      foam-components .card, foam-components .heading-card {
        -webkit-animation: none;
        transform: none;
        box-shadow: initial;
        border-radius: initial;
      }
      foam-components .small-color-block {
        display: none;
      }
      foam-components .card,
      foam-components .heading-card,
      foam-components .flex-row {
        margin: 0;
        padding: 0;
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
      code-view {
        font-size: 28px;
      }
      .sweeper-models canvas { vertical-align: top; }
      li.d1 { margin-left: 16px; font-size: 30px; }
      li.d2 { margin-left: 32px; font-size: 28px; }
      li.d3 { margin-left: 48px; font-size: 26px; }
      li.d4 { margin-left: 64px; font-size: 24px; }

      .pln { color: #000 }
      .str,
      .atv { color: #0f9d58 }
      .kwd,
      .tag { color: #4285f4;  }
      .com { color: #999 }
      .typ,
      .var { color: #673ab7 }
      .lit { color: #db4437 }
      .pun,
      .opn,
      .clo { color: #a3a3a3 }
      .atn { color: #e91e63 }
      .dec,
      .var { color: #e67c73 }
      .fun { color: #fff }
    */},
    { name: 'toHTML' }
  ]
});
