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
  name: 'InverseMatrix4',

  properties: [
    {
      name: 'source',
      preSet: function(old, nu) {
        if ( old ) { old[i].removeListener(this.reset); }
        return nu;
      },
      postSet: function(old,nu) {
        if ( nu ) { nu[i].addListener(this.reset); }
        this.reset_();
      }

    }
  ],

  listeners: [
    {
      name: 'reset',
      code: function() { this.reset_(); }
    }
  ],

  methods: [
    function recalculate_() {
      /* Implement in your submodels to calculate and return the contents
          of this matrix.  */
      // Identity
      return this.inverse(this.source);
    },

    function inverse(matrix) {
      var a = this.elementsFromFlat_(matrix.flat);
      var det = this.determinant(a);
      return this.flatFromElements_(this.scaleAdjoint(1.0 / det, a));
    },

    function scaleAdjoint(s,m)
    {
      var a = [[],[],[],[]];
      var i,j;

      for (i=0; i<4; i++) {
        for (j=0; j<4; j++) {
          a[j][i] = this.cofactor(m, i, j) * s;
        }
      }
      return a;
    },

    function determinant(m)
    {
       var d;
       d =  m[0][0] * this.cofactor(m, 0, 0);
       d += m[0][1] * this.cofactor(m, 0, 1);
       d += m[0][2] * this.cofactor(m, 0, 2);
       d += m[0][3] * this.cofactor(m, 0, 3);
       return d;
    },

    function cofactor(m,i,j)
    {
      var f;
      int ii[4], jj[4], k;

      for (k=0; k<i; k++) ii[k] = k;
      for (k=i; k<3; k++) ii[k] = k+1;
      for (k=0; k<j; k++) jj[k] = k;
      for (k=j; k<3; k++) jj[k] = k+1;

      f = m[ii[0]][jj[0]] * (m[ii[1]][jj[1]]*m[ii[2]][jj[2]]
        - m[ii[1]][jj[2]]*m[ii[2]][jj[1]]);
      f -= m[ii[0]][jj[1]] * (m[ii[1]][jj[0]]*m[ii[2]][jj[2]]
        - m[ii[1]][jj[2]]*m[ii[2]][jj[0]]);
      f += m[ii[0]][jj[2]] * (m[ii[1]][jj[0]]*m[ii[2]][jj[1]]
        - m[ii[1]][jj[1]]*m[ii[2]][jj[0]]);

      k = i+j;
      if ( k != (k/2)*2) {
        f = -f;
      }
      return f;
    }



  ]

});
