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
  package: 'foam.demos.supersnake',
  name: 'Robot',
  extends: 'foam.graphics.CView',
  requires: [
    'foam.graphics.CView',
    'foam.graphics.ImageCView',
    'foam.util.Timer',
    'foam.graphics.Circle',
    'foam.graphics.SimpleRectangle as Rectangle'
  ],
  properties: [
    { name: 'timer', factory: function() { return this.Timer.create(); } }
  ],
  methods: [
    function initCView() {
      this.SUPER();

      var body = this.Rectangle.create();
      body.width = 20;
      body.height = 30;
      body.background = '#ccc';
      this.addChild(body);

      var logo = this.ImageCView.create({src:'./js/com/google/watlobby/img/foam_red.png', x:17, y:3, width: 30, height: 5, a: Math.PI/2});
      body.addChild(logo);

      var neck =this.Rectangle.create();
      neck.background = 'black';
      neck.width =2;
      neck.y = -13;
      neck.x = 9;
      neck.height = 15;
      body.addChild(neck);

      var head = this.Circle.create();
      head.r = 8;
      head.color = 'purple';
      head.x = 0;
      head.y=-5;
      neck.addChild(head);

      var engine = this.Circle.create();
      engine.r = 8;
      engine.color = 'red';
      engine.x = 10;
      engine.y = 30;
      engine.startAngle = Math.PI;
      engine.endAngle = 2*Math.PI;
      body.addChild(engine);

      var eye = this.Circle.create();
      eye.r=5;
      eye.color='white';
      head.addChild(eye);

      var pupil = this.Circle.create();
      eye.addChild(pupil);
      pupil.r=2;
      pupil.color='lightblue';

      // animate
      var timer = this.timer;
      timer.time$.addListener(function() {
        body.y = 10 * Math.cos(timer.i/9);
        body.a = Math.PI / 8 * Math.cos(timer.i/30);
        pupil.x = 4* Math.cos(timer.i/15);
        neck.height = 15 + 10 * Math.cos(timer.i/15);
        neck.y = -13 - 10* Math.cos(timer.i/15);
        if ( this.view ) body.view.paint();
      });
      timer.start();
    }
  ]
});
