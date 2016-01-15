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
  extends: 'foam.graphics.CView',

  requires: [
    'foam.ui.md.Halo',
    'foam.input.touch.GestureTarget'
  ],
  imports: [ 'gestureManager' ],

  properties: [
    {
      name: 'action',
      postSet: function(oldValue, action) {
        //  oldValue && oldValue.removeListener(this.render)
        // action.addListener(this.render);
        this.bindIsAvailableAndEnabled();
      }
    },
    {
      type:  'String',
      name:  'font',
      defaultValue: ''
    },
    {
      name: 'data',
      postSet: function() {
        this.bindIsAvailableAndEnabled();
      }
    },
    {
      name: 'label',
      defaultValue: ''
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
      factory: function() {
        return this.Halo.create({
          alpha: 0,
          r: 10,
          color$: this.haloColor$,
          isEnabled: function() {
            return this.action.isEnabled.call(this.data, this.action);
          }.bind(this)
          /* This gives a ring halo:
          , style: 'ring'
           */
        });
      },
      postSet: function(old, nu) {
        if ( old ) this.removeChild(old);
        if ( nu ) this.addChild(nu);
      }
    },
    {
      name:  'iconWidth',
      defaultValue: 0
    },
    {
      name:  'iconHeight',
      defaultValue: 0
    },
    {
      name:  'radius',
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
        return this.GestureTarget.create({
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
      code: function() { this.action.maybeCall(this.X, this.data); }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.X.dynamicFn(function() {
          this.iconUrl; this.iconWidth; this.iconHeight;
        }.bind(this),
        function() {
         if ( this.iconUrl ) {
           this.image_ = new Image();

           this.image_.onload = function() {
             if ( ! this.iconWidth  ) this.iconWidth  = this.image_.width;
             if ( ! this.iconHeight ) this.iconHeight = this.image_.height;
             this.view.$ && this.view.paint();
           }.bind(this);

           this.image_.src = this.iconUrl;
         }
       }.bind(this));
    },

    bindIsAvailableAndEnabled: function() {
      if ( ! this.action || ! this.data ) return;

      var self = this;
      this.X.dynamicFn(
          function() {
            self.action.isAvailable.call(self.data, self.action);
            self.action.isEnabled.call(self.data, self.action);
          },
          function() {
            // TODO(KGR): When the Action isn't available we hide it by
            // setting the size to zero, which isn't ideal.  Better would be
            // to add a hidden or visibility property to CViews.  When this is done,
            // also simplify CViewView.
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
            if ( self.action.isEnabled.call(self.data, self.action) ) {
              self.alpha = 1.0;
            } else {
              self.alpha = 0.5;
            }
            self.view && self.view.paint();
          });
    },

    initCView: function() {

      if ( this.gestureManager )
        this.gestureManager.install(this.tapGesture);

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
        if ( ( ! e.x && ! e.y ) || ! this.gestureManager ) this.tapClick();
      }.bind(this));
    },

    destroy: function( isParentDestroyed ) {
      this.SUPER(isParentDestroyed);
      if ( this.gestureManager ) {
        this.gestureManager.uninstall(this.tapGesture);
      }
    },

    erase: function(c) {
      c.clearRect(0, 0, this.width, this.height);

      // TODO(jacksonic): Why is drawing a circle the default behaviour?
      var r = Math.min(this.width, this.height)/2;
      c.fillStyle = this.background;
      c.beginPath();
      c.arc(this.width/2, this.height/2, r, 0, Math.PI*2, true);
      c.closePath();
      c.fill();
    },

    paintSelf: function(c) {

      if ( this.font ) c.font = this.font;

      c.globalAlpha  = this.alpha;
      c.textAlign    = 'center';
      c.textBaseline = 'middle';
      c.fillStyle    = this.color;

      if ( this.image_ && this.image_.complete ) {
        c.drawImage(
          this.image_,
          this.x + (this.width  - this.iconWidth)/2,
          this.y + (this.height - this.iconHeight)/2,
          this.iconWidth,
          this.iconHeight);
      } else {
        c.fillText(
          this.label || this.action.labelFn.call(this.data, this.action),
          this.x+this.width/2,
          this.y+this.height/2);
      }
    }
  }
});
