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
  name: 'Vector',
  extendsModel: 'com.jcoglan.sylvester.SylBase',

  requires: [ 'com.jcoglan.sylvester.Sylvester' ],

  function documentation() {  /*
    A FOAM version of the Sylvester library's Vector.
  */},

  properties: [
    {
      name: 'elements',
      function factory() { return []; }
    },
    {
      name: 'i',
      function lazyFactory() { return this.model_.create({elements:[1,0,0]},this.X); }
    },
    {
      name: 'j',
      function lazyFactory() { return this.model_.create({elements:[0,1,0]},this.X); }
    },
    {
      name: 'k',
      function lazyFactory() { return this.model_.create({elements:[0,0,1]},this.X); }
    }
  ],

// // Constructor function
// Vector.create = function(elements) {
//   var V = new Vector();
//   return V.setElements(elements);
// };

  methods: [
    function init(elems) {
      /* Default initialize allows this.Vector.create([0,0,0]); */
      this.elements = elems;
    }

    function Random(n) {
      /* Random vector of size n */
      var elements = [];
      do {
        elements.push(Math.random());
      } while (--n);
      return this.model_.create({elements:elements}, this.X);
    },

    function Zero(n) {
      /* Vector filled with zeros */
      var elements = [];
      do { elements.push(0);
      } while (--n);
      return this.model_.create({elements:elements});
    },

    // Returns element i of the vector
    function e(i) {
      return (i < 1 || i > this.elements.length) ? null : this.elements[i-1];
    },

    // Returns the number of elements the vector has
    function dimensions() {
      return this.elements.length;
    },

    // Returns the modulus ('length') of the vector
    function modulus() {
      return Math.sqrt(this.dot(this));
    },

    // Returns true iff the vector is equal to the argument
    function eql(vector) {
      var n = this.elements.length;
      var V = vector.elements || vector;
      if (n != V.length) { return false; }
      do {
        if (Math.abs(this.elements[n-1] - V[n-1]) > this.Sylvester.precision) { return false; }
      } while (--n);
      return true;
    },

    // Returns a copy of the vector
    function dup() {
      return this.model_.create({elements:this.elements.slice()});
    },

    // Maps the vector to another vector according to the given function
    function map(fn) {
      var elements = [];
      this.each(function(x, i) {
        elements.push(fn(x, i));
      });
      return this.model_.create({elements:elements});
    },

    // Calls the iterator for each element of the vector in turn
    function each(fn) {
      var n = this.elements.length, k = n, i;
      do { i = k - n;
        fn(this.elements[i], i+1);
      } while (--n);
    },

    // Returns a new vector created by normalizing the receiver
    function toUnitVector() {
      var r = this.modulus();
      if (r === 0) { return this.dup(); }
      return this.map(function(x) { return x/r; });
    },

    // Returns the angle between the vector and the argument (also a vector)
    function angleFrom(vector) {
      var V = vector.elements || vector;
      var n = this.elements.length, k = n, i;
      if (n != V.length) { return null; }
      var dot = 0, mod1 = 0, mod2 = 0;
      // Work things out in parallel to save time
      this.each(function(x, i) {
        dot += x * V[i-1];
        mod1 += x * x;
        mod2 += V[i-1] * V[i-1];
      });
      mod1 = Math.sqrt(mod1); mod2 = Math.sqrt(mod2);
      if (mod1*mod2 === 0) { return null; }
      var theta = dot / (mod1*mod2);
      if (theta < -1) { theta = -1; }
      if (theta > 1) { theta = 1; }
      return Math.acos(theta);
    },

    // Returns true iff the vector is parallel to the argument
    function isParallelTo(vector) {
      var angle = this.angleFrom(vector);
      return (angle === null) ? null : (angle <= this.Sylvester.precision);
    },

    // Returns true iff the vector is antiparallel to the argument
    function isAntiparallelTo(vector) {
      var angle = this.angleFrom(vector);
      return (angle === null) ? null : (Math.abs(angle - Math.PI) <= this.Sylvester.precision);
    },

    // Returns true iff the vector is perpendicular to the argument
    function isPerpendicularTo(vector) {
      var dot = this.dot(vector);
      return (dot === null) ? null : (Math.abs(dot) <= this.Sylvester.precision);
    },

    // Returns the result of adding the argument to the vector
    function add(vector) {
      var V = vector.elements || vector;
      if (this.elements.length != V.length) { return null; }
      return this.map(function(x, i) { return x + V[i-1]; });
    },

    // Returns the result of subtracting the argument from the vector
    function subtract(vector) {
      var V = vector.elements || vector;
      if (this.elements.length != V.length) { return null; }
      return this.map(function(x, i) { return x - V[i-1]; });
    },

    // Returns the result of multiplying the elements of the vector by the argument
    function multiply(k) {
      return this.map(function(x) { return x*k; });
    },

    function x(k) { return this.multiply(k); },

    // Returns the scalar product of the vector with the argument
    // Both vectors must have equal dimensionality
    function dot(vector) {
      var V = vector.elements || vector;
      var i, product = 0, n = this.elements.length;
      if (n != V.length) { return null; }
      do { product += this.elements[n-1] * V[n-1]; } while (--n);
      return product;
    },

    // Returns the vector product of the vector with the argument
    // Both vectors must have dimensionality 3
    function cross(vector) {
      var B = vector.elements || vector;
      if (this.elements.length != 3 || B.length != 3) { return null; }
      var A = this.elements;
      return Vector.create([
        (A[1] * B[2]) - (A[2] * B[1]),
        (A[2] * B[0]) - (A[0] * B[2]),
        (A[0] * B[1]) - (A[1] * B[0])
      ]);
    },

    // Returns the (absolute) largest element of the vector
    function max() {
      var m = 0, n = this.elements.length, k = n, i;
      do { i = k - n;
        if (Math.abs(this.elements[i]) > Math.abs(m)) { m = this.elements[i]; }
      } while (--n);
      return m;
    },

    // Returns the index of the first match found
    function indexOf(x) {
      var index = null, n = this.elements.length, k = n, i;
      do { i = k - n;
        if (index === null && this.elements[i] == x) {
          index = i + 1;
        }
      } while (--n);
      return index;
    },

    // Returns a diagonal matrix with the vector's elements as its diagonal elements
    function toDiagonalMatrix() {
      return this.Matrix.Diagonal(this.elements);
    },

    // Returns the result of rounding the elements of the vector
    function round() {
      return this.map(function(x) { return Math.round(x); });
    },

    // Returns a copy of the vector with elements set to the given value if they
    // differ from it by less than this.Sylvester.precision
    function snapTo(x) {
      return this.map(function(y) {
        return (Math.abs(y - x) <= this.Sylvester.precision) ? x : y;
      });
    },

    // Returns the vector's distance from the argument, when considered as a point in space
    function distanceFrom(obj) {
      if (obj.anchor) { return obj.distanceFrom(this); }
      var V = obj.elements || obj;
      if (V.length != this.elements.length) { return null; }
      var sum = 0, part;
      this.each(function(x, i) {
        part = x - V[i-1];
        sum += part * part;
      });
      return Math.sqrt(sum);
    },

    // Returns true if the vector is point on the given line
    function liesOn(line) {
      return line.contains(this);
    },

    // Return true iff the vector is a point in the given plane
    function liesIn(plane) {
      return plane.contains(this);
    },

    // Rotates the vector about the given object. The object should be a
    // point if the vector is 2D, and a line if it is 3D. Be careful with line directions!
    function rotate(t, obj) {
      var V, R, x, y, z;
      switch (this.elements.length) {
        case 2:
          V = obj.elements || obj;
          if (V.length != 2) { return null; }
          R = this.Matrix.Rotation(t).elements;
          x = this.elements[0] - V[0];
          y = this.elements[1] - V[1];
          return Vector.create([
            V[0] + R[0][0] * x + R[0][1] * y,
            V[1] + R[1][0] * x + R[1][1] * y
          ]);
          break;
        case 3:
          if (!obj.direction) { return null; }
          var C = obj.pointClosestTo(this).elements;
          R = this.Matrix.Rotation(t, obj.direction).elements;
          x = this.elements[0] - C[0];
          y = this.elements[1] - C[1];
          z = this.elements[2] - C[2];
          return Vector.create([
            C[0] + R[0][0] * x + R[0][1] * y + R[0][2] * z,
            C[1] + R[1][0] * x + R[1][1] * y + R[1][2] * z,
            C[2] + R[2][0] * x + R[2][1] * y + R[2][2] * z
          ]);
          break;
        default:
          return null;
      }
    },

    // Returns the result of reflecting the point in the given point, line or plane
    function reflectionIn(obj) {
      if (obj.anchor) {
        // obj is a plane or line
        var P = this.elements.slice();
        var C = obj.pointClosestTo(P).elements;
        return this.model_.create({elements:[C[0] + (C[0] - P[0]), C[1] + (C[1] - P[1]), C[2] + (C[2] - (P[2] || 0))]});
      } else {
        // obj is a point
        var Q = obj.elements || obj;
        if (this.elements.length != Q.length) { return null; }
        return this.map(function(x, i) { return Q[i-1] + (Q[i-1] - x); });
      }
    },

    // Utility to make sure vectors are 3D. If they are 2D, a zero z-component is added
    to3function D() {
      var V = this.dup();
      switch (V.elements.length) {
        case 3: break;
        case 2: V.elements.push(0); break;
        default: return null;
      }
      return V;
    },

    // Returns a string representation of the vector
    function inspect() {
      return '[' + this.elements.join(', ') + ']';
    },

    // Set vector's elements from an array
    function setElements(els) {
      this.elements = (els.elements || els).slice();
      return this;
    }

  ]
});




