/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.u2.md',
  name: 'MDViewOverridesTrait',
  requires: [
    'foam.u2.md.ActionButton',
    'foam.u2.md.Checkbox',
    'foam.u2.md.TextField',
    'foam.u2.md.MultiLineTextField',
    'foam.u2.md.Select'
  ],

  properties: [
  ],

  methods: [
    function init() {
      this.Y.registerModel(this.ActionButton, 'foam.u2.ActionButton');
      this.Y.registerModel(this.Checkbox, 'foam.u2.tag.Checkbox');
      this.Y.registerModel(this.TextField, 'foam.u2.TextField');
      this.Y.registerModel(this.MultiLineTextField, 'foam.u2.MultiLineTextField');
      this.Y.registerModel(this.Select, 'foam.u2.tag.Select');
      this.SUPER();
    },
  ]
});
/**
 * @fileoverview Description of this file.
 */
