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
  extends: 'foam.ui.View',

  requires: [ 'foam.ui.TextFieldView' ],

  properties: [
    {
      name: 'model'
    },
    {
      type: 'Boolean',
      name: 'richSearch',
      defaultValue: false
    },
    {
      type: 'Boolean',
      name: 'keywordSearch',
      defaultValue: false
    },
    {
      name: 'queryParser',
      lazyFactory: function() { return QueryParserFactory(this.model, this.keywordSearch); }
    },
    {
      name:  'width',
      type:  'Int',
      defaultValue: 47
    },
    {
      name: 'property'
    },
    {
      name: 'predicate',
      defaultValue: TRUE
    },
    {
      name: 'view',
      factory: function() { return this.TextFieldView.create({displayWidth:this.width, type: 'search', cssClass: 'foamSearchTextField'}); }
    },
    {
      name: 'label',
      type: 'String',
      defaultValueFn: function() { return this.property.label || 'Search'; }
    },
    {
      name: 'memento',
    },
    {
      name: 'name',
      documentation: 'All SearchViews require a name. Defaults to "query".',
      defaultValue: 'query',
    },
  ],

  methods: [
    function toHTML() {
      return '<div class="foamSearchView foamSearchTextView">' +
        '<div class="foamSearchViewLabel">' +
        this.label +
        '</div>' +
        this.view.toHTML() + '</div>'
        '</div>';
    },
    function initHTML() {
      this.SUPER();
      this.view.initHTML();

      this.view.data$.addListener(this.updateValue);
      if (this.memento) {
        this.view.data = this.memento;
      }
    }
  ],

  listeners: [
    {
      name: 'updateValue',
      code: function() {
        var value = this.view.data;
        this.memento = value;
        this.predicate =
          ! value         ? TRUE :
          this.richSearch ? this.queryParser.parseString(value)
                          : CONTAINS_IC(this.property, value) ;
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
