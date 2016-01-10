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
  name: 'InputPoint',
  package: 'foam.input.touch',
  properties: [
    'id', 'type',
    { name: 'done', type: 'Boolean' },
    {
      name: 'x',
      documentation: 'The real latest X-coordinate. pageX, relative to the whole document, in CSS pixels.',
      postSet: function(old, nu) {
        this.lastX = old;
      }
    },
    {
      name: 'y',
      documentation: 'The real latest Y-coordinate. pageY, relative to the whole document, in CSS pixels.',
      postSet: function(old, nu) {
        this.lastY = old;
      }
    },
    {
      name: 'x0',
      documentation: 'The first X-coordinate. pageX, relative to the whole document, in CSS pixels. Set to x at creation time.',
      factory: function() { return this.x; }
    },
    {
      name: 'y0',
      documentation: 'The first Y-coordinate. pageY, relative to the whole document, in CSS pixels. Set to y at creation time.',
      factory: function() { return this.y; }
    },
    {
      name: 'lastX',
      documentation: 'The immediately previous X-coordinate. pageX, relative to the whole document, in CSS pixels. Set to x at creation time.',
      factory: function() { return this.x; }
    },
    {
      name: 'lastY',
      documentation: 'The immediately previous Y-coordinate. pageY, relative to the whole document, in CSS pixels. Set to y at creation time.',
      factory: function() { return this.y; }
    },
    {
      name: 'dx',
      getter: function() { return this.x - this.lastX; }
    },
    {
      name: 'dy',
      getter: function() { return this.y - this.lastY; }
    },
    {
      name: 'totalX',
      getter: function() { return this.x - this.x0; }
    },
    {
      name: 'totalY',
      getter: function() { return this.y - this.y0; }
    },
    'lastTime',
    {
      name: 'shouldPreventDefault',
      documentation: 'Set me when incoming events should have preventDefault ' +
          'called on them',
      defaultValue: false
    }
  ]
});


