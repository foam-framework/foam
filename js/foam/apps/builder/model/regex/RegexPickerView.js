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
  extends: 'foam.apps.builder.model.ui.TypePickerView',

  requires: [
    'foam.apps.builder.model.regex.EasyRegex',
    'foam.apps.builder.model.regex.ContainsRegex',
    'foam.apps.builder.model.regex.NotContainsRegex',
    'foam.apps.builder.model.regex.MatchesRegex',
    'foam.apps.builder.model.regex.NotMatchesRegex',
    'foam.apps.builder.model.regex.PatternParamView',
  ],

  documentation: function() {/* Use to edit a
    $$DOC{ref:'StringProperty.pattern'}. Allows a user to easily
    pick from several useful regular expressions for pattern matching.
  */},

  properties: [
    {
      name: 'className',
      defaultValue: 'regex-picker-view',
    },
    {
      name: 'typeList',
      lazyFactory: function() {
        return [
          this.EasyRegex,
          this.ContainsRegex,
          this.NotContainsRegex,
          this.MatchesRegex,
          this.NotMatchesRegex,
        ].dao;
      },
    },
    {
      name: 'innerView',
      lazyFactory: function() {
        return function(args, X) {
          var Y = X || this.Y;
          return this.PatternParamView.create({ data: this.data }, Y);
        }
      }
    },
  ],

});
