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
  package: 'foam.apps.calc',
  name: 'Unary',
  extends: 'Action',
  properties: [
    'f',
    { name: 'longName', defaultValueFn: function() { return this.name; } },
    {
      name: 'translationHint',
      defaultValueFn: function() { return this.longName ? 'short form for mathematical function: "' + this.longName + '"' : '' ;}
    },
    [ 'code', function(_, action) {
      this.op = action.f;
      this.push(action.f.call(this, this.a2));
      this.editable = false;
    }],
    {
      name: 'label',
      defaultValueFn: function() { return this.name; }
    }
  ],
  methods: [
    function init() {
      this.SUPER();
      this.f.label = '<span aria-label="' + this.speechLabel + '">' + this.label + '</span>';
      this.f.unary = true;
    }
  ]
});
