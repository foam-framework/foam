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
  name: 'Preso2',
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
      this.Slides.getProperty('registerElement').documentInstallFn.call(
          this.Slides.getPrototype(), this.X);
    }
  },

  templates: [
    { name: 'toHTML' },
    // (1) Undo font scaling from foam-components styles.
    // (2) Reposition pong component scores within flex container.
    // (3) Code formatting.
    // (4) Two-pane controller styling.
    // (4) Summary list element element styling.
    function CSS() {/*
      html, body { margin: 0; padding: 0; }
      slides deck { position: relative; }
      foam-components { font-size: 100%; }
      #pong-container div { display: flex; }
      #pong-container span[name="lScore"] { left: 390px; top:20px; z-index: 2; }
      #pong-container span[name="rScore"] { left: 490px; top:20px; z-index: 2; }
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
      .twopane-container { height: 100%; width: 100%; }
      slides .twopane-left {
        min-width: 450px;
        max-width: 40%;
        height: 85%;
      }
      slides .twopane-right {
        background: white;
      }
      li { padding-bottom: 2px; }
      li.d1 { margin-left: 16px; font-size: 30px; }
      li.d2 { margin-left: 32px; font-size: 28px; }
      li.d3 { margin-left: 48px; font-size: 26px; }
      li.d4 { margin-left: 64px; font-size: 24px; }
      .scale05 { transform: scale(0.5); }
      .scale085 { transform: scale(0.85); }
      .scale12 { transform: scale(1.2); }
      .scale15 { transform: scale(1.5); }
      .origin0 { transform-origin: 0 0; }
      .shadow0515 { box-shadow: 0 5px 15px rgba(0,0,0,0.33); }
      .flex-grow1 { flex-grow: 1; }
      .flex-grow3 { flex-grow: 3; }
    */}
  ]
});
