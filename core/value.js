/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

// TODO: standardize on either get()/set() or .value
var SimpleValue = Model.create({
  name: 'SimpleValue',

  properties: [ { name: 'value' } ],

  methods: {
    init: function(value) { this.value = value || ""; },
    get: function() { return this.value; },
    set: function(val) { this.value = val; },
    toString: function() { return "SimpleValue(" + this.value + ")"; }
  }
});
