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
  extends: 'foam.graphics.CView',
  traits: [ 'com.google.misc.Colors', 'com.google.watlobby.RemoteTrait' ],

  requires: [
    'com.google.watlobby.Remote',
    'com.google.watlobby.TopicApp',
    'com.google.watlobby.TopicDAO',
    'com.google.watlobby.Bubble',
    'com.google.watlobby.TopicBubble',
    'com.google.watlobby.PhotoBubble',
    'com.google.watlobby.Topic',
    'com.google.watlobby.VideoBubble',
    'foam.demos.physics.PhysicalCircle',
    'foam.graphics.ImageCView',
    'foam.physics.PhysicsEngine as Collider',
    'foam.util.Timer'
  ],

  imports: [ 'timer', 'clearTimeout', 'setTimeout' ],
  exports: [ 'as lobby' ],

  properties: [
    { name: 'timer' },
    { name: 'speedWarp', defaultValue: 1, type: 'Float' },
    { name: 'showFOAMPowered', defaultValue: true, type: 'Boolean' },
    { name: 'clientMode', defaultValue: false, type: 'Boolean' },
    { name: 'n',          defaultValue: 25 },
    { name: 'slideshowDelay', type: 'Int' },
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
          if ( d > w / 2 - 2*r ) c1.out_ = false;
          if ( d < h/4 ) c1.out_ = true;
          // c1.color = c1.out_ ? 'orange' : 'blue';

          // The 0.9 gives it a slight outward push
          if ( c1.mass != c1.INFINITE_MASS )
            c1.applyMomentum((0.5+0.4*c1.$UID%11/10) * c1.mass/8*self.speedWarp, a+(c1.out_ ? 0.9 : 1.1)*Math.PI/2);

          // Make collision detection 5X faster by only checking every fifth time.
          if ( ( self.timer.i + i ) % 4 == 0 )
          for ( var j = i+1 ; j < cs.length ; j++ ) {
            var c2 = cs[j];
            if ( c1.intersects(c2) ) this.collide(c1, c2);
          }
        }
      };
      return c;
    }},
    {
      name: 'topics',
      lazyFactory: function() {
        return this.TopicDAO.create({ clientMode: this.clientMode });
      }
    },
    {
      name: 'dir',
      defaultValue: '',
      postSet: function(_, d) {
        var Topic = this.Topic;

        this.topics.where(
          AND(
            NEQ(Topic.PARENT_TOPIC, d),
            NEQ(Topic.TOPIC,  d))
        ).select({put: this.removeTopic});

        this.topics.where(
          OR(
            EQ(Topic.PARENT_TOPIC, d),
            EQ(Topic.TOPIC,  d)
          )
        ).select({
          put: function(t) {
            if ( ! this.findTopic(t.topic) ) this.putTopic(t);
          }.bind(this)
        });
      }
    },
    {
      name: 'selected',
      preSet: function(o, n) {
        if ( o === n ) return o;

        var oc = this.findTopic(o);
        if ( oc ) oc.setSelected(false);

        var nc = this.findTopic(n);

        if ( nc && nc.setSelected ) {
          // Move-to-Front
          var i = this.findTopicIndex(n);
          this.children[i] = this.children[this.children.length-1];
          this.children[this.children.length-1] = nc;
          nc.setSelected(true);

          this.clearTimeout(this.timeout_);
          this.timeout_ = this.setTimeout(function() { this.selected = null; }.bind(this), nc.topic.timeout * 1000);

          return n;
        }

        return null;
      }
    }
  ],

  listeners: [
    function putTopic(t) {
      if ( this.maybeRedirect(t) ) return;

      if ( t.topic === this.symRoot ) {
        if ( this.selected !== t.selected ) this.selected = t.selected;
        if ( this.dir !== t.dir && ( ! this.symRoot || t.dir ) ) this.dir = t.dir;
      }

      if ( ! ( t.parentTopic == this.dir ||
               t.topic == this.dir ||
               ( this.selected &&
                 t.topic == this.selected ) ) ) {
        this.removeTopic(t);
        return;
      }

      if ( t.model === 'Background' ) {
        var src = t.image;
        this.$.style.backgroundRepeat = 'no-repeat';
        this.$.style.backgroundPosition = 'center center';
        this.$.style.backgroundImage = 'url(' + src + ')';
        return;
      }
      var i = this.findTopicIndex(t.topic);
      if ( i != -1 ) {
        var oldC = this.children[i];
        this.removeChild(oldC)
        this.collider.remove(oldC);
      }

      if ( ! t.enabled ) return;

      var c = this.X.lookup('com.google.watlobby.' + t.model + 'Bubble').create({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        border: t.color,
        scaleX: 0,
        scaleY: 0,
        alpha: 0
      }, this.Y);
      c.topic = t;
      c.image = t.image;
      Movement.animate(1000, function() { c.alpha = 1; c.scaleX = c.scaleY = 1; })();
      c.roundImage = t.roundImage;
      if ( t.background ) c.color = t.background;
      this.addChild(c);
      if ( this.children.length > 1 ) {
        var cs = this.children;
        var l = cs.length;
        var tmp = cs[l-1];
        cs[l-1] = cs[l-2];
        cs[l-2] = tmp;
      }
      c.mass = t.r/150;
      c.gravity = 0;
      c.friction = 0.94;
      this.collider.add(c);
    },
    function removeTopic(t) {
      var i = this.findTopicIndex(t.topic);
      if ( i != -1 ) {
        var child = this.children[i];
        Movement.compile([
          [ 800, function() { child.alpha = 0; child.scaleX = child.scaleY = 0.1; } ],
          function() {
            this.removeChild(child);
            this.collider.remove(child);
          }.bind(this)
        ])();
      }
    }
  ],

  methods: [
    function initCView() {
      this.SUPER();

//      this.height = this.$.height;
//      this.width = this.$.width;

      GLOBAL.lobby = this;

      if ( ! this.timer ) {
        this.timer = this.Timer.create();
        this.timer.start();
      }

      this.addBubbles();

      this.topics.pipe({
        put:    this.putTopic,
        remove: this.removeTopic
      });

      document.body.addEventListener('click', this.onClick);

      if ( this.showFOAMPowered ) {
        var foam = this.ImageCView.create({x: 5, y: this.height-5-269/4, width: 837/4, height: 269/4, src: 'js/com/google/watlobby/img/foampowered_red.png'});
        this.addChild(foam);
      }

      this.collider.start();

      if ( this.slideshowDelay ) {
        var i = 0;
        var l = function() {
          var t = this.topics[i++];
          this.selected = t;
          if ( i == this.topics.length ) i = 0;
          this.X.setTimeout(l, t.hasOwnProperty('timeout') ? t.timeout*1000 : this.slideshowDelay*1000);
        }.bind(this);

        l();
      }
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

      // There's some timing issue that causes the remote to not open if you try to do it immediately after openeing the window.
      this.X.setTimeout(function() {
        w.document.innerHTML = '';
        w.document.write('<html><head><title>Wat Lobby Remote</title></head><body></body></html>');
        var r = this.Remote.create({topics: this.topics}, w.Y);
        r.write(w.Y);
      }.bind(this), 200);
    },
    function openAdminUI() {
      var w = foam.ui.Window.create({window: window.open("", "Admin", "width=1200, height=700, location=no, menubar=no")});
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
