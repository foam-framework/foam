var space   = CView2.create({width: 2000, height: 1700});
var mouse   = Mouse.create();



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
      color: 'hsl(' + x/N*100 + ',' + (75+y/N*25) + '%, 60%)'
    });
    space.addChild(c);

    Movement.spring(mouse, c, (x-(N-1)/2)*60, (y-(N-1)/2)*60, 3);
    Movement.inertia(c);
    Movement.friction(c, 0.9);
  }
}

