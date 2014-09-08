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

/*
 TODO:
   Use MementoMgr.
   destroy() views when removed.
   Switch to use flexbox instead of <table>.
   Browser history support.
*/
MODEL({
  name:  'XXXStackView',
  extendsModel: 'View',

  properties: [
    {
      name:  'stack',
      factory: function() { return []; }
    },
    {
      name:  'redo',
      factory: function() { return []; }
    },
    {
      name: 'className',
      defaultValue: 'stackView'
    },
    {
      name: 'tagName',
      defaultValue: 'div'
    },
    {
      model_: 'BooleanProperty',
      name: 'sliderOpen'
    }
  ],

  actions: [
    {
      name:  'back',
      label: '<',
      help:  'Go to previous view',

      isEnabled: function() { return this.stack.length > 1 || this.sliderOpen; },
      action: function() {
        if ( this.sliderOpen ) {
          this.sliderOpen = false;
          this.dimmer$().style.zIndex = -1;
          this.dimmer$().style.opacity = -1;
          this.slideArea$().style.transition = 'left 0.2s cubic-bezier(0.4, 0.0, 1, 1)';
          this.slideArea$().style.left = '-304px';
          setTimeout(function() {
            this.slideArea$().style.transition = '';
            this.slideArea$().innerHTML = '';
          }.bind(this), 300);
        } else {
          this.redo.push(this.stack.pop());
          this.pushView(this.stack.pop(), undefined, true, 'fromLeft');
          this.propertyChange('stack', this.stack, this.stack);
        }
      }
    },
    {
      name:  'forth',
      label: '>',
      help:  'Undo the previous back.',
      isEnabled: function() { return this.redo.length > 0; },
      action: function() {
        this.pushView(this.redo.pop());
        this.propertyChange('stack', this.stack, this.stack);
      }
    }
  ],

  methods: {
    dimmer$:      function() { return this.$.querySelector('.stackview-dimmer'); },
    navBar$:      function() { return this.$.querySelector('.stackview_navbar'); },
    navActions$:  function() { return this.$.querySelector('.stackview_navactions'); },
    slideArea$:   function() { return this.$.querySelector('.stackview-slidearea'); },
    viewArea$:    function() { return this.$.querySelector('.stackview-viewarea'); },
    previewArea$: function() { return this.$.querySelector('.stackview-previewarea'); },

    initHTML: function() {
      this.SUPER();

      this.dimmer$().addEventListener('click', this.back.bind(this));
    },

    setTopView: function(view, opt_label) {
      this.stack = [];
      this.pushView(view, undefined, undefined, 'none');
    },

    updateNavBar: function() {
      var buf = [];

      for ( var i = 0 ; i < this.stack.length ; i++ ) {
        var view = this.stack[i];

        if ( buf.length != 0 ) buf.push(' > ');
        buf.push(view.stackLabel);
      }

      this.navBar$().innerHTML = buf.join('');
    },

    slideView: function (view, opt_label) {
      this.sliderOpen = true;
      this.redo.length = 0;
      this.setPreview(null);
      // view.stackLabel = opt_label || view.stackLabel || view.label;
      // this.stack.push(view);
      this.slideArea$().style.left = -2000;
      var s = this.X.window.getComputedStyle(this.slideArea$());
      this.slideArea$().innerHTML = view.toHTML();
      view.initHTML();
      this.slideArea$().style.transition = '';
      this.slideArea$().style.left = -toNum(s.width);

      setTimeout(function() {
        this.dimmer$().style.zIndex = 3;
        this.dimmer$().style.opacity = 0.4;
        this.slideArea$().style.transition = 'left 0.2s cubic-bezier(0.0, 0.0, 0.2, 1)';
        this.slideArea$().style.left = '0';
        // view.stackView = this;
        // this.propertyChange('stack', this.stack, this.stack);
      }.bind(this), 10);
    },

    pushView: function (view, opt_label, opt_back, opt_transition) {
      if ( this.staleView_ ) try { this.staleView_.remove(); } catch (x) { }

      var transition = opt_transition || 'fromRight';

      if ( ! opt_back ) this.redo.length = 0;
      this.setPreview(null);
      view.stackLabel = opt_label || view.stackLabel || view.label;
      this.stack.push(view);
      if ( transition === 'fromRight' )
        this.installViewFromRight_(view);
      else if ( transition === 'fromLeft' )
        this.installViewFromLeft_(view);
      else
        this.installView_(view);
      this.updateNavBar();
      view.stackView = this;
      view.initHTML();
      this.propertyChange('stack', this.stack, this.stack);
    },

    installView_: function(view) {
      this.viewArea$().innerHTML = view.toHTML();
    },

    installViewFromRight_: function(view) {
      var oldViewArea = this.viewArea$();

      var id = this.nextID();
      var width = toNum(this.X.window.getComputedStyle(oldViewArea).width);
      var newViewHTML = '<div id="' + id + '" style="display: table;position: absolute; left: ' + width + ';transition: left .3s;" class="stackview-viewarea">' + view.toHTML() + '<div>';
      oldViewArea.style.display = 'table';
      oldViewArea.style.position = 'absolute';
      oldViewArea.style.left = 0;
      oldViewArea.style.transition = 'left .3s';
      oldViewArea.insertAdjacentHTML('afterend', newViewHTML);

      var newViewArea = this.X.$(id);

      this.X.setTimeout(function() {
        oldViewArea.style.left = -width;
        newViewArea.style.left = 0;
      }.bind(this), 15);

      this.staleView_ = oldViewArea;
      this.X.setTimeout(function() {
        newViewArea.style.position = '';
        newViewArea.style.left = '';
        oldViewArea.remove();
      }, 500);
    },

    installViewFromLeft_: function(view) {
      var oldViewArea = this.viewArea$();

      var id = this.nextID();
      var width = toNum(this.X.window.getComputedStyle(oldViewArea).width);
      var newViewHTML = '<div id="' + id + '" style="display: table;position: absolute; right: ' + width + ';transition: right .3s;" class="stackview-viewarea">' + view.toHTML() + '<div>';
      oldViewArea.style.display = 'table';
      oldViewArea.style.position = 'absolute';
      oldViewArea.style.right = 0;
      oldViewArea.style.transition = 'right .3s';
      oldViewArea.insertAdjacentHTML('afterend', newViewHTML);

      var newViewArea = this.X.$(id);

      this.X.setTimeout(function() {
        oldViewArea.style.right = -width;
        newViewArea.style.right = 0;
      }.bind(this), 15);

      this.staleView_ = oldViewArea;
      this.X.setTimeout(function() {
        newViewArea.style.position = '';
        newViewArea.style.right = '';
        oldViewArea.remove();
      }, 500);
    },

    setPreview: function(view) {
      if ( ! view ) {
        this.viewArea$().parentNode.width = '100%';
        this.previewArea$().innerHTML = '';
        return;
      }

      this.viewArea$().parentNode.width = '65%';
      this.previewArea$().innerHTML = view.toHTML();
      view.initHTML();
    }
  },

  templates: [
    function toInnerHTML() {/*
      <div class="stackview_navbar"></div>
      <div class="stackview_navactions">$$back $$forth</div>
      <table width=100% style="table-layout:fixed;">
        <tr>
          <td width=48% valign=top class="stackview-viewarea-td">
            <div class="stackview-slidearea"></div>
            <div class="stackview-dimmer"></div>
            <div class="stackview-viewarea"></div>
          </td>
          <td width=48% valign=top class="stackview-previewarea-td"><div class="stackview-previewarea"></div></td>
        </tr>
      </table>
    */}
  ]
});

