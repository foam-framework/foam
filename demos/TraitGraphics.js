var space   = CView2.create({width: 2000, height: 1700});
var mouse   = Mouse.create();


MODEL({name: 'Physical', properties: [
  { name: 'vx', defaultValue: 0 },
  { name: 'vy', defaultValue: 0 }
]});


MODEL({name: 'MotionBlur', methods: {
  paint: function() {
    this.SUPER();
    var c = this.canvas;
    var oldAlpha = this.alpha;

    c.save();
    c.translate(-this.vx, -this.vy);
    this.alpha = 0.6;
    this.SUPER();

    c.translate(-this.vx, -this.vy);
    this.alpha = 0.3;
    this.SUPER();
    c.restore();

    this.alpha = oldAlpha;
  }
}});


MODEL({name: 'Shadow', methods: {
  paint: function() {
    var c = this.canvas;
    var oldAlpha = this.alpha;
    var oldColor = this.color;

    c.save();
    c.translate(4, 4);
    this.alpha = 0.2;
    this.color = 'black';
    this.SUPER();
    c.restore();

    this.alpha = oldAlpha;
    this.color = oldColor;

    this.SUPER();
  }
}});


MODEL({
  name: 'Circle',
  extendsModel: 'Circle2',
//  traits: ['Physical', 'MotionBlur']
  traits: ['Physical', 'Shadow']
//  traits: ['Physical', 'MotionBlur', 'Shadow']
});


space.write(document);
mouse.connect(space.$);

mouse.x = mouse.y = 300;

var N = 7;
for ( var x = 0 ; x < N ; x++ ) {
  for ( var y = 0 ; y < N ; y++ ) {
    var c = Circle.create({
      alpha: 1,
      r: 20,
      x: 300 + (x-(N-1)/2)*40,
      y: 300 + (y-(N-1)/2)*40,
      color: 'hsl(' + x/N*100 + ',' + (35+y/N*100*60) + '%, 60%)'
    });
    space.addChild(c);

    Movement.spring(mouse, c, (x-(N-1)/2)*60, (y-(N-1)/2)*60, 3);
    Movement.inertia(c);
    Movement.friction(c, 0.9);
  }
}

