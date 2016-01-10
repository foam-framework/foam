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
  name: 'GriddedStringArrayView',
  package: 'foam.apps.quickbug.ui',
  extends: 'foam.ui.View',

  requires: [
    'foam.ui.ActionButton',
    'foam.ui.TextFieldView'
  ],

  properties: [
    {
      type: 'String',
      name: 'name'
    },
    {
      type: 'String',
      name: 'type',
      defaultValue: 'text'
    },
    {
      type: 'Int',
      name: 'displayWidth',
      defaultValue: 30
    },
    {
      type: 'Boolean',
      name: 'autocomplete',
      defaultValue: true
    },
    {
      name: 'data',
      getter: function() { return this.softData; },
      setter: function(value) {
        this.softData = value;
        this.update();
      },
    },
    {
      name: 'softData',
      postSet: function(oldValue, newValue) {
        this.propertyChange('data', oldValue, newValue);
      }
    },
    'autocompleter',
    {
      type: 'Array',
      subType: 'foam.ui.TextFieldView',
      name: 'inputs'
    },
    {
      name: 'lastInput',
      postSet: function(old, v) {
        old && old.data$.removeListener(this.addRow);
        v.data$.addListener(this.addRow);
      }
    }
  ],

  methods: {
    toHTML: function() {
      var link = this.ActionButton.create({
        action: this.model_.ADD,
        data: this
      });
      this.addChild(link);

      return '<div id="' + this.id + '"><div></div>' +
        link.toHTML() +
        '</div>';
    },
    initHTML: function() {
      this.SUPER();
      this.update();
    },
    field: function() {
      return this.TextFieldView.create({
        name: this.name,
        type: this.type,
        displayWidth: this.displayWidth,
        autocomplete: this.autocomplete,
        autocompleter: this.autocompleter
      });
    }
  },

  listeners: [
    {
      name: 'addRow',
      code: function() {
        var views = [this.field(),
                     this.field(),
                     this.field()];

        this.addChildren.apply(this, views);
        this.inputs = this.inputs.concat(views);
        views[0].data$.addListener(this.onInput);
        views[1].data$.addListener(this.onInput);
        views[2].data$.addListener(this.onInput);

        var inputElement = this.$.firstElementChild;
        inputElement.insertAdjacentHTML('beforeend',
                                        '<div>' +
                                        views[0].toHTML() +
                                        views[1].toHTML() +
                                        views[2].toHTML() +
                                        '</div>');

        views[0].initHTML();
        views[1].initHTML();
        views[2].initHTML();

        this.lastInput = views[2];
      }
    },
    {
      name: 'update',
      code: function() {
        if ( ! this.$ ) return;

        this.$.firstElementChild.innerHTML = '';
        this.inputs = [];

        var i = 0;
        while ( this.inputs.length < Math.max(6, this.softData.length) ) {
          var views = [this.field(),
                       this.field(),
                       this.field()];

          this.addChildren.apply(this, views);
          this.inputs = this.inputs.concat(views);

          views[0].data = i < this.softData.length ? this.softData[i++] : '';
          views[1].data = i < this.softData.length ? this.softData[i++] : '';
          views[2].data = i < this.softData.length ? this.softData[i++] : '';

          views[0].data$.addListener(this.onInput);
          views[1].data$.addListener(this.onInput);
          views[2].data$.addListener(this.onInput);

          var inputElement = this.$.firstElementChild;
          inputElement.insertAdjacentHTML('beforeend',
                                          '<div>' +
                                          views[0].toHTML() +
                                          views[1].toHTML() +
                                          views[2].toHTML() +
                                          '</div>');

          views[0].initHTML();
          views[1].initHTML();
          views[2].initHTML();

          this.lastInput = views[2];
        }
      }
    },
    {
      name: 'onInput',
      code: function(e) {
        if ( ! this.$ ) return;

        var newdata = [];

        var inputs = this.inputs;
        for ( var i = 0; i < inputs.length; i++ ) {
          if ( inputs[i].data ) newdata.push(inputs[i].data);
        }
        this.softData = newdata;
      }
    }
  ],

  actions: [
    {
      name: 'add',
      label: 'Add a row',
      code: function() {
        this.addRow();
      }
    }
  ]
});
