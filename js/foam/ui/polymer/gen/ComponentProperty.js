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
  name: 'ComponentProperty',
  package: 'foam.ui.polymer.gen',

  requires: [
    'foam.ui.MultiLineStringArrayView'
  ],

  imports: [
    'ELLIPSIS',
    'shortenURL'
  ],

  ids: ['id'],

  properties: [
    {
      name: 'id',
      getter: function() {
        return this.url + '?' + this.name;
      },
      hidden: true
    },
    {
      type: 'String',
      name: 'url',
      tableFormatter: function(url, self, tableView) {
        return self.shortenURL(url);
      },
      required: true
    },
    {
      type: 'String',
      name: 'name',
      required: true
    },
    {
      type: 'String',
      name: 'propertyModel'
    },
    {
      name: 'defaultValue',
      defaultValue: undefined
    },
    {
      type: 'Function',
      name: 'factory',
      defaultValue: null
    },
    {
      type: 'StringArray',
      name: 'importHints',
      view: 'foam.ui.MultiLineStringArrayView',
      factory: function() { return []; }
    }
  ]
});
