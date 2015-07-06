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
  name: 'SylvesterLib',

  properties: [
    {
      model_: 'BooleanProperty',
      name: 'loaded',
      defaultValue: false
    }
  ],

  methods: [
    function init() {
      if ( ! GLOBAL.SylvesterLoading ) {
        var sylvesterTag = this.X.document.createElement('script');
        sylvesterTag.src = "/lib/sylvester/sylvester.js";
        this.X.document.head.appendChild(sylvesterTag);
        GLOBAL.SylvesterLoading = this;
        sylvesterTag.addEventListener('load', this.onLoad);
      } else {
        Events.follow( GLOBAL.SylvesterLoading.loaded$, this.loaded$ );
      }
    }
  ],

  listeners: [
    {
      name: 'onLoad',
      code: function() {

        // augment Sylvester some
        Matrix.Translation = function (v)
        {
          if (v.elements.length == 2) {
            var r = Matrix.I(3);
            r.elements[2][0] = v.elements[0];
            r.elements[2][1] = v.elements[1];
            return r;
          }

          if (v.elements.length == 3) {
            var r = Matrix.I(4);
            r.elements[0][3] = v.elements[0];
            r.elements[1][3] = v.elements[1];
            r.elements[2][3] = v.elements[2];
            return r;
          }

          throw "Invalid length for Translation";
        }

        Matrix.prototype.flatten = function ()
        {
            var result = [];
            if (this.elements.length == 0)
                return [];


            for (var j = 0; j < this.elements[0].length; j++)
                for (var i = 0; i < this.elements.length; i++)
                    result.push(this.elements[i][j]);
            return result;
        }

        Matrix.prototype.ensure4x4 = function()
        {
            if (this.elements.length == 4 &&
                this.elements[0].length == 4)
                return this;

            if (this.elements.length > 4 ||
                this.elements[0].length > 4)
                return null;

            for (var i = 0; i < this.elements.length; i++) {
                for (var j = this.elements[i].length; j < 4; j++) {
                    if (i == j)
                        this.elements[i].push(1);
                    else
                        this.elements[i].push(0);
                }
            }

            for (var i = this.elements.length; i < 4; i++) {
                if (i == 0)
                    this.elements.push([1, 0, 0, 0]);
                else if (i == 1)
                    this.elements.push([0, 1, 0, 0]);
                else if (i == 2)
                    this.elements.push([0, 0, 1, 0]);
                else if (i == 3)
                    this.elements.push([0, 0, 0, 1]);
            }

            return this;
        };

        Matrix.prototype.make3x3 = function()
        {
            if (this.elements.length != 4 ||
                this.elements[0].length != 4)
                return null;

            return Matrix.create([[this.elements[0][0], this.elements[0][1], this.elements[0][2]],
                                  [this.elements[1][0], this.elements[1][1], this.elements[1][2]],
                                  [this.elements[2][0], this.elements[2][1], this.elements[2][2]]]);
        };

        Vector.prototype.flatten = function ()
        {
            return this.elements;
        };

        function mht(m) {
            var s = "";
            if (m.length == 16) {
                for (var i = 0; i < 4; i++) {
                    s += "<span style='font-family: monospace'>[" + m[i*4+0].toFixed(4) + "," + m[i*4+1].toFixed(4) + "," + m[i*4+2].toFixed(4) + "," + m[i*4+3].toFixed(4) + "]</span><br>";
                }
            } else if (m.length == 9) {
                for (var i = 0; i < 3; i++) {
                    s += "<span style='font-family: monospace'>[" + m[i*3+0].toFixed(4) + "," + m[i*3+1].toFixed(4) + "," + m[i*3+2].toFixed(4) + "]</font><br>";
                }
            } else {
                return m.toString();
            }
            return s;
        }

        // ready to use
        this.loaded = true;
      }
    }

  ]

});

