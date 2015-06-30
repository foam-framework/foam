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
  name: 'ShaderProperty',

  extendsModel: 'Property',
  
  properties: [
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'shaderType',
      choices: [
        'fragment',
        'vertex'
      ]
    },
    {
      name: 'source',
      adapt: function(nu) {
        if ( typeof nu === 'function' ) return multiline(nu);
        return nu;
      }
    }
    
    
  ],
  
  methods: [    
    function compile() {
      var shader = gl.createShader(gl.FRAGMENT_SHADER);
      this.gl.shaderSource(shader, this.source);
      this.gl.compileShader(shader);  
      if ( ! gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {  
          console.warn("Shader compile error " + gl.getShaderInfoLog(shader));  
          return null;  
      }
      return shader;
    }
  ]
  
});