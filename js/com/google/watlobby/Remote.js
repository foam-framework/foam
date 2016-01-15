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
  extends: 'foam.graphics.CView',

  traits: [ 'com.google.watlobby.RemoteTrait' ],

  requires: [
    'com.google.watlobby.Bubble',
    'com.google.watlobby.PhotoBubble',
    'com.google.watlobby.Topic',
    'com.google.watlobby.TopicBubble',
    'com.google.watlobby.TopicDAO',
    'com.google.watlobby.VideoBubble',
    'foam.demos.physics.PhysicalCircle',
    'foam.graphics.ImageCView',
    'foam.graphics.SimpleRectangle as Rectangle'
  ],

  imports: [
    'document',
    'window'
  ],

  properties: [
    {
      type: 'Boolean',
      name: 'clientMode',
      defaultValue: true
    },
    {
      name: 'topics',
      lazyFactory: function() {
        return this.TopicDAO.create({ clientMode: this.clientMode });
      }
    },
    { name: 'background', defaultValue: '#ccf' }
  ],

  listeners: [
    {
      name: 'updateState',
      isMerged: 200,
      code: function() {
        this.topics.find(EQ(this.Topic.TOPIC, this.symRoot), {
          put: function (t) {
            t = t.clone();
            t.selected = this.selected;
            t.dir = this.dir;
            this.topics.put(t);
          }.bind(this)
        });
      }
    },
    {
      name: 'layout',
      isFramed: true,
      code: function() {
        this.width  = this.window.innerWidth;
        this.height = this.window.innerHeight;

        while ( this.children.length ) {
          this.removeChild(this.children[this.children.length-1]);
        }

        if ( this.dir ) {
          this.putTopic(this.Topic.create({
            parentTopic: this.dir,
            topic: this.BACK_TOPIC,
            image: 'img/back.png',
            model: "Photo",
            color: 'gray',
            roundImage: true
          }));
        }
        this.topics.find(EQ(this.Topic.TOPIC, this.dir),{put:this.putTopic.bind(this)});
        this.topics.where(EQ(this.Topic.PARENT_TOPIC, this.dir)).select({put: this.putTopic.bind(this)});
      }
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();

      this.window.addEventListener('resize', this.layout);
      this.topics.listen({put: function(t) { if ( t.topic !== this.symRoot ) this.layout(); }.bind(this), remove: this.layout});
      this.document.body.addEventListener('click', this.onClick);
      this.selected$.addListener(this.updateState);
      this.dir$.addListener(this.updateState);
      this.dir$.addListener(this.layout);
      this.layout();
    },

    function putTopic(t) {
      if ( this.maybeRedirect(t) ) return;
      if ( t.topic === this.symRoot ) return;

      if ( ! t.enabled ) {
        // Newly disabled, so re-layout.
        if ( this.findTopic(t.topic) ) this.layout();
        return;
      }

      t = t.clone();

      var h = (this.height-26) / 4;
      var i = this.children.length;
      var m = this.X.lookup('com.google.watlobby.' + t.model + 'Bubble');
      if ( ! m ) return;
      var c = m.create({
        x: Math.floor(i / 4) * h + h/2,
        y: ( i % 4 ) * h + h/2
      }, this.Y);
      c.topic = t;
      c.image = t.image;
      var r = h/2-20;
      t.r = c.r = r;
      c.scaleX = c.scaleY = 0.001;
      c.roundImage = t.roundImage;
      if ( t.color ) c.border = t.color;
      if ( t.background ) c.color = t.background;
      this.addChild(c);

      if ( t.topic === this.BACK_TOPIC ) c.alpha = 0.5;

//      var close = this.ImageCView.create({alpha: 0.5, x: -r, y: -r, width: 2*r, height: 2*r, src: 'img/close.png'});
      var close = this.Rectangle.create({background: 'black', alpha: 0.5, x: -r/3, y: -r/3, width: r/1.5, height: r/1.5});
      var s = function() { c.scaleX = c.scaleY = ! this.selected ? 0.9 : this.selected === t.topic ? 1.02 : 0.75; }.bind(this);
      var l = function() {
        if ( this.selected === t.topic ) {
          if ( this.VideoBubble.isInstance(c) ) {
            c.playIcon.alpha = 0;
          }
          c.addChild(close);
        } else {
          if ( this.VideoBubble.isInstance(c) ) {
            c.playIcon.alpha = 0.5;
          }
          c.removeChild(close);
        }
        Movement.animate(300, s)();
      }.bind(this);
      this.selected$.addListener(l);
      this.X.setTimeout(l,100);
    }
  ]
});
