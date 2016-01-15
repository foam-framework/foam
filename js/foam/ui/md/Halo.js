/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  package: 'foam.ui.md',
  name: 'Halo',

  extends: 'foam.graphics.Circle',

  constants: {
    RING_INNER_COLOR: 'rgba(0, 0, 0, 0)'
  },

  properties: [
    {
      name: 'style',
      documentation: 'solid|ring',
      defaultValue: 'solid',
      postSet: function(_, style) {
        if ( style !== this.RING_INNER_COLOR ) this.setColorAndBorder();
      }
    },
    {
      name: 'state_',
      defaultValue: 'default' // pressed, released
    },
    {
      name: 'nextColor_',
      defaultValueFn: function() { return this.color; }
    },
    {
      name: 'color',
      preSet: function(old, nu) {
        if ( this.state_ !== 'default' ) {
          // store it for next animation
          this.nextColor_ = nu;
          return old;
        }
        return nu;
      }
    },
    {
      name: 'easeInTime',
      defaultValue: 200
    },
    {
      name: 'easeOutTime',
      defaultValue: 150
    },
    {
      name: 'startAlpha',
      defaultValue: 0.8
    },
    {
      name: 'pressedAlpha',
      defaultValue: 0.4
    },
    {
      name: 'finishAlpha',
      defaultValue: 0
    },
    {
      name: 'alpha',
      defaultValue: 0
    },
    {
      name: 'recentering',
      defaultValue: true
    },
    {
      type: 'Function',
      name: 'isEnabled',
      defaultValue: function() { return true; }
    }
  ],

  methods: [
    {
      name: 'setColorAndBorder',
      code: function() {
        if ( this.style === 'ring' ) {
          var color = this.color;
          this.border = color;
          this.borderWidth = 12;
          this.color = this.RING_INNER_COLOR;
        }
      }
    },
    {
      name: 'initCView',
      code: function() {
        this.$.addEventListener('mousedown',   this.onMouseDown);
        this.$.addEventListener('mouseup',     this.onMouseUp);
        this.$.addEventListener('mouseleave',  this.onMouseUp);
        this.$.addEventListener('touchstart',  this.onMouseDown);
        this.$.addEventListener('touchend',    this.onMouseUp);
        this.$.addEventListener('touchleave',  this.onMouseUp);
        this.$.addEventListener('touchcancel', this.onMouseUp);
      }
    },
    {
      name: 'isTouchInRect',
      code: function(t, rect) {
        return t.clientX >= rect.left && t.clientX <= rect.right &&
          t.clientY >= rect.top && t.clientY <= rect.bottom;
      }
    }
  ],

  listeners: [
    {
      name: 'onMouseDown',
      code: function(evt) {
        if ( this.state_ !== 'default' || ! this.isEnabled() ) return;

        this.state_ = 'pressing';

        if ( evt.type === 'touchstart' ) {
          var rect = this.$.getBoundingClientRect(), touchFound = false, t;
          for ( var i = 0; i < evt.touches.length; ++i ) {
            t = evt.touches[i];
            if ( this.isTouchInRect(t, rect) ) { touchFound = true; break; }
          }
          if ( touchFound ) {
            this.x = (t.clientX - rect.left);
            this.y = (t.clientY - rect.top);
          } else {
            // Default to center of element.
            console.warn('No touches', evt.touches, 'in element rect', rect);
            this.x = rect.width / 2;
            this.y = rect.height / 2;
          }
        } else {
          this.x = evt.offsetX;
          this.y = evt.offsetY;
        }
        this.r = 2;
        this.alpha = this.startAlpha;
        var recentering = this.recentering;
        this.X.animate(this.easeInTime, function() {
          if ( recentering ) {
            this.x = this.parent.width/2;
            this.y = this.parent.height/2;
            this.r = Math.min(28, Math.min(this.$.clientWidth, this.parent.height)/2);
          } else {
            this.r = Math.max(28, Math.max(this.$.clientWidth, this.parent.height));
          }
          this.alpha = this.pressedAlpha;
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
        // This line shouldn't be necessary but we're getting stray
        // onMouseUp events when the cursor moves over the button.
        if ( this.state_ === 'default' ) return;

        if ( this.state_ === 'pressing' ) { this.state_ = 'cancelled'; return; }
        if ( this.state_ === 'cancelled' ) return;
        this.state_ = 'released';

        this.X.animate(
          this.easeOutTime,
          function() { this.alpha = this.finishAlpha; }.bind(this),
          Movement.easeIn(.5),
          function() {
            if ( this.state_ === 'released' ) {
              this.state_ = 'default';
              this.color = this.nextColor_;
            }
          }.bind(this))();
      }
    }
  ]
});
