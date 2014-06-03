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
FOAModel({
  name:  'StackView',
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
    },
    {
      name: 'sliderLeft',
      postSet: function(_, v) {
        this.slideArea$().style.left = v + 'px';
      }
    }
  ],

  actions: [
    {
      name:  'back',
      label: '<',
      help:  'Go to previous view',

      isEnabled: function() { return this.stack.length > 1; },
      action: function() {
        if ( this.sliderOpen ) {
          this.dimmer$().style.zIndex = 0;
          this.dimmer$().style.opacity = -1;
          Movement.animate(
            400,
            function() { this.sliderLeft = -250; }.bind(this),
            Movement.easeIn(0.9),
            function() { this.slideArea$().innerHTML = ''; }.bind(this))();
          this.sliderOpen = false;
        } else {
          this.redo.push(this.stack.pop());
          this.pushView(this.stack.pop(), undefined, true);
          this.propertyChange('stack', this.stack, this.stack);
        }
      }
    },
    {
      name:  'forth',
      label: '>',
      help:  'Undo the previous back.',

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

    setTopView: function(view, opt_label) {
      this.stack = [];
      this.pushView(view);
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
      view.stackLabel = opt_label || view.stackLabel || view.label;
      this.stack.push(view);
      this.slideArea$().innerHTML = view.toHTML();
      var s = this.X.window.getComputedStyle(this.slideArea$());
      this.sliderLeft = -toNum(s.width);
      this.dimmer$().style.zIndex = 3;
      this.dimmer$().style.opacity = 0.4;
      Movement.animate(
        300,
        function() { this.sliderLeft = 0; }.bind(this),
        Movement.easeIn(0.5).o(Movement.bounce(0.4, 0.03)))();
      view.stackView = this;
      view.initHTML();
      this.propertyChange('stack', this.stack, this.stack);
    },

    pushView: function (view, opt_label, opt_back) {
      if ( ! opt_back ) this.redo.length = 0;
      this.setPreview(null);
      view.stackLabel = opt_label || view.stackLabel || view.label;
      this.stack.push(view);
      this.viewArea$().innerHTML = view.toHTML();
      this.updateNavBar();
      view.stackView = this;
      view.initHTML();
      this.propertyChange('stack', this.stack, this.stack);
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
      <div class="stackview_navactions">$$back $$forward</div>
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
