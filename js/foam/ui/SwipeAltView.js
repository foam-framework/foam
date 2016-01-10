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
  package: 'foam.ui',
  name: 'SwipeAltView',
  extends: 'foam.ui.View',

  requires: [
    'foam.input.touch.GestureTarget',
    'foam.ui.ChoiceListView'
  ],

  properties: [
    {
      type: 'Array',
      name: 'views',
      subType: 'foam.ui.ViewChoice',
      view: 'foam.ui.ArrayView',
      help: 'View Choices'
    },
    {
      name: 'index',
      help: 'The index of the currently selected view',
      defaultValue: 0,
      preSet: function(old, nu) {
        if ( nu < 0 ) return 0;
        if ( nu >= this.views.length ) return this.views.length - 1;
        return nu;
      },
      postSet: function(oldValue, viewChoice) {
        this.views[oldValue].view().deepPublish(this.ON_HIDE);
        // ON_SHOW is called after the animation is done.
        this.snapToCurrent(Math.abs(oldValue - viewChoice));
      },
      hidden: true
    },
    {
      name: 'headerView',
      help: 'Optional View to be displayed in header.',
      lazyFactory: function() {
        return this.ChoiceListView.create({
          choices: this.views.map(function(x) {
            return x.label;
          }),
          index$: this.index$,
          className: 'swipeAltHeader foamChoiceListView horizontal'
        }, this.Y);
      }
    },
//     {
//       name: 'data',
//       help: 'Generic data field for the views. Proxied to all the child views.',
//       postSet: function(old, nu) {
//         this.views.forEach(function(c) {
//           c.view().data = nu;
//         });
//       }
//     },
    {
      name: 'slider',
      help: 'Internal element which gets translated around',
      hidden: true
    },
    {
      name: 'width',
      help: 'Set when we know the width',
      getter: function() { return this.$.clientWidth; },
      hidden: true
    },
    {
      name: 'x',
      help: 'X coordinate of the translation',
      hidden: true,
      postSet: function(old, nu) {
        // TODO: Other browsers.
        this.slider.style['-webkit-transform'] = 'translate3d(-' +
            nu + 'px, 0, 0)';
      }
    },
    {
      name: 'swipeGesture',
      hidden: true,
      transient: true,
      factory: function() {
        return this.GestureTarget.create({
          containerID: this.id,
          handler: this,
          gesture: 'horizontalScroll'
        });
      }
    }
  ],

  methods: {
    // The general structure of the carousel is:
    // - An outer div (this.$), with position: relative.
    // - A second div (this.slider) with position: relative.
    //   This is the div that gets translated to and fro.
    // - A set of internal divs (this.slider.children) for the child views.
    //   These are positioned inside the slider right next to each other,
    //   and they have the same width as the outer div.
    //   At most two of these can be visible at a time.
    //
    // If the width is not set yet, this renders a fake carousel. It has the
    // outer, slider and inner divs, but there's only one inner div and it
    // can't slide yet. Shortly thereafter, the slide is expanded and the
    // other views are added. This should be imperceptible to the user.
    toHTML: function() {
      var str  = [];
      var viewChoice = this.views[this.index];

      if ( this.headerView ) {
        str.push(this.headerView.toHTML());
        this.addChild(this.headerView);
      }

      str.push('<div id="' + this.id + '" class="swipeAltOuter">');
      str.push('<div class="swipeAltSlider">');
      str.push('<div class="swipeAltInner" style="left: 0px">');
      str.push(viewChoice.view().toHTML());

      str.push('</div>');
      str.push('</div>');
      str.push('</div>');

      return str.join('');
    },

    initHTML: function() {
      this.SUPER();

      var self = this;
      this.views.forEach(function(choice, index) {
        if ( index != self.index )
          choice.view().deepPublish(self.ON_HIDE);
      });
      this.views[this.index].view().deepPublish(this.ON_SHOW);

      // Now is the time to inflate our fake carousel into the real thing.
      // For now we won't worry about re-rendering the current one.
      // TODO: Stop re-rendering if it's slow or causes flicker or whatever.

      this.slider = this.$.children[0];

      var str = [];
      for ( var i = 0 ; i < this.views.length ; i++ ) {
        // Hide all views except the first one.  They'll be shown after they're resized.
        // This prevents all views from overlapping on startup.
        str.push('<div class="swipeAltInner"' + ( i ? ' style="visibility:hidden;"' : '' ) + '>');
        str.push(this.views[i].view().toHTML());
        str.push('</div>');
      }

      this.slider.innerHTML = str.join('');

      window.addEventListener('resize', this.resize, false);
      this.X.gestureManager.install(this.swipeGesture);

      // Wait for the new HTML to render first, then init it.
      var self = this;
      window.setTimeout(function() {
        self.resize();
        self.views.forEach(function(choice) {
          choice.view().initHTML();
        });
        var vs = self.slider.querySelectorAll('.swipeAltInner');
        for ( var i = 0 ; i < vs.length ; i++ ) vs[i].style.visibility = '';
      }, 0);
    },

    destroy: function( isParentDestroyed ) {
      this.SUPER(isParentDestroyed);
      this.X.gestureManager.uninstall(this.swipeGesture);
      this.views.forEach(function(c) { c.view().destroy(); });
    },

    snapToCurrent: function(sizeOfMove) {
      var self = this;
      var time = 150 + sizeOfMove * 150;
      this.X.animate(time, function(evt) {
        self.x = self.index * self.width;
      }, Movement.ease(150/time, 150/time), function() {
        self.views[self.index].view().deepPublish(self.ON_SHOW);
      })();
    }
  },

  listeners: [
    {
      name: 'resize',
      isMerged: 100,
      code: function() {
        // When the orientation of the screen has changed, update the
        // left and width values of the inner elements and slider.
        if ( ! this.$ ) {
          window.removeEventListener('resize', this.resize, false);
          return;
        }

        var self = this;
        var frame = this.X.requestAnimationFrame(function() {
          self.x = self.index * self.width;

          for ( var i = 0 ; i < self.slider.children.length ; i++ ) {
            self.slider.children[i].style.left = (i * 100) + '%';
            self.slider.children[i].style.visibility = '';
          }

          window.cancelAnimationFrame(frame);
        });
      }
    },
    {
      name: 'horizontalScrollMove',
      code: function(dx, tx, x) {
        var x = this.index * this.width - tx;

        // Limit x to be within the scope of the slider: no dragging too far.
        if ( x < 0 ) x = 0;
        var maxWidth = (this.views.length - 1) * this.width;
        if ( x > maxWidth ) x = maxWidth;

        this.x = x;
      }
    },
    {
      name: 'horizontalScrollEnd',
      code: function(dx, tx, x) {
        if ( Math.abs(tx) > this.width / 3 ) {
          // Consider that a move.
          if ( tx < 0 ) {
            this.index++;
          } else {
            this.index--;
          }
        } else {
          this.snapToCurrent(1);
        }
      }
    }
  ],
  templates: [
    function CSS() {/*
      .swipeAltInner {
        position: absolute;
        top: 0px;
        height: 100%;
        width: 100%;
      }

      .swipeAltOuter {
        flex-grow: 1;
        display: flex;
        overflow: hidden;
        min-width: 240px;
        width: 100%;
      }

      .swipeAltSlider {
        position: relative;
        width: 100%;
        top: 0px;
        -webkit-transform: translate3d(0,0,0);
      }
    */}
  ]
});
