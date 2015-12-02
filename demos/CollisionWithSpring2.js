arequire('foam.graphics.Circle')(function() {

CLASS({
  name: 'Circ',
  extends: 'foam.graphics.Circle',
  traits: ['foam.physics.Physical']
});

var space    = foam.graphics.CView.create({
  width: 1500,
  height: 1000,
  background:'black'
});
var mouse    = Mouse.create();
var collider = foam.physics.Collider.create();
var bumper   = Circ.create({r: 30, color: 'white'});
var anchor   = Circ.create({r: 0, x: 1400, y: 400, color: 'white'});

function bounceOnWalls(c, w, h) {
  Events.dynamicFn(function() { c.x; c.y; }, function() {
    if ( c.x < c.r ) c.vx = Math.abs(c.vx);
    if ( c.x > w - c.r ) c.vx = -Math.abs(c.vx);
    if ( c.y < c.r ) c.vy = Math.abs(c.vy);
    if ( c.y > h - c.r ) c.vy = -Math.abs(c.vy);
  });
}

space.write();
space.addChild(bumper);
space.addChild(anchor);
mouse.connect(space.$);

var cs = [];

var N = 3;
for ( var x = 0 ; x < N ; x++ ) {
  cs[x] = [];
  for ( var y = 0 ; y < N ; y++ ) {
    var c = cs[x][y] = Circ.create({
      r: 25,
      x: 600+(x-(N-1)/2)*70,
      y: 400+(y-(N-1)/2)*70,
      color: 'hsl(' + x/N*100 + ',' + (70+y/N*30) + '%, 60%)'
    });
    space.addChild(c);

    if ( x ) Movement.spring2(c, cs[x-1][y], 80);
    if ( y ) Movement.spring2(c, cs[x][y-1], 80);
    if ( x && y ) Movement.spring2(c, cs[x-1][y-1], 113);

    Movement.inertia(c);
    Movement.friction(c, 0.97);
    bounceOnWalls(c, space.width, space.height);
    collider.add(c);
  }
}

var cs2 = [];
var N2 = 16;
for ( var i = 0 ; i < N2 ; i++ ) {
  var c = cs2[i] = Circ.create({r: 20, x:600+200*Math.sin(i/N2*2*Math.PI), y:300+200*Math.cos(i/N2*2*Math.PI), color: 'green'});
  space.addChild(c);
  Movement.inertia(c);
  Movement.friction(c, 0.97);
  // bounceOnWalls(c, space.width, space.height);
  collider.add(c);
  Movement.spring2(c, cs[Math.floor(N/2)][Math.floor(N/2)], 400, 1);
}
for ( var i = 0 ; i < cs2.length ; i++ ) Movement.spring2(cs2[i], cs2[(i+1) % cs2.length], 100);


collider.collide = function(c1, c2) {
  if ( c2 === bumper ) {
    this.collide(c2, c1);
  } else if ( c1 === bumper ) {
    var a = Math.atan2(c2.y-c1.y, c2.x-c1.x);
    c2.vx += 25 * Math.cos(a);
    c2.vy += 25 * Math.sin(a);
  } else {
    foam.physics.Collider.getPrototype().collide.call(this, c1, c2);
  }
};

Movement.strut(mouse, bumper, 0, 0);
collider.add(bumper);
collider.start();

});
