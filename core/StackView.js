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
      name:   'backButton',
      type:  'ActionButton',
      factory: function() {
        // TODO: What's the right value for the action button.
        return ActionButton.create({action: StackView.actions[0], value: SimpleValue.create(this)});
      }
    },
    {
      name:   'forwardButton',
      type:   'ActionButton',
      factory: function() {
        return ActionButton.create({action: StackView.actions[1], value: SimpleValue.create(this)});
      }
    }
  ],

  actions: [
    {
      name:  'back',
      label: '<',
//      iconUrl: ( FOAM_BOOT_DIR || './' ) + 'images/Navigation_Left_Arrow.svg',
      help:  'Go to previous view',

      isEnabled:   function() { return this.stack.length > 1; },
      action:      function() {
        this.redo.push(this.stack.pop());
        this.pushView(this.stack.pop(), undefined, true);
        this.propertyChange('stack', this.stack, this.stack);
      }
    },
    {
      name:  'forth',
      label: '>',
//      iconUrl: ( FOAM_BOOT_DIR || './' ) + 'images/Navigation_Right_Arrow.svg',
      help:  'Undo the previous back.',

      action:      function() {
        this.pushView(this.redo.pop());
        this.propertyChange('stack', this.stack, this.stack);
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.addChild(this.forwardButton);
      this.addChild(this.backButton);
    },

    toHTML: function() {
      return '<div class="stackview" style="width:100%;" id="' + this.id + '">' +
        '<div class="stackview_navbar"></div>' +
        '<div class="stackview_navactions">' + this.backButton.toHTML() + this.forwardButton.toHTML() + '</div>' +
        '<table width=100% style="table-layout:fixed;"><tr><td width=48% valign=top class="stackview-viewarea-td"><div class="stackview-viewarea"></div></td><td width=48% valign=top class="stackview-previewarea-td"><div class="stackview-previewarea"></div></td></tr></table></div>';
    },

    setTopView: function(view, opt_label) {
      this.stack = [];
      this.pushView(view);
    },

    navBarElement: function() {
      return this.$.childNodes[0];
    },

    navActionsElement: function() {
      return this.$.childNodes[1];
    },

    viewAreaElement: function () {
      return this.$.querySelector('.stackview-viewarea');
    },

    previewAreaElement: function() {
      return this.$.querySelector('.stackview-previewarea');
    },

    updateNavBar: function() {
      var buf = [];

      for ( var i = 0 ; i < this.stack.length ; i++ ) {
        var view = this.stack[i];

        if ( buf.length != 0 ) buf.push(' > ');
        buf.push(view.stackLabel);
      }

      this.navBarElement().innerHTML = buf.join('');
    },

    pushView: function (view, opt_label, opt_back) {
      if ( !opt_back ) this.redo.length = 0;
      this.setPreview(null);
      view.stackLabel = opt_label || view.stackLabel || view.label;
      this.stack.push(view);
      this.viewAreaElement().innerHTML = view.toHTML();
      this.updateNavBar();
      view.stackView = this;
      view.initHTML();
      this.propertyChange('stack', this.stack, this.stack);
    },

    setPreview: function(view) {
      if ( ! view ) {
        this.viewAreaElement().parentNode.width = '100%';
        this.previewAreaElement().innerHTML = '';
        return;
      }

      this.viewAreaElement().parentNode.width = '65%';
      this.previewAreaElement().innerHTML = view.toHTML();
      view.initHTML();
    }
  }
});
