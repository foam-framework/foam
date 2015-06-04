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
      factory() { return []; }
    },
    {
      name: 'dao'
    },
    {
      name: 'filteredDAO'
    },
    {
      name: 'predicate',
      type: 'Object',
      defaultValue: TRUE
    }
  ],

  methods: [
    function and(views) {
      return AND(map(function(v) { return v.predicate; })).partialEval();
    },
    function add(view) {
      this.views.push(view);
      view.predicate$.addListener(this.onViewUpdate);
      return view;
    },
    function clear() {
      this.views.forEach(function(v) { v.clear(); });
    }
  ],

  listeners: [
    {
      name: 'onViewUpdate',
      isMerged: 50,
      code: function() {
        console.log('viewUpdate: ', this.predicate.toString());

        this.predicate = this.and(this.views);
        this.filteredDAO = this.dao.where(this.predicate);

        this.updateViews();
      }
    },
    {
      name: 'updateViews',
      isMerged: 100,
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
