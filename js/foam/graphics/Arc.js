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
  package: 'foam.graphics',
  name:  'Arc',

  extends: 'foam.graphics.CView',

  properties: [
    {
      name:  'arcWidth',
      type:  'int',
      defaultValue: 1
    },
    {
      name: 'r',
      label: 'Radius',
      type: 'int',
      defaultValue: 20
    },
    {
      name: 'startAngle',
      defaultValue: 0
    },
    {
      name: 'endAngle',
      defaultValue: Math.PI*2
    },
    {
      name: 'width',
      defaultValueFn: function() { return 2*this.r; }
    },
    {
      name: 'height',
      defaultValueFn: function() { return 2*this.r; }
    }
  ],

  methods: [
    function paintSelf(c) {
      if ( ! c ) return;

      c.globalAlpha = this.alpha;

      if ( ! this.r ) return;

      c.lineWidth = this.arcWidth;
      c.strokeStyle = this.color;

      c.beginPath();
      c.arc(0, 0, this.r, -this.endAngle, -this.startAngle, false);
      c.stroke();
    }
  ]
});
