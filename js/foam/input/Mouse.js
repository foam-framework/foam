/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  package: 'foam.input',
  name: 'Mouse',

  properties: [
    {
      type: 'Int',
      name: 'x'
    },
    {
      type: 'Int',
      name: 'y'
    },
    { name: 'canvasX', getter: function() { return this.x; } },
    { name: 'canvasY', getter: function() { return this.y; } }
  ],
  methods: [
    function connect(e) {
      e.addEventListener('mousemove', this.onMouseMove);
      return this;
    }
  ],

  listeners: [
    {
      name: 'onMouseMove',
      isFramed: true,
      code: function(evt) {
        this.x = evt.offsetX;
        this.y = evt.offsetY;
      }
    }
  ]
});
