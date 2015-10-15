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
  package: 'foam.demos.graphics',
  name:  'EyesDemo',

  extends: 'foam.graphics.CView',

  requires: [
//    'foam.demos.graphics.EyeCView as Eyes'
    'foam.demos.graphics.EyesCView as Eyes',
    'foam.input.Mouse'
  ],

  properties: [
    {
      name: 'eyes',
      factory: function() { return this.Eyes.create({x: 200, y: 150}); }
    },
    {
      name: 'mouse',
      factory: function() { return this.Mouse.create(); }
    },
    { name: 'width',  defaultValue: 2000 },
    { name: 'height', defaultValue: 2000 }
  ],

  methods: [
    function initCView() {
      this.addChild(this.eyes);
      this.mouse.connect(this.$);
      this.mouse.addPropertyListener(null, function() {
        this.view.paint();
      }.bind(this));
      this.eyes.watch(this.mouse);
    }
  ]
});
