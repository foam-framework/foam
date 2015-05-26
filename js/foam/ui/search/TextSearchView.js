/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
  package: 'foam.ui.search',
  name: 'TextSearchView',

  extendsModel: 'foam.ui.View',

  requires: [ 'foam.ui.TextFieldView' ],

  properties: [
    {
      name:  'width',
      type:  'int',
      defaultValue: 47
    },
    {
      name: 'property',
      type: 'Property'
    },
    {
      name: 'predicate',
      type: 'Object',
      defaultValue: TRUE
    },
    {
      name: 'view',
      type: 'view',
      factory: function() { return foam.ui.TextFieldView.create({displayWidth:this.width, cssClass: 'foamSearchTextField'}); }
    },
    {
      name: 'label',
      type: 'String',
      defaultValueFn: function() { return this.property.label; }
    }
  ],

  methods: {
    toHTML: function() {
      return '<div class="foamSearchView">' +
        '<div class="foamSearchViewLabel">' +
        this.label +
        '</div>' +
        this.view.toHTML() + '</div>' +
        '<div id=' + this.on('click', this.clear) + ' style="text-align:right;width:100%;float:right;margin-bottom:20px;" class="searchTitle"><font size=-1><u>Clear</u></font></div>';
    },
    initHTML: function() {
      this.SUPER();
      this.view.initHTML();

      this.view.data$.addListener(this.updateValue);
    }
  },

  listeners:
  [
    {
      name: 'updateValue',
      code: function() {
        var value = this.view.data;
        if ( ! value ) {
          this.predicate = TRUE;
          return;
        }
        this.predicate = CONTAINS_IC(this.property, value);
      }
    },
    {
      name: 'clear',
      code: function() {
        this.view.data = '';
        this.predicate = TRUE;
      }
    }
  ]
});
