CLASS({
  name: 'Circ',
  extendsModel: 'foam.graphics.Circle',
  traits: ['foam.physics.Physical']
});

var space    = foam.graphics.CView.create({width: 1500, height: 800, background: 'white'});
var mouse    = Mouse.create();
var collider = foam.physics.Collider.create();
var bumper   = Circ.create({r: 30, color: 'gray'});
var anchor   = Circ.create({r: 0, x: 1400, y: 400, color: 'white'});

function bounceOnWalls(c, w, h) {
  Events.dynamic(function() { c.x; c.y; }, function() {
    if ( c.x < c.r ) c.vx = Math.abs(c.vx);
    if ( c.x > w - c.r ) c.vx = -Math.abs(c.vx);
    if ( c.y < c.r ) c.vy = Math.abs(c.vy);
    if ( c.y > h - c.r ) c.vy = -Math.abs(c.vy);
  });
}

space.write(document);
space.addChild(bumper);
space.addChild(anchor);
mouse.connect(space.$);

var N = 7;
for ( var x = 0 ; x < N ; x++ ) {
  for ( var y = 0 ; y < N ; y++ ) {
    var c = Circ.create({
      r: x == (N-1)/2 ? 32 : x % 2 ? 25 : 10,
      x: 600+(x-(N-1)/2)*100,
      y: 400+(y-(N-1)/2)*100,
      color: 'hsl(' + x/N*100 + ',' + (70+y/N*30) + '%, 60%)'
    });
    c.mass = c.r;
    space.addChild(c);

//    Movement.spring(anchor, c, (x-(N-1)/2)*90-800, (y-(N-1)/2)*90);
    Movement.inertia(c);
    Movement.friction(c, 0.99);
    bounceOnWalls(c, space.width, space.height);
    collider.add(c);
  }
}

collider.collide = function(c1, c2) {
  if ( c2 === bumper ) {
    this.collide(c2, c1);
  } else if ( c1 === bumper ) {
    var a = Math.atan2(c2.y-c1.y, c2.x-c1.x);
    c2.vx += 20 * Math.cos(a);
    c2.vy += 20 * Math.sin(a);
  } else {
    foam.physics.Collider.getPrototype().collide.call(this, c1, c2);
  }
};

Movement.strut(mouse, bumper, 0, 0);
collider.add(bumper);
collider.start();
