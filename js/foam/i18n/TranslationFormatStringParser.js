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
  package: 'foam.i18n',
  name: 'TranslationFormatStringParser',
  properties: [
    {
      name: 'value',
      factory: function() {
        return 'Hello ${toName} from ${fromName}';
      },
      postSet: function(_, s) {
        this.matches = {};
        this.parsedValue = this.valueParser.parseString(s);
        this.parsedTranslationHint = this.translationHintParser.parseString(s);
      }
    },
    {
      name: 'valueParser',
      hidden: true,
      factory: function() {
        return this.createParser(function(a) {
          if (this.matches[a[1]]) {
            return this.matches[a[1]];
          } else {
            var value = '%' + (Object.keys(this.matches).length + 1) + '$' +
                this.stringSymbol;
            this.matches[a[1]] = value;
            return value;
          }
        }.bind(this));
      }
    },
    {
      name: 'parsedValue',
    },
    {
      name: 'translationHint',
      factory: function() {
        return '${fromName} is who it was from. ${toName} is who it is to.';
      },
      postSet: function(_, s) {
        this.parsedTranslationHint = this.translationHintParser.parseString(s);
      }
    },
    {
      name: 'translationHintParser',
      hidden: true,
      factory: function() {
        return this.createParser(function(a) {
          var value = this.matches[a[1]];
          return value;
        }.bind(this));
      }
    },
    {
      name: 'parsedTranslationHint',
    },
    {
      name: 'matches',
      hidden: true,
    },
    {
      name: 'stringSymbol',
      defaultValue: '@',
    },
  ],
  methods: [
    function createParser(onMatchFn) {
      return {
        __proto__: grammar,
        START: sym('string'),

        string: repeat(
          alt(
            sym('parameter'),
            anyChar)),

        parameter: seq('${', sym('identifier'), '}'),

        identifier: repeat(not('}', anyChar))
      }.addActions({
        parameter: function(a) {
          return onMatchFn(a);
        },
        identifier: function(a) {
          return a.join('');
        },
        string: function(a) {
          return a.join('');
        }
      });
    }
  ],
});
