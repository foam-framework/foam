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
  name: 'PositionedCViewView',
  extends: 'foam.graphics.AbstractCViewView',
  traits: ['foam.ui.layout.PositionedDOMViewTrait'],
  properties: [
    {
      name: 'tagName',
      factory: function() { return 'canvas'; }
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.X.dynamicFn(function() {
        this.cview; this.width; this.height;
      }.bind(this), function() {
        if ( ! this.cview ) return;
        this.cview.width  = this.width;
        this.cview.height = this.height;
      }.bind(this));
    },
    toHTML: function() {
      var className = this.className ? ' class="' + this.className + '"' : '';
      return '<canvas id="' + this.id + '"' + className + ' width="' + this.canvasWidth() + '" height="' + this.canvasHeight() + '" ' + this.layoutStyle() + '></canvas>';
    }
  },
  listeners: [
    {
      name: 'resize',
      isFramed: true,
      code: function() {
        if ( ! this.$ ) return;
        this.$.width        = this.canvasWidth();
        this.$.style.width  = this.styleWidth();
        this.$.height       = this.canvasHeight();
        this.$.style.height = this.styleHeight();
        this.cview.width    = this.width;
        this.cview.height   = this.height;
        this.paint();
      }
    }
  ]
});
