// === Sylvester ===
// Vector and Matrix mathematics modules for JavaScript
// Copyright (c) 2007 James Coglan
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

CLASS({
  package: 'com.jcoglan.sylvester',
  name: 'Sylvester',

  function documentation() {  /*
    A FOAM version of the Sylvester library's shared constants and methods.
  */},

  constants: {
    version: '0.1.3',
    precision: 1e-6
  },

  methods: [

    function MatrixDiagonal(elements) {
      /* Diagonal matrix - all off-diagonal elements are zero */
      var n = elements.length, k = n, i;
      var M = Matrix.I(n);
      do { i = k - n;
        M.elements[i][i] = elements[i];
      } while (--n);
      return M;
    },

    function MatrixRotation(theta, a) {
      if (!a) {
        return Matrix.create([
          [Math.cos(theta),  -Math.sin(theta)],
          [Math.sin(theta),   Math.cos(theta)]
        ]);
      }
      var axis = a.dup();
      if (axis.elements.length != 3) { return null; }
      var mod = axis.modulus();
      var x = axis.elements[0]/mod, y = axis.elements[1]/mod, z = axis.elements[2]/mod;
      var s = Math.sin(theta), c = Math.cos(theta), t = 1 - c;
      // Formula derived here: http://www.gamedev.net/reference/articles/article1199.asp
      // That proof rotates the co-ordinate system so theta
      // becomes -theta and sin becomes -sin here.
      return Matrix.create([
        [ t*x*x + c, t*x*y - s*z, t*x*z + s*y ],
        [ t*x*y + s*z, t*y*y + c, t*y*z - s*x ],
        [ t*x*z - s*y, t*y*z + s*x, t*z*z + c ]
      ]);
    },

  ],


});
