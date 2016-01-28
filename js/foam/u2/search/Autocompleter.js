/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.u2.search',
  name: 'Autocompleter',

  documentation: 'Basic autocomplete controller. Supports simple ' +
      'autocomplete itself, defaulting to querying by <tt>KEYWORD</tt>. Use ' +
      'this as a base class for other, more sophisticated autocompleters.',

  properties: [
    {
      name: 'dao',
      required: true,
      documentation: 'The DAO to autocomplete against.',
      postSet: function(old, nu) {
        this.onDAOUpdate();
      }
    },
    {
      type: 'String',
      name: 'partial',
      documentation: 'The string the user has entered so far. Usually bound ' +
          'to the contents of a text field.',
      postSet: function(old, nu) {
        this.onUpdate();
      },
    },
    {
      name: 'queryFactory',
      documentation: 'Turns the user\'s string into a DAO query. Defaults to ' +
          '<tt>KEYWORD</tt>.',
      defaultValue: KEYWORD,
      postSet: function(old, nu) {
        this.onUpdate();
      },
    },
    {
      type: 'foam.core.types.DAO',
      name: 'filteredDAO',
      documentation: 'The filtered set of autocomplete results. Usually ' +
          'bound to an autocomplete view. Override onUpdate to control how ' +
          'this DAO is constructed.',
    },
  ],

  methods: [
    function onDAOUpdate() {
      this.onUpdate();
    },
    function onUpdate() {
      if ( ! this.dao ) return;
      this.filteredDAO = this.partial ?
          this.dao.where(this.queryFactory(this.partial)) :
          this.dao;
    }
  ]
});
