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
        if ( ! this.instance_.flat ) {
          this.instance_.flat = this.recalculate_();
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
    function flatten() {
      /* convenience for backward compatibility */
      return this.flat.slice();
    },

    function reset_() {
      if ( this.instance_.flat ) {
        /* trigger a recalculate on next access */
        this.instance_.flat = null;
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
      return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1].slice();
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
      var flat = [];

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
      for (var j=0; j < 4; ++j) {
        for (var i=0; i < 4; ++i) {
          into[i + j*4] = 0;
          for (var k = 0; k < 4; ++k) {
//            console.log("M: ", i,",",j,"  ",j*4 + k,i + k*4);
            into[i + j*4] += src[j*4 + k] * by[i + k*4];
          }
        }
      }
      return into;
    },
    function x(matrix) {
      return this.model_.create({ flat: this.multiply(this.flat, matrix.flat) });
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
