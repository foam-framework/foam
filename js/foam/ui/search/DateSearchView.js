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
  package: 'foam.ui.search',
  name: 'DateSearchView',
  extends: 'foam.ui.View',

  requires: [ 'foam.ui.md.DateFieldView' ],

  properties: [
    {
      name: 'model'
    },
    {
      name: 'property'
    },
    {
      name: 'predicate',
      defaultValue: TRUE
    },
    {
      name: 'op',
      defaultValue: EQ
    },
    {
      name: 'label',
      type: 'String',
      defaultValueFn: function() { return this.property.label || 'Search'; }
    },
    {
      name: 'view',
      factory: function() { return this.DateFieldView.create({label: this.label}); }
    },
  ],

  methods: [
    function toHTML() {
      return '<div class="foamSearchView">' +
        this.view.toHTML() + '</div>'
        '</div>';
    },
    function initHTML() {
      this.SUPER();
      this.view.initHTML();

      this.view.data$.addListener(this.updateValue);
    }
  ],

  listeners: [
    {
      name: 'updateValue',
      code: function(_, __, ___, date) {
        this.predicate = date ? this.op(this.property, date) : TRUE ;
      }
    },
    {
      name: 'clear',
      code: function() { this.view.data = ''; }
    }
  ]
});
