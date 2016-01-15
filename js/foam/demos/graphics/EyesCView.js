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
  name:  'EyesCView',
  label: 'Eyes',
  extends: 'foam.graphics.CView',

  traits: [ 'foam.ui.Colors' ],

  requires: [ 'foam.demos.graphics.EyeCView' ],

  properties: [
    {
      name: 'r',
      defaultValue: 50
    },
    {
      name:  'leftEye',
      factory: function() {
        return this.EyeCView.create({x:this.r * 65.0 / 50.0, y:85, r: this.r, color: this.RED});
      }
    },
    {
      name:  'rightEye',
      factory: function() {
        return this.EyeCView.create({x:this.r * 65.0 / 50.0 + this.r * 85 / 50, y:88, r: 0.98 * this.r, color: this.YELLOW});
      }
    },
    { name: 'width',  defaultValue: 300 },
    { name: 'height', defaultValue: 200 }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.addChild(this.rightEye);
      this.addChild(this.leftEye);
    },
    watch: function(target) {
      this.leftEye.watch(target);
      this.rightEye.watch(target);
    }
  }
});
