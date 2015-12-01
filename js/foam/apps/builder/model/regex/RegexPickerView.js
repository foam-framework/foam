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
  name: 'RegexPickerView',
  package: 'foam.apps.builder.model.regex',
  extends: 'foam.ui.md.DetailView',

  requires: [
    'foam.apps.builder.model.regex.EasyRegex',
    'foam.apps.builder.model.regex.ContainsRegex',
    'foam.apps.builder.model.regex.NotContainsRegex',
    'foam.apps.builder.model.regex.MatchesRegex',
    'foam.apps.builder.model.regex.NotMatchesRegex',
    'foam.ui.md.PopupChoiceView',
  ],

  documentation: function() {/* Use to edit a
    $$DOC{ref:'StringProperty.pattern'}. Allows a user to easily
    pick from several useful regular expressions for pattern matching.
  */},

  properties: [
    {
      name: 'dao',
      lazyFactory: function() {
        return [
          this.EasyRegex,
          this.ContainsRegex,
          this.NotContainsRegex,
          this.MatchesRegex,
          this.NotMatchesRegex,
        ].dao;
      }
    },
    {
      name: 'className',
      defaultValue: 'regex-picker-view',
    },
    {
      name: 'mode',
      defaultValue: 'read-write',
    },
    {
      type: 'ViewFactory',
      name: 'dataTypePicker',
      defaultValue: function(args, X) {
        return this.PopupChoiceView.create({
          data$: this.patternType$,
          dao: this.dao,
          objToChoice: function(obj) {
            return [obj.id, obj.label];
          },
          useSelection: false,
        }, X || this.Y);
      }
    },
    {
      name: 'patternType',
      postSet: function(old, nu) {
        if ( old && nu && ( ! this.data.pattern ||
              ( nu !== this.data.pattern.model_.id )) ) {
          // new property type set, reconstruct:
          var newPattern = this.X.lookup(nu).create(this.data.pattern, this.Y);
          this.data.pattern = newPattern;
          this.patternType = nu;
          //this.updateHTML();
        }
      }
    },
    {
      name: 'data',
      help: 'The property of which to edit the pattern',
      postSet: function(old, nu) {
        console.log("pat",nu && nu.pattern);
        if ( nu && nu.pattern )
          this.patternType = nu.pattern.model_.id;
        else
          this.patternType = 'foam.apps.builder.model.regex.EasyRegex';
      }
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-flex-row-baseline">
          %%dataTypePicker()
          <% if ( this.data && this.data.pattern ) { %>
            $$pattern{ model_: 'foam.apps.builder.model.regex.PatternParamView' }
          <% } %>
        </div>
      </div>
    */},

  ]

});
