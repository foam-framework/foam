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
  name: 'InverseMatrix4',

  extends: 'foam.graphics.webgl.matrix.Matrix4',

  properties: [
    {
      name: 'source',
      preSet: function(old, nu) {
        if ( old ) { old.removeDirectListener(this); }
        //if ( old ) { old.removeListener(this.reset); }
        return nu;
      },
      postSet: function(old,nu) {
        if ( nu ) { nu.addDirectListener(this); }
//        if ( nu ) { nu.addListener(this.reset); }
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

      this.inverse(this.source.flat);
    },

    function determinant(m) {
      var ret =
        m[12]*m[9]*m[6]*m[3]-
        m[8]*m[13]*m[6]*m[3]-
        m[12]*m[5]*m[10]*m[3]+
        m[4]*m[13]*m[10]*m[3]+
        m[8]*m[5]*m[14]*m[3]-
        m[4]*m[9]*m[14]*m[3]-
        m[12]*m[9]*m[2]*m[7]+
        m[8]*m[13]*m[2]*m[7]+
        m[12]*m[1]*m[10]*m[7]-
        m[0]*m[13]*m[10]*m[7]-
        m[8]*m[1]*m[14]*m[7]+
        m[0]*m[9]*m[14]*m[7]+
        m[12]*m[5]*m[2]*m[11]-
        m[4]*m[13]*m[2]*m[11]-
        m[12]*m[1]*m[6]*m[11]+
        m[0]*m[13]*m[6]*m[11]+
        m[4]*m[1]*m[14]*m[11]-
        m[0]*m[5]*m[14]*m[11]-
        m[8]*m[5]*m[2]*m[15]+
        m[4]*m[9]*m[2]*m[15]+
        m[8]*m[1]*m[6]*m[15]-
        m[0]*m[9]*m[6]*m[15]-
        m[4]*m[1]*m[10]*m[15]+
        m[0]*m[5]*m[10]*m[15];
      return ret;
    },

    function inverse(m) {
      var i = this.instance_.flat;
      var det = this.determinant(m);
      if (det==0) return m.slice();

      i[0]= (-m[13]*m[10]*m[7] +m[9]*m[14]*m[7] +m[13]*m[6]*m[11]
      -m[5]*m[14]*m[11] -m[9]*m[6]*m[15] +m[5]*m[10]*m[15])/det;

      i[4]= ( m[12]*m[10]*m[7] -m[8]*m[14]*m[7] -m[12]*m[6]*m[11]
      +m[4]*m[14]*m[11] +m[8]*m[6]*m[15] -m[4]*m[10]*m[15])/det;

      i[8]= (-m[12]*m[9]* m[7] +m[8]*m[13]*m[7] +m[12]*m[5]*m[11]
      -m[4]*m[13]*m[11] -m[8]*m[5]*m[15] +m[4]*m[9]* m[15])/det;

      i[12]=( m[12]*m[9]* m[6] -m[8]*m[13]*m[6] -m[12]*m[5]*m[10]
      +m[4]*m[13]*m[10] +m[8]*m[5]*m[14] -m[4]*m[9]* m[14])/det;

      i[1]= ( m[13]*m[10]*m[3] -m[9]*m[14]*m[3] -m[13]*m[2]*m[11]
      +m[1]*m[14]*m[11] +m[9]*m[2]*m[15] -m[1]*m[10]*m[15])/det;

      i[5]= (-m[12]*m[10]*m[3] +m[8]*m[14]*m[3] +m[12]*m[2]*m[11]
      -m[0]*m[14]*m[11] -m[8]*m[2]*m[15] +m[0]*m[10]*m[15])/det;

      i[9]= ( m[12]*m[9]* m[3] -m[8]*m[13]*m[3] -m[12]*m[1]*m[11]
      +m[0]*m[13]*m[11] +m[8]*m[1]*m[15] -m[0]*m[9]* m[15])/det;

      i[13]=(-m[12]*m[9]* m[2] +m[8]*m[13]*m[2] +m[12]*m[1]*m[10]
      -m[0]*m[13]*m[10] -m[8]*m[1]*m[14] +m[0]*m[9]* m[14])/det;

      i[2]= (-m[13]*m[6]* m[3] +m[5]*m[14]*m[3] +m[13]*m[2]*m[7]
      -m[1]*m[14]*m[7] -m[5]*m[2]*m[15] +m[1]*m[6]* m[15])/det;

      i[6]= ( m[12]*m[6]* m[3] -m[4]*m[14]*m[3] -m[12]*m[2]*m[7]
      +m[0]*m[14]*m[7] +m[4]*m[2]*m[15] -m[0]*m[6]* m[15])/det;

      i[10]=(-m[12]*m[5]* m[3] +m[4]*m[13]*m[3] +m[12]*m[1]*m[7]
      -m[0]*m[13]*m[7] -m[4]*m[1]*m[15] +m[0]*m[5]* m[15])/det;

      i[14]=( m[12]*m[5]* m[2] -m[4]*m[13]*m[2] -m[12]*m[1]*m[6]
      +m[0]*m[13]*m[6] +m[4]*m[1]*m[14] -m[0]*m[5]* m[14])/det;

      i[3]= ( m[9]* m[6]* m[3] -m[5]*m[10]*m[3] -m[9]* m[2]*m[7]
      +m[1]*m[10]*m[7] +m[5]*m[2]*m[11] -m[1]*m[6]* m[11])/det;

      i[7]= (-m[8]* m[6]* m[3] +m[4]*m[10]*m[3] +m[8]* m[2]*m[7]
      -m[0]*m[10]*m[7] -m[4]*m[2]*m[11] +m[0]*m[6]* m[11])/det;

      i[11]=( m[8]* m[5]* m[3] -m[4]*m[9]* m[3] -m[8]* m[1]*m[7]
      +m[0]*m[9]* m[7] +m[4]*m[1]*m[11] -m[0]*m[5]* m[11])/det;

      i[15]=(-m[8]* m[5]* m[2] +m[4]*m[9]* m[2] +m[8]* m[1]*m[6]
      -m[0]*m[9]* m[6] -m[4]*m[1]*m[10] +m[0]*m[5]* m[10])/det;

      //return i;
    },


  ]

});
