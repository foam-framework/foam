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
  name: 'SearchMgr',

  properties: [
    {
      name: 'views',
      factory: function() { return {}; }
    },
    {
      name: 'predicate',
      defaultValue: TRUE,
      postSet: function(old, nu) {
        // Update the memento's fields based on the current views.
        var changed = false;
        Object_forEach(this.views, function(view, key) {
          if (this.memento[key] !== view.memento) changed = true;
          this.memento[key] = view.memento;
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
        if (nu && this.views) {
          var changed = false;
          Object_forEach(this.views, function(v, k) {
            if (nu[k]) {
              changed = true;
              v.memento = nu[k];
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
      return AND.apply(null, Object.keys(views).map(function(k) { return views[k].predicate; })).partialEval();
    },
    function add(view) {
      // Check the view's name, and if it's a duplicate, change the name to add
      // a number.
      if (this.views[view.name]) {
        var num = 2;
        while (this.views[view.name + '_' + num]) {
          num++;
        }
        view.name = view.name + '_' + num;
      }

      this.views[view.name] = view;
      view.predicate$.addListener(this.onViewUpdate);
      if (this.memento && this.memento[view.name])
        view.memento = this.memento[view.name];
      this.updateViews();
      return view;
    },
    function remove(view_or_name) {
      var view, name;
      if (typeof view_or_name === 'string') {
        name = view_or_name;
        view = this.views[view_or_name];
      } else {
        view = view_or_name;
        name = view.name;
      }

      if (!this.views[name]) return;

      view.clear();
      view.predicate$.removeListener(this.onViewUpdate);
      if (this.memento && this.memento[name]) {
        delete this.memento[name];
      }

      delete this.views[name];
    },
    function removeAll() {
      this.clear();
      Object_forEach(this.views, function(v) {
        v.predicate$.removeListener(this.onViewUpdate);
      }.bind(this));
      this.views = {};
    },
    function clear() {
      Object_forEach(this.views, function(v) { v.clear(); });
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
        Object_forEach(this.views, function(view, name) {
          var temp = {};
          Object_forEach(this.views, function(v, n) {
            if (name === n) return;
            temp[n] = v;
          });
          this.views[name].dao = this.dao.where(this.and(temp));
        }.bind(this));
      }
    }
  ]
});
