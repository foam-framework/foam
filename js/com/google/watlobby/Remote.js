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
  package: 'com.google.watlobby',
  name: 'Remote',
  extendsModel: 'foam.graphics.CView',

  requires: [
    'com.google.watlobby.Bubble',
    'com.google.watlobby.TopicBubble',
    'com.google.watlobby.PhotoAlbumBubble',
    'com.google.watlobby.Topic',
    'com.google.watlobby.VideoBubble',
    'foam.demos.physics.PhysicalCircle',
    'foam.graphics.ImageCView'
  ],

  properties: [
    { name: 'n',          defaultValue: 25 },
    { name: 'airBubbles', defaultValue: 0, model_: 'IntProperty' },
    { name: 'width',      defaultValue: window.innerWidth },
    { name: 'height',     defaultValue: window.innerHeight },
    { name: 'background', defaultValue: '#ccf' },
    { name: 'topics' }
  ],

  listeners: [
    {
      name: 'onClick',
      code: function(evt) {
        var self = this;
        var child = this.findChildAt(evt.clientX, evt.clientY);
        if ( child === this.selected ) return;

        if ( this.selected ) {
          this.selected.setSelected(false);
          this.selected = null;
        }

        if ( child && child.setSelected ) {
          this.selected = child
          child.setSelected(true);
        }
      }
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();

      this.topics.pipe({
        put:    this.addTopic.bind(this),
        remove: this.removeTopic.bind(this)
      });

      document.body.addEventListener('click', this.onClick);
    },

    function addTopic(t) {
      var c = this.X.lookup('com.google.watlobby.' + t.model + 'Bubble').create({
        x: Math.random() * this.width,
        y: Math.random() * this.height
      }, this.Y);
      c.topic = t;
      c.image = t.image;
      var r = t.r;
      t.r = 1;
      Movement.animate(2000, function() { t.r = r; })();
      c.roundImage = t.roundImage;
      if ( t.color ) c.border = t.color;
      if ( t.background ) c.color = t.background;
      this.addChild(c);
      c.mass = r/150;
      c.gravity = 0;
      c.friction = 0.94;
    },
    function removeTopic(t) {
      // TODO
    }
  ]
});
