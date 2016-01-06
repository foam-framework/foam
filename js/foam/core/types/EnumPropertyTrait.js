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
  name: 'EnumPropertyTrait',
  package: 'foam.core.types',
  properties: [
    {
      name: 'choices',
      type: 'Array',
      help: 'Array of [value, label] choices.',
      preSet: function(_, a) { return a.map(function(c) { return Array.isArray(c) ? c : [c, c]; }); },
      required: true,
    },
    {
      name: 'view',
      defaultValue: 'foam.ui.ChoiceView',
    },
    {
      name: 'toPropertyE',
      defaultValue: function(X) {
        // TODO(braden): Use a FutureElement for this in the future.
        return X.lookup('foam.u2.tag.Select').create({
          prop: this,
          choices: this.choices,
        }, X);
      }
    },
  ],

  methods: [
    function choiceLabel(value) {
      var vl = this.choices.filter(function(vl) { return vl[0] === value; })[0];

      return vl ? vl[1] : '';
    },
    function choiceValue(label) {
      var vl = this.choices.filter(function(vl) { return vl[1] === label; })[0];
      return vl ? vl[0] : '';
    },
  ],
});
