CLASS({
  package: 'foam.demos.physics',
  name: 'Baloons',
  extendsModel: 'foam.graphics.CView',

  requires: [
    'foam.physics.Collider',
    'foam.demos.physics.PhysicalCircle'
  ],

  imports: [ 'timer' ],

  properties: [
    { name: 'timer' },
    { name: 'n',          defaultValue: 6 },
    { name: 'width',      defaultValue: 1500 },
    { name: 'height',     defaultValue: 1000 },
    { name: 'background', defaultValue: 'white' },
    { name: 'mouse',      factory: function() { return Mouse.create(); } },
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

      var N     = this.n;
      var mouse = this.mouse;

      mouse.connect(this.$);

      for ( var x = 0 ; x < N ; x++ ) {
        for ( var y = 0 ; y < N ; y++ ) {
          var c = this.PhysicalCircle.create({
            r: 25,
            x: 600+(x-(N-1)/2)*70,
            y: 400+(y-(N-1)/2)*70,
            color: 'hsl(' + x/N*100 + ',' + (70+y/N*30) + '%, 60%)'
          });
          this.addChild(c);

          Movement.spring(this.anchor, c, (x-(N-1)/2)*90-800, (y-(N-1)/2)*90, 4);
          Movement.inertia(c);
          Movement.friction(c, 0.98);
          this.bounceOnWalls(c, this.width, this.height);
          this.timer.i$.addListener(function(c) {
            var d = Movement.distance(mouse.x - c.x, mouse.y - c.y);
            d = Math.max(0, (500-d) / 500);
            var r = 20 + 110 * d*d*d*d;
            c.r = c.r * 0.95 + r * 0.05;
          }.bind(this,c));
          this.collider.add(c);
        }
      }

      this.collider.start();
    },

    bounceOnWalls: function (c, w, h) {
      Events.dynamic(function() { c.x; c.y; }, function() {
        if ( c.x < c.r ) c.vx = Math.abs(c.vx);
        if ( c.x > w - c.r ) c.vx = -Math.abs(c.vx);
        if ( c.y < c.r ) c.vy = Math.abs(c.vy);
        if ( c.y > h - c.r ) c.vy = -Math.abs(c.vy);
      });
    }
  }
});
