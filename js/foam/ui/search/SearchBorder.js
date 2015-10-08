/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
  name: 'SearchBorder',

  requires: [ 'foam.ui.search.SearchView' ],

  properties: [
    {
      name: 'dao',
    },
    {
      name: 'model',
    },
    {
      name: 'view',
      factory: function() {
        return this.SearchView.create({
          dao: this.dao,
          model: this.model
        });
      }
    }
  ],

  methods: [
    function decorateObject(object) {
      this.view.addPropertyListener(
        'predicate',
        function(border, _, __, pred) {
          object.dao = border.dao.where(pred);
        });
    },

    function toHTML(border, delegate, args) {
      this.addChild(border.view);
      return border.view.toHTML() + delegate();
    }
  ]
});
