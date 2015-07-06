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
  package: 'foam.graphics.webgl',
  name: 'Object',
  requires: ['foam.graphics.webgl.SylvesterLib'],
  extendsModel: 'foam.graphics.CView',

  imports: [ 
    'gl',
    'positionMatrix as basePosMatrix',
    'projectionMatrix'
  ],
  exports: [
    'positionMatrix'
  ],

  properties: [
    {
      name: 'positionMatrix'
    },
    {
      name: 'mesh',
      type: 'foam.graphics.webgl.ArrayBuffer'
    },
    {
      name: 'program',
    }
  ],

  methods: [
    function init() {
      this.SylvesterLib.create();
    },
    
    function paintSelf() {
      var gl = this.gl;
      if ( ! gl ) return;
      
      this.mesh.bind();

      this.program.use();

// set up shader attributes, using mesh bound above
//            gl.vertexAttribPointer(this.texCoordLocation2, 2, gl.FLOAT, false, 0, 0);
//            gl.enableVertexAttribArray(this.texCoordLocation2);

      this.mesh.draw();
    },
    
  

  ]

});