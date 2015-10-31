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
  name: 'SmallRemote',
  extends: 'foam.graphics.CView',

  requires: [
    'com.google.watlobby.Bubble',
    'com.google.watlobby.TopicBubble',
    'com.google.watlobby.AlbumBubble',
    'com.google.watlobby.Topic',
    'com.google.watlobby.VideoBubble',
    'foam.demos.physics.PhysicalCircle',
    'foam.graphics.ImageCView'
  ],

  imports: [
    'document',
    'window'
  ],

  properties: [
    { name: 'n',          defaultValue: 25 },
    { name: 'airBubbles', defaultValue: 0, model_: 'IntProperty' },
    { name: 'width',      factory: function() { return this.window.innerWidth; } },
    { name: 'height',     factory: function() { return this.window.innerHeight } },
    { name: 'background', defaultValue: '#ccf' },
    { name: 'topics' }
  ],

  listeners: [
    {
      name: 'onClick',
      code: function(evt) {
        var self  = this;
        var child = this.findChildAt(evt.clientX, evt.clientY);

        if ( ! child || ! child.topic ) return;

        this.topics.where(EQ(this.Topic.SELECTED, true)).update(SET(this.Topic.SELECTED, false))(function() {
          self.topics.where(EQ(self.Topic.TOPIC, child.topic.topic)).update(SET(self.Topic.SELECTED, true));
        });
      }
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();

      this.topics.pipe({
        put:    this.putTopic.bind(this),
        remove: this.removeTopic.bind(this)
      });

      this.document.body.addEventListener('click', this.onClick);
    },

    function putTopic(t) {
      // console.log('*** putTopic: ', t, t.topic && t.topic.topic);
      // Don't add if we already have topic
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var c = this.children[i];
        if ( c.topic && c.topic.topic === t.topic ) {
          this.selected = c;
          return;
        }
      }

      t = t.clone();

      var h = (this.height-26) / 4;
      var i = this.children.length;

      var c = this.X.lookup('com.google.watlobby.' + t.model + 'Bubble').create({
        x: Math.floor(i / 4) * h + h/2,
        y: ( i % 4 ) * h + h/2
      }, this.Y);
      c.topic = t;
      c.image = t.image;
      var r = h/2-20;
      t.r = r;
      c.r = r;
      c.roundImage = t.roundImage;
      if ( t.color ) c.border = t.color;
      if ( t.background ) c.color = t.background;
      this.addChild(c);
    },
    function removeTopic(t) {
      // TODO
    }
  ]
});
