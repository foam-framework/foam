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
  name: 'Matrix4',

  properties: [
    {
      name: 'flat',
      help: 'The matrix contents in a flat array.',
      getter: function() {
        if ( this.instance_.dirty ) {
          this.recalculate_();
          this.instance_.dirty = false;
        }
        return this.instance_.flat;
      },
      postSet: function() {
        if ( this.identity ) delete this.identity;
      }
    },
    {
      name: 'elements',
      help: 'The matrix contents in an array of row arrays.',
      getter: function() { return this.elementsFromFlat_(this.flat); },
      setter: function(nu) { console.warn("Matrix4: .elements property is read only."); },
      mode: 'read-only'
    },

    {
      name: 'directListeners_',
      factory: function() { return {}; }
    }
  ],

  methods: [
    function init() {
      this.instance_.dirty = true;
      if (!this.instance_.flat) this.instance_.flat = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
    },

    function flatten() {
      /* convenience for backward compatibility */
      return new Float32Array(Array.prototype.slice.call(this.flat));
    },

    function reset_() {
      /* trigger a recalculate on next access,  */
      if ( ! this.instance_.dirty ) {
        this.instance_.dirty = true;
        //this.propertyChange('flat', true, null);
        this.notifyDirectListeners();
      }
    },
    function notify(sender) {
      this.reset_();
    },

    function recalculate_() {
      /* Implement in your submodels to calculate and return the contents
          of this matrix.  */
      // Identity
      this.identity = true;
      this.instance_.flat = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
    },

    function elementsFromFlat_(flat) {
      if ( ! this.instance_.elements ) this.instance_.elements = [[],[],[],[]];
      var e = this.instance_.elements;

      for (var j=0; j < 4; ++j) {
        for (var i=0; i < 4; ++i) {
          e[i][j] = flat[i + j*4];
        }
      }

      return e;
    },

    function flatFromElements_(els) {
      var flat = new Float32Array(16);

      for (var j=0; j < 4; ++j) {
        for (var i=0; i < 4; ++i) {
          flat[i + j*4] = els[i][j];
        }
      }

      return flat;
    },

    function multiply(src, by, into) {
       /* multiply 'src' * 'by', results written to 'into' */
       if ( ! into ) into = [];

      into[0] = src[0] * by[0]+src[1] * by[4]+src[2] * by[8]+src[3] * by[12];
      into[1] = src[0] * by[1]+src[1] * by[5]+src[2] * by[9]+src[3] * by[13];
      into[2] = src[0] * by[2]+src[1] * by[6]+src[2] * by[10]+src[3] * by[14];
      into[3] = src[0] * by[3]+src[1] * by[7]+src[2] * by[11]+src[3] * by[15];
      into[4] = src[4] * by[0]+src[5] * by[4]+src[6] * by[8]+src[7] * by[12];
      into[5] = src[4] * by[1]+src[5] * by[5]+src[6] * by[9]+src[7] * by[13];
      into[6] = src[4] * by[2]+src[5] * by[6]+src[6] * by[10]+src[7] * by[14];
      into[7] = src[4] * by[3]+src[5] * by[7]+src[6] * by[11]+src[7] * by[15];
      into[8] = src[8] * by[0]+src[9] * by[4]+src[10] * by[8]+src[11] * by[12];
      into[9] = src[8] * by[1]+src[9] * by[5]+src[10] * by[9]+src[11] * by[13];
      into[10] = src[8] * by[2]+src[9] * by[6]+src[10] * by[10]+src[11] * by[14];
      into[11] = src[8] * by[3]+src[9] * by[7]+src[10] * by[11]+src[11] * by[15];
      into[12] = src[12] * by[0]+src[13] * by[4]+src[14] * by[8]+src[15] * by[12];
      into[13] = src[12] * by[1]+src[13] * by[5]+src[14] * by[9]+src[15] * by[13];
      into[14] = src[12] * by[2]+src[13] * by[6]+src[14] * by[10]+src[15] * by[14];
      into[15] = src[12] * by[3]+src[13] * by[7]+src[14] * by[11]+src[15] * by[15];


      return into;
    },
    function x(matrix) {
      return this.model_.create({ flat: this.multiply(this.flat, matrix.flat) });
    },

    function copyMatrixInto_(m, into) {
      var i = 0;
      for (; i< 16; ++i) {
        into[i] = m[i];
      }
    },

    function resetToIdentity_(f) {
      f[0] = 1; f[1] = 0; f[2] = 0; f[3] = 0;
      f[4] = 0; f[5] = 1; f[6] = 0; f[7] = 0;
      f[8] = 0; f[9] = 0; f[10] = 1;f[11] = 0;
      f[12] = 0;f[13] = 0;f[14] = 0;f[15] = 1;
    },

    function toString() {
      var f = this.flat;
      return "[\t"+f[0]+",\t\t\t"+f[1]+",\t\t\t"+f[2]+",\t\t\t"+f[3]+"\n"+
             "\t"+f[4]+",\t\t\t"+f[5]+",\t\t\t"+f[6]+",\t\t\t"+f[7]+"\n"+
             "\t"+f[8]+",\t\t\t"+f[9]+",\t\t\t"+f[10]+",\t\t\t"+f[11]+"\n"+
             "\t"+f[12]+",\t\t\t"+f[13]+",\t\t\t"+f[14]+",\t\t\t"+f[15]+"]";
    },

    function addDirectListener(obj) {
      this.directListeners_[obj.$UID] = obj;
    },
    function removeDirectListener(obj) {
      delete this.directListeners_[obj.$UID];
    },
    function notifyDirectListeners() {
      for (var key in this.instance_.directListeners_)
      {
        var listener = this.instance_.directListeners_[key];
        listener.notify && listener.notify(this);
      }
    },


  ]

});
