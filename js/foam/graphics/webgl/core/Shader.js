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
  package: 'foam.graphics.webgl.core',
  name: 'Shader',

  imports: [
    'gl$'
  ],

  properties: [
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'type',
      choices: [
        'fragment',
        'vertex'
      ]
    },
    {
      name: 'source',
      adapt: function(old,nu) {
        if ( typeof nu === 'function' ) return multiline(nu);
        return nu;
      },
      postSet: function(old,nu) {
        if ( ! equals(old, nu) ) {
          this.destroy();
        }
      }
    },
    {
      name: 'shader',
      getter: function() {
        if ( ! this.instance_.shader ) {
          this.compile();
        }
        return this.instance_.shader;
      }
    },
    {
      name: 'uniformVariables',
      type: 'StringArray'
    },
    {
      name: 'attributeVariables',
      type: 'StringArray'
    }
  ],

  methods: [
    function enable() {
      /* bind the attributes or uniform variables */

    },
    function compile() {
      var shader = this.type == 'fragment' ? this.gl.createShader(this.gl.FRAGMENT_SHADER) : this.gl.createShader(this.gl.VERTEX_SHADER);
      this.gl.shaderSource(shader, this.source);
      this.gl.compileShader(shader);
      if ( ! this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS) ) {
        console.warn("Shader compile error " + this.gl.getShaderInfoLog(shader));
        return null;
      }
      this.shader = shader;
      return this.shader;
    },
    function destroy() {
      if ( this.instance_.shader ) {
        this.gl.deleteShader(this.instance_.shader);
        delete this.instance_.shader;
      }
    }
  ]

});