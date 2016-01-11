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
  name: 'Cursor',
  package: 'foam.apps.quickbug.model',

  imports: [
    'browser'
  ],

  properties: [
    {
      name: 'location',
      defaultValueFn: function() { return this.browser.location; }
    },
    {
      name: 'dao'
    },
    {
      type: 'Int',
      name: 'pos',
      help: 'Current row number.'
    },
    {
      type: 'Int',
      name: 'total',
      help: 'Total number of rows.'
    },
    {
      name: 'rows',
      factory: function() { return []; }
    },
    {
      name: 'className',
      defaultValue: 'cursor-view'
    }
  ],

  actions: [
    {
      name: 'prev',
      label: '< Prev',
      keyboardShortcuts: [ 37 /* left-arrow */, 75 /* k */ ],
      isEnabled: function() { return this.pos > 1; },
      code: function() {
        this.pos--;
        this.location.id = this.rows[this.pos-1].id;
      }
    },
    {
      name: 'next',
      label: 'Next >',
      keyboardShortcuts: [ 39 /* right-arrow */, 74 /* j */ ],
      isEnabled: function() { return this.pos < this.total; },
      code: function() {
        this.pos++;
        this.location.id = this.rows[this.pos-1].id;
      }
    },
    {
      name: 'backToList',
      label: 'Back',
      code: function() { this.location.id = ''; }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      var self = this;
      var i = 1;
      this.dao.select({
        put: function(o) {
          if ( o.id == self.location.id ) {
            self.pos = i;
          }
          i++;
          self.rows.push(o);
        }})(function() {
          self.total = self.rows.length;
        });
    }
  }
});
