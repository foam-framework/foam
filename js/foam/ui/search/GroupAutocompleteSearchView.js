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
  name: 'GroupAutocompleteSearchView',
  extends: 'foam.ui.DetailView',

  requires: [
    'foam.ui.autocomplete.GroupCompleter',
    'foam.ui.autocomplete.GroupSplitCompleter',
    'foam.ui.md.CannedQueryCitationView',
    'foam.ui.md.TextFieldView',
  ],

  properties: [
    {
      name: 'split',
      documentation: 'Set to a string to split group values on it.',
      defaultValue: ''
    },
    {
      name: 'view',
      factory: function() {
        return this.TextFieldView.create({
          prop: this.property,
          autocomplete: true,
          acRowView: this.CannedQueryCitationView,
          autocompleter: this.autocompleter
        });
      }
    },
    {
      name: 'dao',
      label: 'DAO',
      required: true,
      factory: function() {
        return [];
      },
      postSet: function(old, nu) {
        if ( this.view.id ) this.updateDAO();
      },
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
      name: 'op',
      defaultValue: CONTAINS_IC
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
    {
      name: 'groups',
      // TODO(braden): I don't think I need to update this list as aggressively
      // as most of the group views. It shouldn't be affected by the incoming
      // filter, I think?
      documentation: 'List of the groups found the last time we updated the DAO.',
      postSet: function(old, nu) {
        if (this.view && this.view.autocompleteView &&
            this.view.autocompleteView.autocompleter) {
          this.view.autocompleteView.autocompleter.dao = nu;
        }
      },
    },
    {
      name: 'autocompleter',
      factory: function() {
        var comp = this.split ?
            this.GroupSplitCompleter.xbind({ split: this.split }) :
            this.GroupCompleter;
        return function(args) {
          if (!args) args = {};
          if (!args.dao) args.dao = this.groups;
          return comp.create(args);
        }.bind(this);
      }
    },
  ],

  methods: [
    function clear() {
      this.view.data = '';
    },
    function toHTML() {
      return this.view.toHTML();
    },
    function initHTML() {
      this.view.initHTML();

      this.dao.listen(this.updateDAO);
      this.view.data$.addListener(this.updatePredicate);
      Events.link(this.memento$, this.view.data$);
    },
  ],

  listeners: [
    {
      name: 'updateDAO',
      isMerged: 100,
      code: function() {
        var self = this;
        // Uses the groups returned by the select query as the basis for its
        // autocomplete. The autocompleter is expecting modeled objects, though.
        // Deliberately ignoring the incoming filter!
        this.dao.select(GROUP_BY(this.property, COUNT()))(function(groups) {
          self.groups = groups.sortedKeys();
        });
      }
    },
    {
      name: 'updatePredicate',
      code: function(_, __, ___, value) {
        this.predicate = value ? this.op(this.property, value) : TRUE;
        this.memento = value;
      }
    },
  ]
});
