/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  name: 'StatusAutocompleteView',
  package: 'foam.apps.quickbug.ui',
  extends: 'foam.ui.AutocompleteView',

  requires: [
    'foam.ui.ChoiceListView'
  ],

  methods: {
    makeView: function() {
      var completer = this.completer;
      var strToHTML = this.strToHTML.bind(this);
      return this.ChoiceListView.create({
        dao: this.completer.autocompleteDao$Proxy,
        extraClassName: 'autocompleteTable autocomplete',
        orientation: 'vertical',
        mode: 'final',
        objToChoice: function(obj) {
          return [completer.f(obj), '<div class="label">' + strToHTML(obj.status) + '</div><div class="description">= ' + strToHTML(obj.description) + '</div>']
        },
        useSelection: true
      });
    }
  }
});
