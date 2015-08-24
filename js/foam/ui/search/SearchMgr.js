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
  name: 'SearchMgr',

  properties: [
    {
      name: 'views',
      factory: function() { return []; }
    },
    {
      name: 'predicate',
      type: 'Object',
      defaultValue: TRUE,
      postSet: function(old, nu) {
        // Update the memento's fields based on the current views.
        var changed = false;
        this.views && this.views.length && this.views.forEach(function(v, i) {
          if (this.memento[i] !== v.memento) changed = true;
          this.memento[i] = v.memento;
        }.bind(this));
        if (changed) this.propertyChange('memento', '', this.memento);
      },
    },
    {
      name: 'memento',
      factory: function() { return {}; },
      adapt: function(old, nu) {
        return typeof nu === 'string' || typeof nu === 'undefined' ? {} : nu;
      },
      postSet: function(old, nu) {
        if (nu && this.views && this.views.length) {
          var changed = false;
          this.views.forEach(function(v, i) {
            if (nu[i]) {
              changed = true;
              v.memento = nu[i];
            }
          });
          if (changed) this.onViewUpdate();
        }
      }
    },
    {
      name: 'dao',
      postSet: function(_, dao) { this.filteredDAO = dao.where(this.predicate); this.updateViews(); }
    },
    {
      name: 'filteredDAO'
    }
  ],

  methods: [
    function and(views) {
      return AND.apply(null, views.map(function(v) { return v.predicate; })).partialEval();
    },
    function add(view) {
      this.views.push(view);
      view.predicate$.addListener(this.onViewUpdate);
      if (this.memento && this.memento[this.views.length - 1])
        view.memento = this.memento[this.views.length - 1];
      return view;
    },
    function clear() {
      this.views.forEach(function(v) { v.clear(); });
    }
  ],

  listeners: [
    {
      name: 'onViewUpdate',
      isMerged: 10,
      code: function() {
        this.predicate = this.and(this.views);
        this.filteredDAO = this.dao.where(this.predicate);

        this.updateViews();
      }
    },
    {
      name: 'updateViews',
      isMerged: 20,
      code: function() {
        // Less important than updating main view, so delay
        // TODO: don't update source
        for ( var i = 0; i < this.views.length; i++ )
          this.views[i].dao = this.dao.where(this.and(
            this.views.filter(function(_,j) { return j !== i; })));
      }
    }
  ]
});
