/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  package: 'foam.graphics',
  name: 'DOMSizedCViewView',

  extendsModel: 'foam.graphics.AbstractCViewView',

  help: 'DOM wrapper for a CView that takes its DOM sizing and applies it to the child CView.',

  documentation: function() {/*
    DOM wrapper for a $$DOC{ref:'foam.graphics.CView'} that takes its DOM sizing and
    applies it to the child CView.
  */},

  properties: [
    {
      name: 'cview',
      postSet: function(_, cview) {
        cview.view = this;
        cview.x = 0;
        cview.y = 0;
        this.resize();
      }
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.X.dynamic(function() { this.width; this.height; }.bind(this),
                     this.resize);
    },
    toHTML: function() {
      var className = this.className ? ' class="' + this.className + '"' : '';
      return '<canvas id="' + this.id + '"' + className + ' style="width: 100%; height: 100%"></canvas>';
    },
    initHTML: function() {
      this.SUPER();
      this.resize();
      //this.X.setTimeout(this.resize, 500);
    }
  },
  listeners: [
    {
      name: 'resize',
      isFramed: true,
      code: function() {
        if ( ! this.$ ) return;
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
  ]
});
