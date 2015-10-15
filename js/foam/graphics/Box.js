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
  name:  'Box',
  extends: 'foam.graphics.Label',

  properties: [
    {
      name:  'background',
      label: 'Background Color',
      type:  'String',
      defaultValue: 'white'
    },
    {
      name:  'border',
      label: 'Border Color',
      type:  'String',
      defaultValue: 'black'
    },
    {
      name:  'a',
      label: 'Angle',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'width',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'height',
      type:  'int',
      defaultValue: 100
    }
  ],

  methods: {
    paint: function() {
      var c = this.parent.canvas;

      c.save();

      if ( this.a ) {
        c.translate(this.x+this.width/2, this.y+this.height/2);
        c.rotate(this.a);
        c.translate(-this.x-this.width/2, -this.y-this.height/2);
      }

      c.fillStyle = this.background;
      c.fillRect(this.x, this.y, this.width, this.height);

      if ( this.border && this.width && this.height ) {
        c.strokeStyle = this.border;
        c.strokeRect(this.x, this.y, this.width, this.height);
      }

      var oldFont = c.font;
      var oldAlign = c.textAlign;

      if ( this.font ) c.font = this.font;

      c.textAlign = 'center'; //this.align;
      c.fillStyle = this.color;
      c.fillText(
        this.text,
        this.x + this.width/2,
        this.y+this.height/2+10);

      c.font = oldFont;
      c.textAlign = oldAlign;

      var grad = c.createLinearGradient(this.x, this.y, this.x+this.width, this.y+this.height);

      grad.addColorStop(  0, 'rgba(0,0,0,0.35)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0)');
      grad.addColorStop(  1, 'rgba(255,255,255,0.45)');
      c.fillStyle = grad;
      c.fillRect(this.x, this.y, this.width, this.height);

      c.restore();
    }
  }
});
