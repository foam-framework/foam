/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
  name: 'ScrollCView',

  extendsModel: 'foam.graphics.CView',

  properties: [
    {
      name: 'vertical',
      type: 'boolean',
      defaultValue: true
    },
    {
      model_: 'IntProperty',
      name: 'value',
      help: 'The first element being shown, starting at zero.',
      preSet: function(_, value) {
        return Math.max(0, Math.min(this.size-this.extent, value));
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.view && this.view.paint();
      },
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name: 'extent',
      help: 'Number of elements shown.',
      minValue: 1,
      defaultValue: 10,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.view && this.view.paint();
      }
    },
    {
      model_: 'IntProperty',
      name: 'size',
      defaultValue: 0,
      help: 'Total number of elements being scrolled through.',
      postSet: function(old, size) {
        if ( old === size ) return;
        this.value = this.value; // force range checking on value
        this.view && this.view.paint();
      }
    },
    {
      name: 'minHandleSize',
      type: 'int',
      defaultValue: 10,
      help: 'Minimum size to make the drag handle.'
    },
    {
      name: 'startY',
      type: 'int',
      defaultValue: 0
    },
    {
      name: 'startValue',
      help: 'Starting value or current drag operation.',
      type: 'int',
      defaultValue: 0
    },
    {
      name: 'handleColor',
      type: 'String',
      defaultValue: 'rgb(107,136,173)'
    },
    {
      name: 'borderColor',
      type: 'String',
      defaultValue: '#999'
    }
  ],

  listeners: [
    {
      name: 'mouseDown',
      code: function(e) {
      //       this.parent.$.addEventListener('mousemove', this.mouseMove, false);
      this.startY = e.y - e.offsetY;
      e.target.ownerDocument.defaultView.addEventListener('mouseup', this.mouseUp, true);
      e.target.ownerDocument.defaultView.addEventListener('mousemove', this.mouseMove, true);
      e.target.ownerDocument.defaultView.addEventListener('touchstart', this.touchstart, true);
      this.mouseMove(e);
      }
    },
    {
      name: 'mouseUp',
      code: function(e) {
      e.preventDefault();
      e.target.ownerDocument.defaultView.removeEventListener('mousemove', this.mouseMove, true);
      e.target.ownerDocument.defaultView.removeEventListener('mouseup', this.mouseUp, true);
      //       this.parent.$.removeEventListener('mousemove', this.mouseMove, false);
      }
    },
    {
      name: 'mouseMove',
      code: function(e) {
      var y = e.y - this.startY;
      e.preventDefault();

      this.value = Math.max(0, Math.min(this.size - this.extent, Math.round((y - this.y ) / (this.height-4) * this.size)));
      }
    },
    {
      name: 'touchStart',
      code: function(e) {
      this.startY = e.targetTouches[0].pageY;
      this.startValue = this.value;
      e.target.ownerDocument.defaultView.addEventListener('touchmove', this.touchMove, false);
      //       this.parent.$.addEventListener('touchmove', this.touchMove, false);
      this.touchMove(e);
      }
    },
    {
      name: 'touchEnd',
      code: function(e) {
      e.target.ownerDocument.defaultView.removeEventListener('touchmove', this.touchMove, false);
      e.target.ownerDocument.defaultView.removeEventListener('touchend', this.touchEnd, false);
      //       this.parent.$.removeEventListener('touchmove', this.touchMove, false);
      }
    },
    {
      name: 'touchMove',
      code: function(e) {
      var y = e.targetTouches[0].pageY;
      e.preventDefault();
      this.value = Math.max(0, Math.min(this.size - this.extent, Math.round(this.startValue + (y - this.startY) / (this.height-4) * this.size )));
      }
    }
  ],

  methods: {
    initCView: function() {
      this.$.addEventListener('mousedown',  this.mouseDown,  false);
      this.$.addEventListener('touchstart', this.touchStart, false);
    },
    paintSelf: function() {
      if ( ! this.size ) return;

      var c = this.canvas;
      if ( ! c ) return;

      this.erase();

      if ( this.extent >= this.size ) return;

      c.strokeStyle = this.borderColor;
      c.lineWidth = 0.4;
      c.strokeRect(this.x, this.y, this.width-7, this.height);

      c.fillStyle = this.handleColor;

      var h = this.height-8;
      var handleSize = this.extent / this.size * h;

      if ( handleSize < this.minHandleSize ) {
        h -= this.minHandleSize - handleSize;
        handleSize = this.minHandleSize;
      }

      c.fillRect(
        this.x+2,
        this.y + 2 + this.value / this.size * h,
        this.width - 11,
        this.y + 4 + handleSize);
    }
  }
});
