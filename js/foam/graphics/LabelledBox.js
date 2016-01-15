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
  package: 'foam.graphics',
  name:  'LabelledBox',
  extends: 'foam.graphics.Label2',

  properties: [
    {
      type: 'Color',
      name: 'border',
      label: 'Border Color',
      defaultValue: 'black'
    },
    {
      type: 'Float',
      name: 'a',
      label: 'Angle'
    },
    { name: 'align',  defaultValue: 'center' },
    { name: 'border', defaultValue: 'black' }
  ],

  methods: {
    paintSelf: function(c) {
      /*
      if ( this.a ) {
        c.translate(this.x+this.width/2, this.y+this.height/2);
        c.rotate(this.a);
        c.translate(-this.x-this.width/2, -this.y-this.height/2);
      }
      */

      this.SUPER(c);

      var grad = c.createLinearGradient(0, 0, this.width, this.height);
      grad.addColorStop(  0, 'rgba(0,0,0,0.35)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0)');
      grad.addColorStop(  1, 'rgba(255,255,255,0.45)');

      c.fillStyle = grad;
      c.fillRect(1, 1, this.width-2, this.height-2);

      // Redraw text over top of linear gradient so that it's clearer
      c.fillStyle = this.color;
      if ( this.align === 'center' ) {
        c.fillText(this.text, this.width/2, this.height/2+10);
      } else {
        c.fillText(this.text, 0, this.height/2+10);
      }
    }
  }
});
