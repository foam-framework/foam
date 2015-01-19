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
  name: 'ActionButtonCView',

  extendsModel: 'foam.graphics.CView',

  requires: [ 'foam.graphics.Circle' ],
  imports: [ 'gestureManager' ],

  properties: [
    {
      name: 'action',
      postSet: function(oldValue, action) {
        //  oldValue && oldValue.removeListener(this.render)
        // action.addListener(this.render);
        this.bindIsAvailable();
      }
    },
    {
      name:  'font',
      type:  'String',
      defaultValue: ''
    },
    {
      name: 'data',
      postSet: function() {
        this.bindIsAvailable();
      }
    },
    {
      name: 'showLabel',
      defaultValueFn: function() { return this.action.showLabel; }
    },
    {
      name: 'iconUrl',
      postSet: function(_, v) { this.image_ && (this.image_.src = v); },
      defaultValueFn: function() { return this.action.iconUrl; }
    },
    {
      name: 'haloColor',
      defaultValue: 'rgb(241, 250, 65)'
    },
    {
      name: 'halo',
      factory: function() { return this.Circle.create({
        alpha: 0,
        r: 10,
        color: this.haloColor
        /* This gives a ring halo:
        color: 'rgba(0,0,0,0)',
        borderWidth: 12,
        border: this.haloColor
        */
      });}
    },
    {
      name:  'iconWidth',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'iconHeight',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'radius',
      type:  'int',
      defaultValue: 0,
      postSet: function(_, r) {
        if ( r ) this.width = this.height = 2 * r;
      }
    },
    {
      name: 'tapGesture',
      hidden: true,
      transient: true,
      lazyFactory: function() {
        return this.X.GestureTarget.create({
          containerID: this.view.id,
          handler: this,
          gesture: 'tap'
        });
      }
    },
    {
      name: 'className',
      help: 'CSS class name(s), space separated.',
      defaultValueFn: function() {
        return 'actionButtonCView actionButtonCView-' + this.action.name;
      }
    },
    {
      name: 'tooltip',
      defaultValueFn: function() { return this.action.help; }
    },
    {
      name: 'speechLabel',
      defaultValueFn: function() { return this.action.speechLabel; }
    },
    'tabIndex',
    'role',
    {
      name: 'state_',
      defaultValue: 'default' // pressed, released
    }
  ],

  listeners: [
    {
      name: 'tapClick',
      code: function() { this.action.callIfEnabled(this.X, this.data); }
    },
    {
      name: 'onMouseDown',
      code: function(evt) {
        // console.log('mouseDow: ', evt, this.state_);
        if ( this.state_ !== 'default' ) return;

        this.state_ = 'pressing';

        if ( evt.type === 'touchstart' ) {
          var rect = this.$.getBoundingClientRect();
          var t = evt.touches[0];
          this.halo.x = t.pageX - rect.left;
          this.halo.y = t.pageY - rect.top;
        } else {
          this.halo.x = evt.offsetX;
          this.halo.y = evt.offsetY;
        }
        this.halo.r = 2;
        this.halo.alpha = 0.4;
        this.X.animate(150, function() {
          this.halo.x = this.width/2;
          this.halo.y = this.height/2;
          this.halo.r = Math.min(28, Math.min(this.width, this.height)/2);
          this.halo.alpha = 1;
        }.bind(this), undefined, function() {
          if ( this.state_ === 'cancelled' ) {
            this.state_ = 'pressed';
            this.onMouseUp();
          } else {
            this.state_ = 'pressed';
          }
        }.bind(this))();
      }
    },
    {
      name: 'onMouseUp',
      code: function(evt) {
        // console.log('mouseUp: ', evt, this.state_);
        if ( this.state_ === 'pressing' ) { this.state_ = 'cancelled'; return; }
        if ( this.state_ === 'cancelled' ) return;
        this.state_ = 'released';

        this.X.animate(
          200,
          function() { this.halo.alpha = 0; }.bind(this), Movement.easeIn(.5), function() { this.state_ = 'default' }.bind(this))();
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      if ( this.iconUrl ) {
        this.image_ = new Image();

        this.image_.onload = function() {
          if ( ! this.iconWidth  ) this.iconWidth  = this.image_.width;
          if ( ! this.iconHeight ) this.iconHeight = this.image_.height;
          if ( this.canvas ) {
            this.canvas.save();
            this.paint();
            this.canvas.restore();
          }
        }.bind(this);

        this.image_.src = this.iconUrl;
      }
    },

    bindIsAvailable: function() {
      if ( ! this.action || ! this.data ) return;

      var self = this;
      Events.dynamic(
        function() { self.action.isAvailable.call(self.data, self.action); },
        function() {
          if ( self.action.isAvailable.call(self.data, self.action) ) {
            if ( self.oldWidth_ && self.oldHeight_ ) {
              self.x = self.oldX_;
              self.y = self.oldY_;
              self.width = self.oldWidth_;
              self.height = self.oldHeight_;
            }
          } else if ( self.width || self.height ) {
            self.oldX_ = self.x;
            self.oldY_ = self.y;
            self.oldWidth_ = self.width;
            self.oldHeight_ = self.height;
            self.width = 0;
            self.height = 0;
            self.x = 0;
            self.y = 0;
          }
        });

      var b = this;
      // Subscribe to action firing and show halo animation
      b.data.subscribe(['action', this.action.name], function() {
        if ( b.state_ == 'pressing' ) return;
        b.halo.r = 2;
        b.halo.alpha = 0.4;
        b.halo.x = b.width/2;
        b.halo.y = b.height/2;
        Movement.compile([
          [150, function() {
            b.halo.r = Math.min(28, Math.min(b.width, b.height)/2);
            b.halo.alpha = 1;
          }],
          [200, function() { b.halo.alpha = 0; }]
        ])();
      }.bind(this));
    },

    initCView: function() {
      // Don't add halo as a child because we want to control
      // its paint order, but still set it up as though we had added it.
      // this.addChild(this.halo);
      this.halo.view = this.view;
      this.halo.addListener(this.view.paint);
      if ( this.gestureManager ) {
        // TODO: Glow animations on touch.
        this.gestureManager.install(this.tapGesture);
      }

      // Pressing space when has focus causes a synthetic press
      this.$.addEventListener('keypress', function(e) {
        if ( e.charCode == 32 && ! ( e.altKey || e.ctrlKey || e.shiftKey ) ) {
          e.preventDefault();
          e.stopPropagation();
          this.tapClick();
        }
      }.bind(this));

      // This is so that shift-search-spacebar performs a click with ChromeVox
      // which otherwise only delivers mouseDown and mouseUp events but no click 
      this.$.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // If no X & Y then it was simulated by ChromeVox
        if ( ! e.x && ! e.y ) this.tapClick();
      }.bind(this));

      this.$.addEventListener('mousedown',   this.onMouseDown);
      this.$.addEventListener('mouseup',     this.onMouseUp);
      this.$.addEventListener('mouseleave',  this.onMouseUp);

      this.$.addEventListener('touchstart',  this.onMouseDown);
      this.$.addEventListener('touchend',    this.onMouseUp);
      this.$.addEventListener('touchleave',  this.onMouseUp);
      this.$.addEventListener('touchcancel', this.onMouseUp);
    },

    destroy: function() {
      this.SUPER();
      if ( this.gestureManager ) {
        this.gestureManager.uninstall(this.tapGesture);
      }
    },

    erase: function() {
      var c = this.canvas;

      c.clearRect(0, 0, this.width, this.height);

      var r = Math.min(this.width, this.height)/2;
      c.fillStyle = this.background;
      c.beginPath();
      c.arc(this.width/2, this.height/2, r, 0, Math.PI*2, true);
      c.closePath();
      c.fill();
    },

    paintSelf: function() {
      var c = this.canvas;

      this.halo.paint();

      if ( this.font ) c.font = this.font;

      c.globalAlpha  = this.alpha;
      c.textAlign    = 'center';
      c.textBaseline = 'middle';
      c.fillStyle    = this.color;

      if ( this.image_ && this.image_.width ) {
        c.drawImage(
          this.image_,
          this.x + (this.width  - this.iconWidth)/2,
          this.y + (this.height - this.iconHeight)/2,
          this.iconWidth,
          this.iconHeight);
      }

      c.fillText(
        this.action.labelFn.call(this.data, this.action),
        this.x+this.width/2,
        this.y+this.height/2);
    }
  }
});
