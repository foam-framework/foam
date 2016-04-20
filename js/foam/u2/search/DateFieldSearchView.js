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
  name: 'DateFieldSearchView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.TextField',
  ],

  documentation: 'Search view for Date-valued properties. Note that this ' +
      'does not autocomplete. Instead, it supports query parser-style ' +
      'syntax, and works cleverly across date ranges. Typing "2015" will ' +
      'filter to dates in that year, for example.',

  properties: [
    {
      name: 'view',
      factory: function() {
        return this.TextField.create({
          prop: this.property,
          inline: true,
        });
      }
    },
    {
      name: 'parser',
      factory: function() {
        var model = Model.create({
          package: 'foam.u2.search.datehack',
          name: 'Field' + this.id,
          properties: [this.property],
        });
        return QueryParserFactory(model);
      }
    },
    {
      name: 'property'
    },
    {
      name: 'name',
      documentation: 'All SearchViews require a name. Defaults to the property name.',
      defaultValueFn: function() { return this.property.name; }
    },
    {
      name: 'filter',
      documentation: 'Pre-filter supplied by the SearchMgr.',
      defaultValue: TRUE
    },
    {
      name: 'predicate',
      documentation: 'My filter for the SearchMgr to read.',
      defaultValue: TRUE
    },
    {
      name: 'label',
      defaultValueFn: function() { return this.property.label; }
    },
    {
      name: 'memento',
    },
  ],

  methods: [
    function clear() {
      this.view.data = '';
    },
    function initE() {
      this.add(this.view);

      this.view.data$.addListener(this.updatePredicate);
      Events.link(this.memento$, this.view.data$);
    },
  ],

  listeners: [
    function updatePredicate(_, __, ___, value) {
      // If the query begins with an operator, we don't need to add one.
      // If it doesn't, we should prepend a colon.
      // As a simple hack, we try to parse with the colon added first, and if it
      // fails we try without it.

      // Strip all whitespace, inside and on the ends.
      value = value.replace(/\s+/g, '');
      if ( ! value ) return TRUE;

      var q = this.parser.parseString(this.property.name + ':' + value);
      if ( ! q ) q = this.parser.parseString(this.property.name + value);
      if ( ! q ) console.warn('Could not parse: "' + value + '"');
      if ( q ) console.log('"' + value + '" -> ' + q.toMQL());
      this.predicate = q || TRUE;
    },
  ]
});
