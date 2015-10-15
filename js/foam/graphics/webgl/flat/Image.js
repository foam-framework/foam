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
  package: 'foam.graphics.webgl.flat',
  name: 'Image',
  extends: 'foam.graphics.webgl.flat.Object',

  requires: [
    'foam.graphics.webgl.core.ArrayBuffer',
    'foam.graphics.webgl.core.Shader',
    'foam.graphics.webgl.core.Program',
    'foam.graphics.webgl.matrix.ScaleMatrix4',
    'foam.graphics.webgl.matrix.StackMatrix4',
    'foam.graphics.webgl.matrix.TransMatrix4',
  ],

  properties: [
    {
      name: 'src',
      label: 'Source'
    },
    {
      name: 'translucent',
      defaultValue: true
    },
  ],

  methods: [
    function init() {
      this.SUPER();

      this.image_ = new Image();
      this.image_.onload = function() {
        this.render();
      }.bind(this);
      this.image_.src = this.src;
      this.render();
    },

    function textureSource() {
      /* return the image or video element to extract the texture from */
      return this.image_;
    },

  ]
});
