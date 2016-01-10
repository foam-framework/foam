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
  package: 'foam.ui.md',
  name: 'Flare',

  requires: [ 'foam.graphics.Circle' ],

  properties: [
    'element',
    {
      name: 'color',
      defaultValue: '#aaaaaa'
    },
    {
      name: 'startAlpha',
      defaultValue: 1
    },
    {
      name: 'startX',
      defaultValue: 1
    },
    {
      name: 'startY',
      defaultValue: 1
    },
    {
      name: 'startLocation',
      defaultValue: 'percent'
    },
    {
      name: 'cssPosition',
      defaultValue: 'fixed'
    },
    {
      name: 'flareState',
      defaultValue: 'detached'
    },
    {
      type: 'Int',
      name: 'growTime',
      defaultValue: 400
    },
    {
      type: 'Int',
      name: 'fadeTime',
      defaultValue: 200
    }
  ],

  listeners: [
    {
      name: 'fire',
      code: function() {
        var w = this.element.offsetWidth, h = this.element.offsetHeight,
            x = this.startLocation !== 'percent' ? this.startX :
                this.startX * w,
            y = this.startLocation !== 'percent' ? this.startY :
                this.startY * h;

        var c = this.Circle.create({
          r: 0,
          width: w,
          height: h,
          x: x,
          y: y,
          color: this.color,
          alpha: this.startAlpha
        });

        // Only draw one quarter of the Circle if we're starting in a corder.
        if ( this.startX == 0 && this.startY == 0 ) {
          c.startAngle = Math.PI * 1.5;
          c.endAngle   = Math.PI * 2;
        } else if ( this.startX == 0 && this.startY == 1 ) {
          c.startAngle = 0;
          c.endAngle   = Math.PI / 2;
        } else if ( this.startX == 1 && this.startY == 0 ) {
          c.startAngle = Math.PI;
          c.endAngle   = Math.PI * 1.5;
        } else if ( this.startX == 1 && this.startY == 1 ) {
          c.startAngle = Math.PI / 2;
          c.endAngle   = Math.PI;
        }

        var view = c.toView_();
        var div = document.createElement('div');
        var dStyle = div.style;
        dStyle.position = this.cssPosition;
        dStyle.left = 0;
        dStyle.top = 0;
        dStyle.zIndex = 4;
        // dStyle.zIndex = 101;

        var id = this.X.lookup('foam.ui.View').getPrototype().nextID();
        div.id = id;
        div.innerHTML = view.toHTML();

        this.flareState = 'growing';

        this.element.appendChild(div);
        view.initHTML();

        Movement.compile([
          [this.growTime, function() { c.r = 1.25 * Math.sqrt(w*w + h*h); }],
          function() { this.flareState = 'fading'; }.bind(this),
          [this.fadeTime, function() { c.alpha = 0; }],
          function() { div.remove(); this.flareState = 'detached'; }.bind(this)
        ])();

        c.r$.addListener(EventService.framed(view.paint.bind(view)));
        c.alpha$.addListener(EventService.framed(view.paint.bind(view)));
      }
    }
  ]
});
