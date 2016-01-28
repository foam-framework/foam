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
  name: 'GroupBySearchView',
  extends: 'foam.u2.View',

  label: 'GroupBy Search View',

  requires: [ 'foam.u2.md.Select' ],

  properties: [
    {
      name: 'view',
      factory: function() {
        return this.Select.create({
          label: this.label,
          inline: this.inline,
          size: this.size,
        });
      }
    },
    {
      type:  'Int',
      name:  'width',
      defaultValue: 47
    },
    {
      type:  'Int',
      name:  'size',
      defaultValue: 17
    },
    {
      name:  'dao',
      label: 'DAO',
      required: true,
      factory: function() { return []; },
      postSet: function() {
        this.updateDAO();
      }
    },
    {
      name: 'property',
    },
    {
      name: 'name',
      documentation: 'All SearchViews require a name. Defaults to the property name.',
      defaultValueFn: function() { return this.property.name; }
    },
    {
      name: 'op',
      defaultValue: EQ
    },
    {
      name: 'filter',
      defaultValue: TRUE
    },
    {
      name: 'predicate',
      defaultValue: TRUE
    },
    {
      name: 'memento',
    },
    {
      type: 'String',
      name: 'label',
      defaultValueFn: function() { return this.property.label; }
    },
    {
      name: 'inline',
      defaultValue: false
    }
  ],

  methods: [
    function clear() {
      this.view.data = '';
    },
    function initE() {
      this.cls(this.myCls());
      if ( ! this.inline ) {
        this.start('div').cls(this.myCls('label')).add(this.label$).end();
      }
      this.add(this.view);

      this.dao.listen(this.updateDAO);
      this.propertyValue('filter').addListener(this.updateDAO);
      this.view.data$.addListener(this.updatePredicate);
    },
  ],

  listeners: [
    {
      name: 'updateDAO',
      isMerged: 100,
      code: function() {
        var self = this;

        this.dao.where(this.filter).select(GROUP_BY(this.property, COUNT()))(function(groups) {
          var options = [];
          var selected;
          var sortedKeys = groups.sortedKeys();
          for (var i = 0 ; i < sortedKeys.length; i++) {
            var key = sortedKeys[i];
            if (typeof key === 'undefined') continue;
            if (key === '') continue;
            var count    = ('(' + groups.groups[key] + ')').intern();
            var subKey   = ('' + key).substring(0, self.width-count.length-3);
            var cleanKey = subKey.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            if (self.memento && self.memento === '' + key) {
              selected = key;
            }
            options.push([key, cleanKey + (Array(self.width-subKey.length-count.length).join(/*'&nbsp;'*/' ')).intern() + count]);
          }

          options.splice(0,0,['','--']);

          if (typeof selected === 'undefined' && self.memento) {
            // If we were provided with a memento, but couldn't find that key,
            // we inject it as a new key and filter on it.
            options.splice(1, 0, [self.memento, self.memento + '(0)']);
            selected = self.property.adapt.call(this.property, '', self.memento);
          }
          self.view.choices = options;
          if (typeof selected !== 'undefined') {
            var oldData = self.view.data;
            self.view.data = selected;
            if (typeof oldData === 'undefined' || oldData === '')
              self.updatePredicate(null, null, null, selected);
          }
        });
      }
    },
    {
      name: 'updatePredicate',
      code: function(_, __, ___, choice) {
        var exists = typeof choice !== 'undefined' && choice !== '';
        this.predicate = exists ? this.op(this.property, choice) : TRUE ;
        this.memento = exists ? '' + choice : '';
      }
    }
  ]
});
