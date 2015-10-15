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
  package: 'foam.demos.wat',
  name: 'BecomingAGoogler',
  extends: 'foam.flow.Section',

  constants: { ELEMENT_NAME: 'foam-demos-flow' },

  requires: [
    'Timer',
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

      this.Slides.getProperty('registerElement').documentInstallFn.call(
        this.Slides.getPrototype(), this.X);
    }
  },

  templates: [
    { name: 'toHTML' }
  ]
});
