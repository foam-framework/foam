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
  package: 'foam.ui',
  name: 'VerticalScrollbarView',
  extends: 'foam.ui.View',

  documentation: function() {/*
   The default vertical scrollbar view for a ScrollView. It appears during
   scrolling and fades out after scrolling stops.</p><p>

   TODO: create a version that can respond to mouse input.
   TODO: a horizontal scrollbar. Either a separate view, or a generalization of
   this one.
 */},
  properties: [
    {
      name: 'scrollTop',
      type: 'Int',
      postSet: function(old, nu) {
        this.show();
        if (this.timeoutID)
          clearTimeout(this.timeoutID);
        if (!this.mouseOver) {
          this.timeoutID = setTimeout(function() {
            this.timeoutID = 0;
            this.hide();
          }.bind(this), 200);
        }
        var maxScrollTop = this.scrollHeight - this.height;
        if (maxScrollTop <= 0)
          return 0;
        var ratio = this.scrollTop / maxScrollTop;
        this.thumbPosition = ratio * (this.height - this.thumbHeight);
      }
    },
    {
      name: 'scrollHeight',
      type: 'Int'
    },
    {
      name: 'mouseOver',
      type: 'Boolean',
      defaultValue: false
    },
    {
      name: 'height',
      type: 'Int',
      postSet: function(old, nu) {
        if ( this.$ ) {
          this.$.style.height = nu + 'px';
        }
      }
    },
    {
      name: 'width',
      type: 'Int',
      defaultValue: 12,
      postSet: function(old, nu) {
        if (this.$) {
          this.$.style.width = nu + 'px';
        }
        var thumb = this.thumb();
        if (thumb) {
          thumb.style.width = nu + 'px';
        }
      }
    },
    {
      name: 'thumbID',
      factory: function() {
        return this.nextID();
      }
    },
    {
      name: 'thumbHeight',
      dynamicValue: function() {
        var id = this.thumbID;
        var height = this.height;
        if (!this.scrollHeight)
          return 0;
        return height * height / this.scrollHeight;
      },
      postSet: function(old, nu) {
        var thumb = this.thumb();
        if (thumb) {
          thumb.style.height = nu + 'px';
        }
      }
    },
    {
      name: 'thumbPosition',
      defaultValue: 0,
      postSet: function(old, nu) {
        var old = this.oldThumbPosition_ || old;

        // Don't bother moving less than 2px
        if ( Math.abs(old-nu) < 2.0 ) return;

        var thumb = this.thumb();
        if ( thumb ) {
          this.oldThumbPosition_ = nu;
          // TODO: need to generalize this transform stuff.
          thumb.style.webkitTransform = 'translate3d(0px, ' + nu + 'px, 0px)';
        }
      }
    },
    {
      name: 'lastDragY',
      type: 'Int'
    }
  ],

  methods: {
    thumb: function() { return this.X.$(this.thumbID); },
    initHTML: function() {
      this.SUPER();

      if ( ! this.$ ) return;
      this.$.addEventListener('mouseover', this.onMouseEnter);
      this.$.addEventListener('mouseout',  this.onMouseOut);
      this.$.addEventListener('click', this.onTrackClick);
      this.thumb().addEventListener('mousedown', this.onStartThumbDrag);
      this.thumb().addEventListener('click', function(e) { e.stopPropagation(); });

      this.shown_ = false;
    },
    show: function() {
      if ( this.shown_ ) return;
      this.shown_ = true;

      var thumb = this.thumb();
      if (thumb) {
        thumb.style.webkitTransition = '';
        thumb.style.opacity = '0.3';
      }
    },
    hide: function() {
      if ( ! this.shown_ ) return;
      this.shown_ = false;

      var thumb = this.thumb();
      if (thumb) {
        thumb.style.webkitTransition = '200ms opacity';
        thumb.style.opacity = '0';
      }
    },
    maxScrollTop: function() {
      return this.scrollHeight - this.height;
    }
  },

  listeners: [
    {
      name: 'onMouseEnter',
      code: function(e) {
        this.mouseOver = true;
        this.show();
      }
    },
    {
      name: 'onMouseOut',
      code: function(e) {
        this.mouseOver = false;
        this.hide();
      }
    },
    {
      name: 'onStartThumbDrag',
      code: function(e) {
        this.lastDragY = e.screenY;
        document.body.addEventListener('mousemove', this.onThumbDrag);
        document.body.addEventListener('mouseup', this.onStopThumbDrag);
        e.preventDefault();
      }
    },
    {
      name: 'onThumbDrag',
      code: function(e) {
        if (this.maxScrollTop() <= 0)
          return;

        var dy = e.screenY - this.lastDragY;
        var newScrollTop = this.scrollTop + (this.maxScrollTop() * dy) / (this.height - this.thumbHeight);
        this.scrollTop = Math.min(this.maxScrollTop(), Math.max(0, newScrollTop));
        this.lastDragY = e.screenY;
        e.preventDefault();
      }
    },
    {
      name: 'onStopThumbDrag',
      code: function(e) {
        document.body.removeEventListener('mousemove', this.onThumbDrag);
        document.body.removeEventListener('mouseup', this.onStopThumbDrag, true);
        e.preventDefault();
      }
    },
    {
      name: 'onTrackClick',
      code: function(e) {
        if (this.maxScrollTop() <= 0)
          return;
        var delta = this.height;
        if (e.clientY < this.thumbPosition)
          delta *= -1;
        var newScrollTop = this.scrollTop + delta;
        this.scrollTop = Math.min(this.maxScrollTop(), Math.max(0, newScrollTop));
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" style="position: absolute;
                            width: <%= this.width %>px;
                            height: <%= this.height %>px;
                            right: 0px;
                            background: rgba(0, 0, 0, 0.1);
                            z-index: 2;">
        <div id="%%thumbID" style="
            opacity: 0;
            position: absolute;
            width: <%= this.width %>px;
            background:#333;">
        </div>
      </div>
    */}
  ]
});
