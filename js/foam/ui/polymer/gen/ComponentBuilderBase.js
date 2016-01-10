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
  name: 'ComponentBuilderBase',
  package: 'foam.ui.polymer.gen',

  imports: [
    'comp'
  ],

  properties: [
    {
      type: 'StringArray',
      name: 'provides',
      factory: function() {
        return [];
      }
    },
    {
      type: 'StringArray',
      name: 'listensTo',
      factory: function() {
        return [];
      }
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        var ret = this.SUPER();
        this.listensTo.forEach(function(propName) {
          Events.dynamicFn(function() {
            var prop = this.comp[propName];
            this.onChange();
          }.bind(this));
        }.bind(this));
        return ret;
      }
    },
    {
      name: 'run',
      code: function() {
        this.dao.put(this.comp);
      }
    }
  ],
  listeners: [
    {
      name: 'onChange',
      code: function() {
        return this.run();
      }
    }
  ]
});
