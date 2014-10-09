var space   = CView2.create({width: 2000, height: 1700});
var mouse   = Mouse.create();

MODEL({
  name: 'ShadowCircle',
  extendsModel: 'Circle2',
  traits: ['Physical', 'Shadow']
});

MODEL({
  name: 'BlurCircle',
  extendsModel: 'Circle2',
  traits: ['Physical', 'MotionBlur']
});


space.write(document);
mouse.connect(space.el);

mouse.x = mouse.y = 300;

var N = 3;
for ( var x = 0 ; x < N ; x++ ) {
  for ( var y = 0 ; y < N ; y++ ) {
    var c = ShadowCircle.create({
      alpha: 1,
      r: 25,
      x: 300 + (x-(N-1)/2)*40,
      y: 300 + (y-(N-1)/2)*40,
      color: 'hsl(' + x/N*100 + ',' + (75+y/N*25) + '%, 60%)'
    });
    space.addChild(c);

    Movement.spring(mouse, c, -140+(x-(N-1)/2)*60, (y-(N-1)/2)*60, 3);
    Movement.inertia(c);
    Movement.friction(c, 0.9);

    c = BlurCircle.create({
      alpha: 1,
      r: 25,
      x: 700 + (x-(N-1)/2)*40,
      y: 300 + (y-(N-1)/2)*40,
      color: 'hsl(' + x/N*100 + ',' + (75+y/N*25) + '%, 60%)'
    });
    space.addChild(c);

    Movement.spring(mouse, c, 140+(x-(N-1)/2)*60, (y-(N-1)/2)*60, 3);
    Movement.inertia(c);
    Movement.friction(c, 0.9);
  }
}

