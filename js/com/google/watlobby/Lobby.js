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
  name: 'Lobby',
  extendsModel: 'foam.graphics.CView',
  traits: [ 'com.google.misc.Colors' ],

  requires: [
    'com.google.watlobby.Remote',
    'com.google.watlobby.TopicApp',

    'com.google.watlobby.Bubble',
    'com.google.watlobby.TopicBubble',
    'com.google.watlobby.AlbumBubble',
    'com.google.watlobby.Topic',
    'com.google.watlobby.VideoBubble',
    'foam.demos.ClockView',
    'foam.demos.physics.PhysicalCircle',
    'foam.graphics.ImageCView',
    'foam.physics.PhysicsEngine as Collider',
    'foam.util.Timer'
  ],

  imports: [ 'timer', 'clearTimeout', 'setTimeout' ],
  exports: [ 'as lobby' ],

  properties: [
    { name: 'timer' },
    { name: 'n',          defaultValue: 25 },
    { name: 'airBubbles', defaultValue: 0, model_: 'IntProperty' },
    { name: 'width',      defaultValue: window.innerWidth },
    { name: 'height',     defaultValue: window.innerHeight },
    { name: 'background', defaultValue: '#ccf' },
    { name: 'collider',   factory: function() {
      var c = this.Collider.create();
      var w = this.width;
      var h = this.height;
      var self = this;
      c.detectCollisions = function() {
        var cs = this.children;
        for ( var i = 0 ; i < cs.length ; i++ ) {
          var c1 = cs[i];
          this.updateChild(c1);
          var r = c1.r + 10;

          // Add Coriolis Effect
          var a = Math.atan2(c1.y-h/2, c1.x-w/2);
          var d = Movement.distance(c1.y-h/2, c1.x-w/2);
          // Keeps topic bubbles from going too far off screen
          // if ( c1.topic && d > h / 2 - r) c1.out_ = false;
          if ( d > w / 2 - r ) c1.out_ = false;
          if ( d < h/4 ) c1.out_ = true;
          // c1.color = c1.out_ ? 'orange' : 'blue';

          // The 0.9 gives it a slight outward push
          if ( c1.mass != c1.INFINITE_MASS )
            c1.applyMomentum((0.5+0.4*c1.$UID%11/10) * c1.mass/4, a+(c1.out_ ? 0.9 : 1.1)*Math.PI/2);

          // Make collision detection 5X faster by only checking every fifth time.
          if ( ( self.timer.i + i ) % 5 == 0 ) for ( var j = i+1 ; j < cs.length ; j++ ) {
            var c2 = cs[j];
            if ( c1.intersects(c2) ) this.collide(c1, c2);
          }
        }
      };
      return c;
    }},
    {
      name: 'topics',
      factory: function() {
        var dao = [].dao;

        axhr('topics.json')(function(topics) {
          JSONUtil.arrayToObjArray(this.X, topics, this.Topic).select(dao);
        }.bind(this));

        return dao;
      }
    },
    {
      name: 'selected',
      preSet: function(o, n) {
        if ( o === n ) return o;

        if ( o ) o.setSelected(false);

        if ( n && n.setSelected ) {
          // Move-to-Front
          var i = this.children.indexOf(n);
          this.children[i] = this.children[this.children.length-1];
          this.children[this.children.length-1] = n;

          n.setSelected(true);

          this.clearTimeout(this.timeout_);
          this.timeout_ = this.setTimeout(function() { this.selected = null; }.bind(this), n.topic.timeout * 1000);

          return n;
        }

        return null;
      }
    }
  ],

  listeners: [
    {
      name: 'onClick',
      code: function(evt) {
        this.selected = this.findChildAt(evt.clientX, evt.clientY);
      }
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();

      GLOBAL.lobby = this;

      if ( ! this.timer ) {
        this.timer = this.Timer.create();
        this.timer.start();
      }

      this.addBubbles();

      this.topics.pipe({
        put:    this.putTopic.bind(this),
        remove: this.removeTopic.bind(this)
      });

      document.body.addEventListener('click', this.onClick);

      var foam = this.ImageCView.create({x: 10, y: this.height-60, width: 837/5, height: 269/5, src: 'img/foampowered_red.png'});
      this.addChild(foam);

      var clock = this.ClockView.create({
        drawTicks: true,
        x: this.width-250,
        y: 250,
        r: (120-10)/2,
        scaleX: 4,
        scaleY: 4});
      this.addChild(clock);

      this.collider.start();
    },
    function findTopic(t) {
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var c = this.children[i];
        if ( c.topic && c.topic.topic === t.topic ) return i;
      }
      return -1;
    },
    function putTopic(t) {
//      console.log('***** putTopic: ', t.topic);
      var i = this.findTopic(t);
      if ( i != -1 ) {
        if ( t.selected ) {
          this.selected = this.children[i];
          return;
        } else {
          this.children.splice(i, 1);
        }
      }

      if ( ! t.enabled ) return;

      var c = this.X.lookup('com.google.watlobby.' + t.model + 'Bubble').create({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        border: t.color
      }, this.Y);
      c.topic = t;
      c.image = t.image;
      var r = t.r;
      t.r = 1;
      Movement.animate(2000, function() { t.r = r; })();
      c.roundImage = t.roundImage;
     // if ( t.color ) c.border = t.color;
      if ( t.background ) c.color = t.background;
      this.addChild(c);
      c.mass = r/150;
      c.gravity = 0;
      c.friction = 0.94;
      this.collider.add(c);
    },
    function removeTopic(t) {
      console.log('removeTopic ************** ', arguments);
      // TODO
    },
    function addBubbles() {
      var N = this.n;
      for ( var i = 0 ; i < N ; i++ ) {
        var color = this.COLORS[Math.floor(i / N * this.COLORS.length)];
        var c = this.Bubble.create({
          r: 10 + Math.random() * 60,
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          color: null,
          border: color
        });
        this.addChild(c);

        c.mass = c.r/150;
        c.gravity = 0;
        c.friction = 0.94;
        this.collider.add(c);
      }
    },
    function openRemoteUI() {
      var w = foam.ui.Window.create({window: window.open("", "Remote", "width=800, height=600, location=no, menubar=no, resizable=no, status=no, titlebar=no")});
      w.document.innerHTML = '';
      w.document.write('<html><head><title>Wat Lobby Remote</title></head><body></body></html>');
      var r = this.Remote.create({topics: this.topics}, w.Y);
      r.write(w.Y);
    },
    function openAdminUI() {
      var w = foam.ui.Window.create({window: window.open("", "Admin", "width=1100, height=700, location=no, menubar=no")});
      w.document.innerHTML = '';
      w.document.write('<html><head><title>Wat Lobby Admin</title><base href="/js/com/google/watlobby/"></head><body></body></html>');
      var r = this.TopicApp.create({dao: this.topics}, w.Y);
      r.write(w.Y);
    },
    function destroy() {
      this.SUPER();
      this.collider.destroy();
    }
  ]
});
