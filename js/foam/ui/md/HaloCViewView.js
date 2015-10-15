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
  package: 'foam.ui.md',
  name: 'HaloCViewView',
  extends: 'foam.graphics.AbstractCViewView',

  properties: [
    {
      name: 'cview',
      postSet: function(_, cview) {
        cview.view = this;
        cview.x = 0;
        cview.y = 0;
        this.resize();
      }
    },
  ],

  methods: [
    function initHTML() {
      this.SUPER();
      this.$ && this.$.addEventListener('mousedown', this.resize);
    },
  ],

  listeners: [
    {
      name: 'resize',
      framed: true,
      code: function() {
        if ( ( ! this.$ ) ||
            ( ! this.$.clientWidth ) ||
            ( ! this.$.clientHeight ) ) return;
        this.width = this.$.clientWidth;
        this.height = this.$.clientHeight;
        this.$.width = this.canvasWidth();   // tell the DOM to update its style settings
        this.$.height = this.canvasHeight(); // otherwise scaling happens
        if ( ! this.cview ) return;
        this.cview.width   = this.width;
        this.cview.height  = this.height;
        this.paint();
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <canvas id="%%id"
              <%= this.className ? 'class="' + this.className +'"' : '' %>
              style="width: 100%; height: 100%"></canvas>
    */},
  ],
});
