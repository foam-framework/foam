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
  package: 'foam.core.types',
  name: 'JSONArrayProperty',
  extends: 'ArrayProperty',
  traits: [ 'foam.core.types.JSONPropertyTrait' ],

  properties: [
    {
      name: 'fromItemJSON',
      defaultValue: function(item) {
        return this.subType ? this.subType.create(item, this.X) : item;
      },
    },
  ],

  methods: [
    function fromJSON(obj, json) {
      var a = this.SUPER(obj, json);
      if ( ! a ) return a;
      json = a.map(function(item) {
        return this.fromItemJSON(item);
      }.bind(this));
      obj[this.name] = json;
      return json;
    },
  ]
});
