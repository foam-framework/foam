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
  name: 'GroupAutocompleteSearchView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.TextField',
    'foam.u2.md.CannedQueryCitationView',
    'foam.u2.search.AutocompleteView',
    'foam.u2.search.GroupCompleter',
    'foam.u2.search.GroupSplitCompleter',
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
        return this.TextField.create({
          prop: this.property,
          inline: true,
          autocompleteRowView: this.CannedQueryCitationView,
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
        this.updateDAO();
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
    },
    {
      name: 'autocompleter',
      factory: function() {
        var model = this.GroupCompleter;
        var args = { groups$: this.groups$ };
        if (this.split) {
          model = this.GroupSplitCompleter;
          args.split = this.split;
        }

        return model.create(args, this.Y);
      }
    },
  ],

  methods: [
    function clear() {
      this.view.data = '';
    },
    function initE() {
      this.add(this.view);

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
