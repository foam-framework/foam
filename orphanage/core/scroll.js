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
  name:  'ScrollCView',

  extendsModel: 'CView',

  properties: [
    {
      name:  'parent',
      type:  'CView',
      hidden: true,
      postSet: function(oldValue, newValue) {
        //         oldValue && oldValue.removeListener(this.updateValue);
        //         newValue.addListener(this.updateValue);
        var e = newValue && newValue.$;
        if ( ! e ) return;
        e.addEventListener('mousedown', this.mouseDown, false);
        e.addEventListener('touchstart', this.touchStart, false);
        //           e.addEventListener('mouseup',   this.mouseUp,   false);
      }
    },
    {
      name:  'vertical',
      type:  'boolean',
      defaultValue: true
    },
    {
      name:  'value',
      type:  'int',
      help:  'The first element being shown, starting at zero.',
      preSet: function(_, value) { return Math.max(0, Math.min(this.size-this.extent, value)); },
      defaultValue: 0
    },
    {
      name:  'extent',
      help:  'Number of elements shown.',
      type:  'int',
      minValue: 1,
      defaultValue: 10
    },
    {
      name:  'size',
      type:  'int',
      defaultValue: 0,
      help:  'Total number of elements being scrolled through.',
      postSet: function() { this.paint(); }
    },
    {
      name:  'minHandleSize',
      type:  'int',
      defaultValue: 10,
      help:  'Minimum size to make the drag handle.'
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
      name:  'handleColor',
      type:  'String',
      defaultValue: 'rgb(107,136,173)'
    },
    {
      name:  'borderColor',
      type:  'String',
      defaultValue: '#555'
    }
  ],

  listeners: {
    mouseDown: function(e) {
      //       this.parent.$.addEventListener('mousemove', this.mouseMove, false);
      this.startY = e.y - e.offsetY;
      e.target.ownerDocument.defaultView.addEventListener('mouseup', this.mouseUp, true);
      e.target.ownerDocument.defaultView.addEventListener('mousemove', this.mouseMove, true);
      e.target.ownerDocument.defaultView.addEventListener('touchstart', this.touchstart, true);
      this.mouseMove(e);
    },
    mouseUp: function(e) {
      e.preventDefault();
      e.target.ownerDocument.defaultView.removeEventListener('mousemove', this.mouseMove, true);
      e.target.ownerDocument.defaultView.removeEventListener('mouseup', this.mouseUp, true);
      //       this.parent.$.removeEventListener('mousemove', this.mouseMove, false);
    },
    mouseMove: function(e) {
      var y = e.y - this.startY;
      e.preventDefault();

      this.value = Math.max(0, Math.min(this.size - this.extent, Math.round((y - this.y ) / (this.height-4) * this.size)));
    },
    touchStart: function(e) {
      this.startY = e.targetTouches[0].pageY;
      this.startValue = this.value;
      e.target.ownerDocument.defaultView.addEventListener('touchmove', this.touchMove, false);
      //       this.parent.$.addEventListener('touchmove', this.touchMove, false);
      this.touchMove(e);
    },
    touchEnd: function(e) {
      e.target.ownerDocument.defaultView.removeEventListener('touchmove', this.touchMove, false);
      e.target.ownerDocument.defaultView.removeEventListener('touchend', this.touchEnd, false);
      //       this.parent.$.removeEventListener('touchmove', this.touchMove, false);
    },
    touchMove: function(e) {
      var y = e.targetTouches[0].pageY;
      e.preventDefault();
      this.value = Math.max(0, Math.min(this.size - this.extent, Math.round(this.startValue + (y - this.startY) / (this.height-4) * this.size )));
    }
  },

  methods: {

    paint: function() {
      if ( ! this.size ) return;

      var c = this.canvas;
      if ( ! c ) return;

      this.erase();

      if ( this.extent >= this.size ) return;

      c.strokeStyle = this.borderColor;
      c.strokeRect(this.x, this.y, this.width-7, this.height);

      c.fillStyle = this.handleColor;

      var h = this.height-8;
      var handleSize = this.extent / this.size * h;

      if ( handleSize < this.minHandleSize ) {
        handleSize = this.minHandleSize;
        h -= this.minHandleSize - handleSize;
      }

      c.fillRect(
        this.x+2,
        this.y + 2 + this.value / this.size * h,
        this.width - 11,
        this.y + 4 + handleSize);
    }
  }
});


/** Add a scrollbar around an inner-view. **/
CLASS({
  name:  'ScrollBorder',

  extendsModel: 'foam.ui.View',

  properties: [
    {
      name: 'view',
      type: 'view',
      postSet: function(_, view) {
        this.scrollbar.extent = this.view.rows;
      }
    },
    {
      name: 'scrollbar',
      type: 'ScrollCView',
      factory: function() {
        var sb = ScrollCView.create({height:1800, width: 20, x: 0, y: 0, extent: 10});

        if ( this.dao ) this.dao.select(COUNT())(function(c) { sb.size = c.count; });

        return sb;
      }
    },
    {
      name:  'dao',
      label: 'DAO',
      type: 'DAO',
      hidden: true,
      required: true,
      postSet: function(oldValue, newValue) {
        this.view.dao = newValue;
        var self = this;

        if ( this.dao ) this.dao.select(COUNT())(function(c) {
          self.scrollbar.size = c.count;
          self.scrollbar.value = Math.max(0, Math.min(self.scrollbar.value, self.scrollbar.size - self.scrollbar.extent));
          if ( self.dao ) self.view.dao = self.dao.skip(self.scrollbar.value);
        });
        /*
          if ( oldValue && this.listener ) oldValue.unlisten(this.listener);
          this.listener && val.listen(this.listener);
          this.repaint_ && this.repaint_();
        */
      }
    }
  ],

  listeners: [
    {
      name: 'layout',
      code: function() {
        this.view.layout();
      }
    }
  ],

  methods: {
    toHTML: function() {
      return '<table id="' + this.id + '" width=100% height=100% border=0><tr><td valign=top>' +
        this.view.toHTML() +
        '</td><td valign=top><div class="scrollSpacer"></div>' +
        this.scrollbar.toHTML() +
        '</td></tr></table>';
    },
    initHTML: function() {
      window.addEventListener('resize', this.layout, false);
      this.view.initHTML();
      this.scrollbar.initHTML();
      this.scrollbar.paint();

      var view = this.view;
      var scrollbar = this.scrollbar;
      var self = this;

      view.$.onmousewheel = function(e) {
        if ( e.wheelDeltaY > 0 && scrollbar.value ) {
          scrollbar.value--;
        } else if ( e.wheelDeltaY < 0 && scrollbar.value < scrollbar.size - scrollbar.extent ) {
          scrollbar.value++;
        }
      };
      scrollbar.addPropertyListener('value', EventService.framed(function() {
        if ( self.dao ) self.view.dao = self.dao.skip(scrollbar.value);
      }));

      /*
        Events.dynamicFn(function() {scrollbar.value;}, );
      */
      Events.dynamicFn(function() {view.rows;}, function() {
        scrollbar.extent = view.rows;
      });
      Events.dynamicFn(function() {view.height;}, function() {
        scrollbar.height = Math.max(view.height - 26, 0);
      });

      this.layout();
    }
  }
});
