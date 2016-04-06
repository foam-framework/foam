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
  package: 'foam.core',
  name: 'EnumValue',
  properties: [
    {
      type: 'String',
      name: 'name',
      defaultValueFn: function() { return constantize(this.label); }
    },
    {
      type: 'String',
      name: 'description',
    },
    {
      type: 'Int',
      name: 'index'
    },
    {
      name: 'value',
      defaultValueFn: function() { return undefined; },
    },
    {
      name: 'javaValue',
      defaultValueFn: function() {
        if (typeof this.value == 'string') {
          return '"' + this.value + '"';
        }
        return this.value;
      },
    },
    {
      name: 'swiftValue',
      defaultValueFn: function() {
        if (this.value === undefined) return this.index;
        if (typeof this.value == 'string') {
          return '"' + this.value + '"';
        }
        return this.value;
      },
    },
    {
      type: 'String',
      name: 'label',
    },
    {
      name: 'javaLabel',
      defaultValueFn: function() {
        var label = this.label || this.name;
        return '"' + label + '"';
      },
    },
    {
      name: 'swiftLabel',
      defaultValueFn: function() {
        if (this.label) {
          return 'NSLocalizedString("' + this.label + '", ' +
              'comment: "' + this.description + '")';
        } else {
          return '"' + this.name + '"';
        }
      },
    },
  ]
});
