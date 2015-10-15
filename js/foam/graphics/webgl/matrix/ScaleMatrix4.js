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
  package: 'foam.graphics.webgl.matrix',
  name: 'ScaleMatrix4',
  extends: 'foam.graphics.webgl.matrix.Matrix4',

  properties: [
    {
      name: 'sx',
      help: 'The x scale factor',
      defaultValue: 1.0,
      postSet: function() { this.reset_(); }
    },
    {
      name: 'sy',
      help: 'The y scale factor',
      defaultValue: 1.0,
      postSet: function() { this.reset_(); }
    },
    {
      name: 'sz',
      help: 'The z scale factor',
      defaultValue: 1.0,
      postSet: function() { this.reset_(); }
    },
  ],

  methods: [
    function recalculate_() {
      /* Implement in your submodels to calculate and return the contents
          of this matrix.  */
      var out = this.instance_.flat;
      
      out[0] = this.sx;
      out[5] = this.sy;
      out[10] = this.sz;
    },
  ]

});