MODEL({
  name: 'StackView',
  traits: ['PositionedDOMViewTrait'],
  extendsModel: 'View',
  properties: [
    {
      model_: 'ArrayProperty',
      name: 'stack',
      factory: function() { return []; }
    },
    {
      name: 'redo',
      factory: function() { return []; }
    },
    {
      name: 'slider',
      factory: function() { return this.X.ViewSlider.create(); }
    },
    {
      name: 'overlaySlider',
      factory: function() { return this.X.OverlaySlider.create(); },
      postSet: function(old, v) {
        if ( old ) old.unsubscribe(['click'], this.overlayBack);
        v.subscribe(['click'], this.overlayBack);
      }
    },
    { model_: 'BooleanProperty', name: 'sliderOpen', defaultValue: false },
    'slideLatch'
  ],
  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.X.dynamic(function() { self.width; self.height; }, this.layout);
    },
    setPreview: function(){ console.warn('Preview removed from stack view, do it yourself.'); },
    pushView: function(view, opt_label, opt_back, opt_transition) {
      var prev = this.stack[this.stack.length];

      if ( ! opt_back ) {
        this.redo.length = 0;
        this.propertyChange('redo', this.redo, this.redo);
      }

      this.stack.push(view);
      this.propertyChange('stack', this.stack, this.stack);

      if ( opt_transition === 'none' ) {
        this.slider.setView(view);
        return;
      }

      this.slider.reverse = opt_transition === 'fromLeft';
      this.slider.slideView(view);
    },
    setTopView: function(view) {
      this.stack = [];
      this.pushView(view, undefined, undefined, 'none');
    },
    slideView: function(view, opt_label, opt_side) {
      if ( this.slideLatch ) {
        this.slideLatch();
        this.slideLatch = '';
      }

      this.sliderOpen = true;
      this.overlaySlider.view = view;

      var self = this;
      this.slideLatch = Movement.animate(
        300,
        function() { self.overlaySlider.slideAmount = 1 },
        undefined,
        function() {
          self.slideLatch = '';
        })();
    }
  },
  listeners: [
    {
      name: 'layout',
      code: function() {
        this.overlaySlider.x = 0;
        this.overlaySlider.y = 0;
        this.overlaySlider.width = this.width;
        this.overlaySlider.height = this.height;

        this.slider.x = 0;
        this.slider.y = 0;
        this.slider.width = this.width;
        this.slider.height = this.height;
      }
    },
    {
      name: 'overlayBack',
      code: function() {
        if ( this.sliderOpen ) this.back();
      }
    }
  ],
  templates: [
    function toInnerHTML() {/* %%overlaySlider %%slider */}
  ],
  actions: [
    {
      name:  'back',
      label: '<',
      help:  'Go to previous view',

      isEnabled: function() { return this.stack.length > 1 || this.sliderOpen; },
      action: function() {
        if ( this.sliderOpen ) {
          if ( this.slideLatch ) {
            this.slideLatch();
            this.slideLatch = '';
          }

          var self = this;
          this.sliderOpen = false;
          this.slideLatch = Movement.animate(
            300,
            function() { self.overlaySlider.slideAmount = 0; },
            undefined,
            function() {
              self.slideLatch = '';
              self.overlaySlider.view = '';
            })();
        } else {
          this.redo.push(this.stack.pop());
          this.pushView(this.stack.pop(), undefined, true, 'fromLeft');
          this.propertyChange('stack', this.stack, this.stack);
        }
      }
    },
    {
      name:  'forth',
      label: '>',
      help:  'Undo the previous back.',
      isEnabled: function() { return this.redo.length > 0; },
      action: function() {
        this.pushView(this.redo.pop());
        this.propertyChange('stack', this.redo, this.redo);
      }
    }
  ]
});
