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

// TODO: add ability to set CSS class and/or id
CLASS({
  package: 'foam.ui',
  name: 'ActionButton',

  extends: 'foam.ui.BaseView', // not extending View prevents cycle
  traits: ['foam.ui.HTMLViewTrait'],

  properties: [
    {
      name: 'action',
      postSet: function(old, nu) {
        old && old.removeListener(this.render)
        nu.addListener(this.render);
      }
    },
    {
      name: 'data'
    },
    {
      name: 'className',
      factory: function() { return 'actionButton actionButton-' + this.action.name; }
    },
    {
      name: 'tagName',
      defaultValue: 'button'
    },
    {
      name: 'showLabel',
      defaultValueFn: function() { return this.action.showLabel; }
    },
    {
      name: 'label',
      defaultValueFn: function() {
        return this.data ?
            this.action.labelFn.call(this.data, this.action) :
            this.action.label;
      }
    },
    {
      name: 'iconUrl',
      defaultValueFn: function() { return this.action.iconUrl; }
    },
    {
      name: 'tooltip',
      defaultValueFn: function() { return this.action.help; }
    }
  ],

  listeners: [
    {
      name: 'render',
      isFramed: true,
      code: function() { this.updateHTML(); }
    }
  ],

  methods: {

    toHTML: function() {
      var superResult = this.SUPER(); // get the destructors done before doing our work

      var self = this;

      this.on('click', function() {
        self.action.maybeCall(self.X, self.data);
      }, this.id);

      this.setAttribute('disabled', function() {
        self.closeTooltip();
        return self.action.isEnabled.call(self.data, self.action) ? undefined : 'disabled';
      }, this.id);

      this.setClass('available', function() {
        self.closeTooltip();
        return self.action.isAvailable.call(self.data, self.action);
      }, this.id);

      this.X.dynamicFn(function() { self.action.labelFn.call(self.data, self.action); self.updateHTML(); });

      return superResult;
    },

    toInnerHTML: function() {
      var out = '';

      if ( this.iconUrl ) {
        out += '<img src="' + XMLUtil.escapeAttr(this.iconUrl) + '">';
      }

      if ( this.showLabel ) {
        out += this.label;
      }

      return out;
    },

    initKeyboardShortcuts: function() { /* Not needed, will be done by parent View. */ }
  }
});
