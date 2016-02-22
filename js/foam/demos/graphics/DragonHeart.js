/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.demos.graphics',
  name: 'DragonHeart',
  extends: 'foam.demos.graphics.Dragon',

  models: [
    {
      name: 'Circle',
      extends: 'foam.graphics.Label2',
      properties: [
        [ 'text', '<3' ],
        [ 'align', 'center' ],
        [ 'font', '20pt Arial' ],
        {
          name: 'r',
          postSet: function(_, r) { this.scaleX = this.scaleY = r/this.width; }
        }
      ],
      methods: [
        function init() {
          this.SUPER();
          this.border = null;
          this.color = 'red';
          this.a = Math.PI;
          Movement.animate(
            4000,
            function() { this.a += Math.PI/2; }.bind(this),
            Movement.oscillate(0.8, 0.25, 2)
          )();
        }
      ]
    }
  ],

  properties: [
    {
      name:  'eyes',
      factory: function() {
        var eyes = this.EyesCView.create({x:-50, y: -160, r: 25});
        eyes.rightEye.color = 'red';
        return eyes;
      }
    }
  ],

  methods: {
    dot: function(c, r) {
      c.beginPath();
      c.fillStyle = 'red';
      c.arc(0,0,r,0,Math.PI*2,true);
      c.fill();
    }
  }
});
