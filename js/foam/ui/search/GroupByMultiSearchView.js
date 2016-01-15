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
  name: 'GroupByMultiSearchView',
  extends: 'foam.ui.search.GroupBySearchView',

  requires: [ 'foam.ui.MultiChoiceView' ],

  properties: [
    {
      name: 'view',
      factory: function() {
        return this.MultiChoiceView.create({size:this.size, cssClass: 'foamSearchChoiceView'});
      }
    },
    {
      name: 'op',
      defaultValue: IN
    }
  ],

  methods: [
    function clear() {
      this.view.data = {};
    },
  ],

  listeners: [
    {
      name: 'updateDAO',

      isMerged: 100,
      code: function() {
        var self = this;

        // TODO(braden): Add memento support to these multi-select views.
        this.dao.where(this.filter).select(GROUP_BY(this.property, COUNT()))(function(groups) {
          var options = [];
          var sortedKeys = groups.sortedKeys();
          for (var i = 0 ; i < sortedKeys.length; i++) {
            var key = sortedKeys[i];
            if (typeof key === 'undefined') continue;
            if (key === '') continue;
            var count    = ('(' + groups.groups[key] + ')').intern();
            var subKey   = ('' + key).substring(0, self.width-count.length-3);
            var cleanKey = subKey.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            options.push([key, cleanKey + (Array(self.width-subKey.length-count.length).join(/*'&nbsp;'*/' ')).intern() + count]);
          };

          options.splice(0,0,['','-- CLEAR SELECTIONS --']);
          self.view.choices = options;
        });
      }
    },
    {
      name: 'updatePredicate',
      isFramed: true,
      code: function(_, __, ___, choices) {
        if ( choices[''] ) { this.view.data = {}; return; }
        var keys = Object.keys(choices);
        this.predicate = keys.length ? this.op(this.property, keys) : TRUE ;
      }
    }
  ]
});
