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
  name: 'Matrix4Uniform',
  imports: [
    'gl$',
  ],

  properties: [
    {
      name: 'name',
      postSet: function() {
        this.updateUniform();
      }
    },
    {
      name: 'program',
      postSet: function(old, nu) {
        if (old) old.program$.removeListener(this.updateUniform);
        if (nu)  nu.program$.addListener(this.updateUniform);
        this.updateUniform();
      }
    },
    {
      name: 'matrix',
      postSet: function(old, nu) {
//         if (old && old.flat$) old.flat$.removeListener(this.updateValue);
//         if (nu && nu.flat$) nu.flat$.addListener(this.updateValue);
        if (old ) old.removeDirectListener(this);
        if (nu ) nu.addDirectListener(this);
        this.updateValue();
      }
    },
    {
      name: 'uniform_'
    },
    {
      name: 'gl',
      postSet: function() {
        this.X.setTimeout(function() {
          this.updateUniform();
          this.updateValue();
        }.bind(this), 16);
      }
    },
  ],

  methods: [
    function notify(sender) {
      this.updateValue();
    }
  ],

  listeners: [
    {
      name: 'updateValue',
      framed: true,
      code: function() {
        if ( ! this.gl ) return;
        if ( ! this.uniform_ ) this.updateUniform();
        this.program.use();
        this.gl.uniformMatrix4fv(this.uniform_, false, this.matrix.flat);
      }
    },
    {
      name: 'updateUniform',
      code: function() {
        if ( ! this.program || ! this.gl ) return;
        this.uniform_ = this.gl.getUniformLocation(this.program.program, this.name);
      }
    }

  ],


});

