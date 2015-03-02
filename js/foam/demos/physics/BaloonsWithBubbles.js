CLASS({
  package: 'foam.demos.physics',
  name: 'BaloonsWithBubbles',
  extendsModel: 'foam.graphics.CView',

  requires: [
    'foam.physics.Collider',
    'foam.demos.physics.PhysicalCircle'
  ],

  imports: [ 'timer' ],

  properties: [
    { name: 'timer' },
    { name: 'n',          defaultValue: 7 },
    { name: 'width',      defaultValue: 800 },
    { name: 'height',     defaultValue: 600 },
    { name: 'background', defaultValue: '#ccf' },
    { name: 'collider',   factory: function() {
      return this.Collider.create();
    }},
    { name: 'anchor',     factory: function() {
      return this.PhysicalCircle.create({r: 9, x: 1400, y: 400});
    }}
  ],

  methods: {
    initCView: function() {
      this.SUPER();

      if ( ! this.timer ) {
        this.timer = Timer.create();
        this.timer.start();
      }

      this.addChild(this.anchor);

      var N = this.n;

      for ( var x = 0 ; x < N ; x++ ) {
        for ( var y = 0 ; y < N ; y++ ) {
          var c = this.PhysicalCircle.create({
            r: 15,
            x: 400+(x-(N-1)/2)*70,
            y: 200+(y-(N-1)/2)*70,
            borderWidth: 6,
            color: 'white',
            border: 'hsl(' + x/N*100 + ',' + (70+y/N*30) + '%, 60%)'
          });
          this.addChild(c);

          c.y$.addListener(function(c) {
            if ( c.y > this.height+50 ) {
              c.y = -50;
            }
          }.bind(this, c));

          Movement.gravity(c, 0.03);
          Movement.inertia(c);
          Movement.friction(c, 0.96);
          this.bounceOnWalls(c, this.width, this.height);
          this.collider.add(c);
        }
      }

      var count = 0;
      this.timer.i$.addListener(function() {
        if ( this.timer.i % 10 ) return;
        if ( count++ == 100 ) throw EventService.UNSUBSCRIBE_EXCEPTION;

        var b = this.PhysicalCircle.create({
          r: 3,
          x: this.width * Math.random(),
          y: this.height,
          color: 'white',
          borderWidth: 1,
          border: 'blue',
          mass: 0.3
        });

        b.y$.addListener(function() {
          if ( b.y < 1 ) {
            b.y = this.height;
            b.x = this.width * Math.random();
          }
        }.bind(this, b));
        b.vy = -4;
        Movement.inertia(b);
        Movement.gravity(b, -0.2);
        Movement.friction(b);
        this.collider.add(b);

        this.addChild(b);
      }.bind(this));

      this.collider.start();
    },

    bounceOnWalls: function (c, w, h) {
      Events.dynamic(function() { c.x; c.y; }, function() {
        var r = c.r + c.borderWidth;
        if ( c.x < r ) c.vx = Math.abs(c.vx);
        if ( c.x > w - r ) c.vx = -Math.abs(c.vx);
      });
    }
  }
});
