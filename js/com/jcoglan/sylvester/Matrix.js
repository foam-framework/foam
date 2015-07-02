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
  name: 'Matrix',
  extendsModel: 'com.jcoglan.sylvester.SylBase',

  requires: [ 'com.jcoglan.sylvester.Sylvester' ],

  function documentation() {  /*
    A FOAM version of the Sylvester library's this.model_.
  */},

  properties: [
    {
      name: 'elements',
      function factory() { return []; }
    }
  ],


  methods: [
    function init(elems) {
      /* Default initialize allows this.Martix.create([0,0,0]); */
      this.elements = elems;
    }

    // Returns element (i,j) of the matrix
    function e(i,j) {
      if (i < 1 || i > this.elements.length || j < 1 || j > this.elements[0].length) { return null; }
      return this.elements[i-1][j-1];
    },

    // Returns row k of the matrix as a vector
    function row(i) {
      if (i > this.elements.length) { return null; }
      return this.Vector.create(this.elements[i-1]);
    },

    // Returns column k of the matrix as a vector
    function col(j) {
      if (j > this.elements[0].length) { return null; }
      var col = [], n = this.elements.length, k = n, i;
      do { i = k - n;
        col.push(this.elements[i][j-1]);
      } while (--n);
      return this.Vector.create(col);
    },

    // Returns the number of rows/columns the matrix has
    function dimensions() {
      return {rows: this.elements.length, cols: this.elements[0].length};
    },

    // Returns the number of rows in the matrix
    function rows() {
      return this.elements.length;
    },

    // Returns the number of columns in the matrix
    function cols() {
      return this.elements[0].length;
    },

    // Returns true iff the matrix is equal to the argument. You can supply
    // a vector as the argument, in which case the receiver must be a
    // one-column matrix equal to the vector.
    function eql(matrix) {
      var M = matrix.elements || matrix;
      if (typeof(M[0][0]) == 'undefined') { M = this.model_.create(M).elements; }
      if (this.elements.length != M.length ||
          this.elements[0].length != M[0].length) { return false; }
      var ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
      do { i = ki - ni;
        nj = kj;
        do { j = kj - nj;
          if (Math.abs(this.elements[i][j] - M[i][j]) > Sylvester.precision) { return false; }
        } while (--nj);
      } while (--ni);
      return true;
    },

    // Returns a copy of the matrix
    function dup() {
      return this.model_.create(this.elements);
    },

    // Maps the matrix to another matrix (of the same dimensions) according to the given function
    function map(fn) {
      var els = [], ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
      do { i = ki - ni;
        nj = kj;
        els[i] = [];
        do { j = kj - nj;
          els[i][j] = fn(this.elements[i][j], i + 1, j + 1);
        } while (--nj);
      } while (--ni);
      return this.model_.create(els);
    },

    // Returns true iff the argument has the same dimensions as the matrix
    function isSameSizeAs(matrix) {
      var M = matrix.elements || matrix;
      if (typeof(M[0][0]) == 'undefined') { M = this.model_.create(M).elements; }
      return (this.elements.length == M.length &&
          this.elements[0].length == M[0].length);
    },

    // Returns the result of adding the argument to the matrix
    function add(matrix) {
      var M = matrix.elements || matrix;
      if (typeof(M[0][0]) == 'undefined') { M = this.model_.create(M).elements; }
      if (!this.isSameSizeAs(M)) { return null; }
      return this.map(function(x, i, j) { return x + M[i-1][j-1]; });
    },

    // Returns the result of subtracting the argument from the matrix
    function subtract(matrix) {
      var M = matrix.elements || matrix;
      if (typeof(M[0][0]) == 'undefined') { M = this.model_.create(M).elements; }
      if (!this.isSameSizeAs(M)) { return null; }
      return this.map(function(x, i, j) { return x - M[i-1][j-1]; });
    },

    // Returns true iff the matrix can multiply the argument from the left
    function canMultiplyFromLeft(matrix) {
      var M = matrix.elements || matrix;
      if (typeof(M[0][0]) == 'undefined') { M = this.model_.create(M).elements; }
      // this.columns should equal matrix.rows
      return (this.elements[0].length == M.length);
    },

    // Returns the result of multiplying the matrix from the right by the argument.
    // If the argument is a scalar then just multiply all the elements. If the argument is
    // a vector, a vector is returned, which saves you having to remember calling
    // col(1) on the result.
    function multiply(matrix) {
      if (!matrix.elements) {
        return this.map(function(x) { return x * matrix; });
      }
      var returnVector = matrix.modulus ? true : false;
      var M = matrix.elements || matrix;
      if (typeof(M[0][0]) == 'undefined') { M = this.model_.create(M).elements; }
      if (!this.canMultiplyFromLeft(M)) { return null; }
      var ni = this.elements.length, ki = ni, i, nj, kj = M[0].length, j;
      var cols = this.elements[0].length, elements = [], sum, nc, c;
      do { i = ki - ni;
        elements[i] = [];
        nj = kj;
        do { j = kj - nj;
          sum = 0;
          nc = cols;
          do { c = cols - nc;
            sum += this.elements[i][c] * M[c][j];
          } while (--nc);
          elements[i][j] = sum;
        } while (--nj);
      } while (--ni);
      var M = this.model_.create(elements);
      return returnVector ? M.col(1) : M;
    },

    function x(matrix) { return this.multiply(matrix); },

    // Returns a submatrix taken from the matrix
    // Argument order is: start row, start col, nrows, ncols
    // Element selection wraps if the required index is outside the matrix's bounds, so you could
    // use this to perform row/column cycling or copy-augmenting.
    function minor(a, b, c, d) {
      var elements = [], ni = c, i, nj, j;
      var rows = this.elements.length, cols = this.elements[0].length;
      do { i = c - ni;
        elements[i] = [];
        nj = d;
        do { j = d - nj;
          elements[i][j] = this.elements[(a+i-1)%rows][(b+j-1)%cols];
        } while (--nj);
      } while (--ni);
      return this.model_.create(elements);
    },

    // Returns the transpose of the matrix
    function transpose() {
      var rows = this.elements.length, cols = this.elements[0].length;
      var elements = [], ni = cols, i, nj, j;
      do { i = cols - ni;
        elements[i] = [];
        nj = rows;
        do { j = rows - nj;
          elements[i][j] = this.elements[j][i];
        } while (--nj);
      } while (--ni);
      return this.model_.create(elements);
    },

    // Returns true iff the matrix is square
    function isSquare() {
      return (this.elements.length == this.elements[0].length);
    },

    // Returns the (absolute) largest element of the matrix
    function max() {
      var m = 0, ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
      do { i = ki - ni;
        nj = kj;
        do { j = kj - nj;
          if (Math.abs(this.elements[i][j]) > Math.abs(m)) { m = this.elements[i][j]; }
        } while (--nj);
      } while (--ni);
      return m;
    },

    // Returns the indeces of the first match found by reading row-by-row from left to right
    function indexOf(x) {
      var index = null, ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
      do { i = ki - ni;
        nj = kj;
        do { j = kj - nj;
          if (this.elements[i][j] == x) { return {i: i+1, j: j+1}; }
        } while (--nj);
      } while (--ni);
      return null;
    },

    // If the matrix is square, returns the diagonal elements as a vector.
    // Otherwise, returns null.
    function diagonal() {
      if (!this.isSquare) { return null; }
      var els = [], n = this.elements.length, k = n, i;
      do { i = k - n;
        els.push(this.elements[i][i]);
      } while (--n);
      return this.Vector.create(els);
    },

    // Make the matrix upper (right) triangular by Gaussian elimination.
    // This method only adds multiples of rows to other rows. No rows are
    // scaled up or switched, and the determinant is preserved.
    function toRightTriangular() {
      var M = this.dup(), els;
      var n = this.elements.length, k = n, i, np, kp = this.elements[0].length, p;
      do { i = k - n;
        if (M.elements[i][i] == 0) {
          for (j = i + 1; j < k; j++) {
            if (M.elements[j][i] != 0) {
              els = []; np = kp;
              do { p = kp - np;
                els.push(M.elements[i][p] + M.elements[j][p]);
              } while (--np);
              M.elements[i] = els;
              break;
            }
          }
        }
        if (M.elements[i][i] != 0) {
          for (j = i + 1; j < k; j++) {
            var multiplier = M.elements[j][i] / M.elements[i][i];
            els = []; np = kp;
            do { p = kp - np;
              // Elements with column numbers up to an including the number
              // of the row that we're subtracting can safely be set straight to
              // zero, since that's the point of this routine and it avoids having
              // to loop over and correct rounding errors later
              els.push(p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier);
            } while (--np);
            M.elements[j] = els;
          }
        }
      } while (--n);
      return M;
    },

    function toUpperTriangular() { return this.toRightTriangular(); },

    // Returns the determinant for square matrices
    function determinant() {
      if (!this.isSquare()) { return null; }
      var M = this.toRightTriangular();
      var det = M.elements[0][0], n = M.elements.length - 1, k = n, i;
      do { i = k - n + 1;
        det = det * M.elements[i][i];
      } while (--n);
      return det;
    },

    function det() { return this.determinant(); },

    // Returns true iff the matrix is singular
    function isSingular() {
      return (this.isSquare() && this.determinant() === 0);
    },

    // Returns the trace for square matrices
    function trace() {
      if (!this.isSquare()) { return null; }
      var tr = this.elements[0][0], n = this.elements.length - 1, k = n, i;
      do { i = k - n + 1;
        tr += this.elements[i][i];
      } while (--n);
      return tr;
    },

    function tr() { return this.trace(); },

    // Returns the rank of the matrix
    function rank() {
      var M = this.toRightTriangular(), rank = 0;
      var ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
      do { i = ki - ni;
        nj = kj;
        do { j = kj - nj;
          if (Math.abs(M.elements[i][j]) > Sylvester.precision) { rank++; break; }
        } while (--nj);
      } while (--ni);
      return rank;
    },

    function rk() { return this.rank(); },

    // Returns the result of attaching the given argument to the right-hand side of the matrix
    function augment(matrix) {
      var M = matrix.elements || matrix;
      if (typeof(M[0][0]) == 'undefined') { M = this.model_.create(M).elements; }
      var T = this.dup(), cols = T.elements[0].length;
      var ni = T.elements.length, ki = ni, i, nj, kj = M[0].length, j;
      if (ni != M.length) { return null; }
      do { i = ki - ni;
        nj = kj;
        do { j = kj - nj;
          T.elements[i][cols + j] = M[i][j];
        } while (--nj);
      } while (--ni);
      return T;
    },

    // Returns the inverse (if one exists) using Gauss-Jordan
    function inverse() {
      if (!this.isSquare() || this.isSingular()) { return null; }
      var ni = this.elements.length, ki = ni, i, j;
      var M = this.augment(this.model_.I(ni)).toRightTriangular();
      var np, kp = M.elements[0].length, p, els, divisor;
      var inverse_elements = [], new_element;
      // Matrix is non-singular so there will be no zeros on the diagonal
      // Cycle through rows from last to first
      do { i = ni - 1;
        // First, normalise diagonal elements to 1
        els = []; np = kp;
        inverse_elements[i] = [];
        divisor = M.elements[i][i];
        do { p = kp - np;
          new_element = M.elements[i][p] / divisor;
          els.push(new_element);
          // Shuffle of the current row of the right hand side into the results
          // array as it will not be modified by later runs through this loop
          if (p >= ki) { inverse_elements[i].push(new_element); }
        } while (--np);
        M.elements[i] = els;
        // Then, subtract this row from those above it to
        // give the identity matrix on the left hand side
        for (j = 0; j < i; j++) {
          els = []; np = kp;
          do { p = kp - np;
            els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
          } while (--np);
          M.elements[j] = els;
        }
      } while (--ni);
      return this.model_.create(inverse_elements);
    },

    function inv() { return this.inverse(); },

    // Returns the result of rounding all the elements
    function round() {
      return this.map(function(x) { return Math.round(x); });
    },

    // Returns a copy of the matrix with elements set to the given value if they
    // differ from it by less than Sylvester.precision
    function snapTo(x) {
      return this.map(function(p) {
        return (Math.abs(p - x) <= Sylvester.precision) ? x : p;
      });
    },

    // Returns a string representation of the matrix
    function inspect() {
      var matrix_rows = [];
      var n = this.elements.length, k = n, i;
      do { i = k - n;
        matrix_rows.push(this.Vector.create(this.elements[i]).inspect());
      } while (--n);
      return matrix_rows.join('\n');
    },

    // Set the matrix's elements from an array. If the argument passed
    // is a vector, the resulting matrix will be a single column.
    function setElements(els) {
      var i, elements = els.elements || els;
      if (typeof(elements[0][0]) != 'undefined') {
        var ni = elements.length, ki = ni, nj, kj, j;
        this.elements = [];
        do { i = ki - ni;
          nj = elements[i].length; kj = nj;
          this.elements[i] = [];
          do { j = kj - nj;
            this.elements[i][j] = elements[i][j];
          } while (--nj);
        } while(--ni);
        return this;
      }
      var n = elements.length, k = n;
      this.elements = [];
      do { i = k - n;
        this.elements.push([elements[i]]);
      } while (--n);
      return this;
    },


    // Identity matrix of size n
    function I(n) {
      var els = [], k = n, i, nj, j;
      do { i = k - n;
        els[i] = []; nj = k;
        do { j = k - nj;
          els[i][j] = (i == j) ? 1 : 0;
        } while (--nj);
      } while (--n);
      return Matrix.create(els);
    },

    // Diagonal matrix - all off-diagonal elements are zero
    function Diagonal(elements) {
      var n = elements.length, k = n, i;
      var M = Matrix.I(n);
      do { i = k - n;
        M.elements[i][i] = elements[i];
      } while (--n);
      return M;
    },

    // Rotation matrix about some axis. If no axis is
    // supplied, assume we're after a 2D transform
    function Rotation(theta, a) {
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

    // Special case rotations
    function RotationX(t) {
      var c = Math.cos(t), s = Math.sin(t);
      return Matrix.create([
        [  1,  0,  0 ],
        [  0,  c, -s ],
        [  0,  s,  c ]
      ]);
    },
    function RotationY(t) {
      var c = Math.cos(t), s = Math.sin(t);
      return Matrix.create([
        [  c,  0,  s ],
        [  0,  1,  0 ],
        [ -s,  0,  c ]
      ]);
    },
    function RotationZ(t) {
      var c = Math.cos(t), s = Math.sin(t);
      return Matrix.create([
        [  c, -s,  0 ],
        [  s,  c,  0 ],
        [  0,  0,  1 ]
      ]);
    },

    // Random matrix of n rows, m columns
    function Random(n, m) {
      return Matrix.Zero(n, m).map(
        function() { return Math.random(); }
      );
    },

    // Matrix filled with zeros
    function Zero(n, m) {
      var els = [], ni = n, i, nj, j;
      do { i = n - ni;
        els[i] = [];
        nj = m;
        do { j = m - nj;
          els[i][j] = 0;
        } while (--nj);
      } while (--ni);
      return Matrix.create(els);
    }

  ],

});




