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
  package: 'com.google.watlobby.webgl',
  name: 'Lobby',
  extends: 'foam.graphics.webgl.flat.Scene',
  traits: [ 
    'com.google.misc.Colors',
    'com.google.watlobby.RemoteTrait',
    'com.google.watlobby.Lobby', // Hack: since Lobby inherits CView directly, we can rebuild it on top of Scene
  ],
  requires: [
    // 'com.google.watlobby.webgl.Bubble',
    // 'com.google.watlobby.webgl.TopicBubble',
    // 'com.google.watlobby.webgl.PhotoBubble',
    // 'com.google.watlobby.webgl.VideoBubble',
    'foam.demos.physics.PhysicalGLCircle as PhysicalCircle',
    'foam.graphics.ImageCView',
    'foam.graphics.webgl.CViewGLView',
  ],
  imports: [
    'setInterval',
  ],
    
  methods: [
    function init() {
      this.SUPER();
      // replace bubbles with GL versions
      // this.X.registerModel(this.Bubble, 'com.google.watlobby.Bubble');
      // this.X.registerModel(this.TopicBubble, 'com.google.watlobby.TopicBubble');
      // this.X.registerModel(this.PhotoBubble, 'com.google.watlobby.PhotoBubble');
      // this.X.registerModel(this.VideoBubble, 'com.google.watlobby.VideoBubble');
      // this.X.registerModel(this.PhysicalCircle, 'foam.demos.physics.PhysicalCircle');
      
      this.setInterval(function() {
        this.view && this.view.paint();
      }.bind(this), 15);
      
      this.initCView();
    },
    function findChildAt(x, y) {
      var c2 = { x: x, y: y, r: 1 };

      var cs = this.children;
      // Start from the end to find the child in the foreground
      for ( var i = cs.length-1 ; i >= 0 ; i-- ) {
        var c1 = cs[i];
        if ( c1.intersects && c1.intersects(c2) ) return c1;
      }
    },
  ],
    
});
