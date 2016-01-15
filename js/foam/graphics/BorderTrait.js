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
  name:  'BorderTrait',

  documentation: function() {/* Add $$DOC{ref:'.'} to a CView to paint
                              a rectangular border around your item. */},

  properties: [
    {
      type:  'String',
      name:  'border',
      label: 'Border Color',
      defaultValue: undefined
    },
    {
      name:  'borderWidth',
      defaultValue: 1,
      documentation: function() {/*
        The width to draw the border, straddling the item's edge. A width of 1
        will draw the item's rect exactly, a width of 2 will expand past the item's
        edge by 1 pixel (depending on canvas scaling).</p>
        <p>Note that a transparent border is still respected when drawing the
        background. A default border of 1 will leave a 1 pixel transparent area around
        the background fill, as if a border were to be drawn there. This can be
        useful in situations when you want to fill inside a border that has been
        drawn by an item underneath this item.
      */}
    },
    {
      name: 'background',
      defaultValue: 'rgba(0,0,0,0)'
    },
    {
      name: 'dropShadow',
      documentation: function() {/* Drop shadow thickness in pixels. */},
      defaultValue: 0
    }
  ],

  methods: {
    paintSelf: function(c) { /* make sure to call <code>this.SUPER();</code> in
                                your BorderTrait model's $$DOC{ref:'.paintSelf'}. */
      this.SUPER(c);

      c.save();

      c.globalAlpha = this.alpha;

      // create a clip region that cuts out the object's rect and draws
      // the shadow around it. The fill color affects the shadow darkness,
      // so we need to be able to fill with black without actually drawing
      // the black part.
      if ( ! this.clipped && this.dropShadow > 0 ) {
        c.save();
        c.moveTo(this.width,this.height);
        c.lineTo(this.width,0);
        c.lineTo(0,0);
        c.lineTo(0, this.height);
        c.lineTo(this.width,this.height);
        c.closePath();
        c.rect(-100,-100,this.width+200,this.height+200);
        c.clip();
        c.shadowBlur = this.dropShadow/2;
        c.shadowColor = "grey";
        c.shadowOffsetX = this.dropShadow/2;
        c.shadowOffsetY = this.dropShadow/2;
        c.fillStyle = "black";
        c.fillRect(0,0,this.width,this.height);
        c.restore();
      }


      if ( this.background ) {
        c.fillStyle = this.background;

        c.beginPath();
        var hbw = this.borderWidth/2;
        c.rect(hbw, hbw, this.width-this.borderWidth, this.height-this.borderWidth);
        c.closePath();
        c.fill();
      }

      if ( this.border ) {
        c.lineWidth = this.borderWidth;
        c.strokeStyle = this.border;
        c.beginPath();
        c.rect(0, 0, this.width, this.height);
        c.closePath();
        c.stroke();
      }

      c.restore();
    }
  }
});
