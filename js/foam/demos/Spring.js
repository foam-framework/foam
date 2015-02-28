CLASS({
  package: 'foam.demos',
  name: 'PhysicalCircle',
  extendsModel: 'foam.graphics.Circle',
  traits: [ 'foam.physics.Physical' ]
});


CLASS({
  package: 'foam.demos',
  name: 'Spring',
  extendsModel: 'foam.graphics.CView',

  requires: [ 'foam.demos.PhysicalCircle' ],

  properties: [
    { name: 'n',          defaultValue: 17 },
    { name: 'width',      defaultValue: 2000 },
    { name: 'height',     defaultValue: 1700 },
    { name: 'background', defaultValue: 'white' },
    { name: 'mouse',      factory: function() { return Mouse.create(); } }
  ],

  methods: {
    initCView: function() {
      this.SUPER();

      var N     = this.n;
      var mouse = this.mouse;

      mouse.connect(this.$);
      mouse.x = mouse.y = 220;


      for ( var x = 0 ; x < N ; x++ ) {
        for ( var y = 0 ; y < N ; y++ ) {
          var c = this.PhysicalCircle.create({
            r: 8,
            x: 220 + (x-(N-1)/2)*25,
            y: 220 + (y-(N-1)/2)*25,
            color: 'hsl(' + x/N*100 + ',' + (70+y/N*30) + '%, 60%)'
          });
          this.addChild(c);
          
          //  Movement.strut(mouse, c, (x-2)*20, (y-2)*20);
          Movement.spring(mouse, c, (x-(N-1)/2)*20, (y-(N-1)/2)*20);
          Movement.inertia(c);
          Movement.friction(c, 0.95);
        }
      }
    }
  }
});
      