var space   = CView2.create({width: 2000, height: 1700, background:'black'});
var mouse   = Mouse.create();

MODEL({name: 'Circle', extendsModel: 'Circle2', traits: ['Physical'] });

space.write(document);
mouse.connect(space.$);

function bounceOnWalls(c, w, h) {
  Events.dynamic(function() { c.x; c.y; }, function() {
    if ( c.x < 0 ) c.vx = Math.abs(c.vx);
    if ( c.x > w ) c.vx = -Math.abs(c.vx);
    if ( c.y < 0 ) c.vy = Math.abs(c.vy);
    if ( c.y > w ) c.vy = -Math.abs(c.vy);
  });
}

mouse.x = mouse.y = 300;

var N = 19;
for ( var x = 0 ; x < N ; x++ ) {
  for ( var y = 0 ; y < N ; y++ ) {
    var c = Circle.create({
      r: 8,
      x: 300 + (x-(N-1)/2)*25,
      y: 300 + (y-(N-1)/2)*25,
      color: 'hsl(' + x/N*100 + ',' + (70+y/N*30) + '%, 60%)'
    });
    space.addChild(c);

//  Movement.strut(mouse, c, (x-2)*20, (y-2)*20);
    Movement.spring(mouse, c, (x-(N-1)/2)*20, (y-(N-1)/2)*20);
    Movement.inertia(c);
    Movement.friction(c, 0.95);
  }
}

