var space   = CView2.create({width: 2000, height: 1700, background:'black'});
var mouse   = Mouse.create();

MODEL({name: 'Circle', extendsModel: 'Circle2', properties: [
  { name: 'vx', defaultValue: 0 },
  { name: 'vy', defaultValue: 0 }
] });

space.write(document);
mouse.connect(space.$);

function strut(mouse, c, dx, dy) {
  Events.dynamic(function() { mouse.x; mouse.y; }, function() {
    c.x = mouse.x + dx;
    c.y = mouse.y + dy;
  });
}
function friction(c, opt_coef) {
  var coef = opt_coef || 0.9;
  Events.dynamic(function() { c.vx; c.vy; }, function() {
    c.vx *= coef;
    c.vy *= coef;
  });
}
function inertia(c) {
  Events.dynamic(function() { c.vx; c.vy; }, function() {
    // Dynamic Friction
    c.x += c.vx;
    c.y += c.vy;
    // StaticFriction
    if ( c.x < 0.1 ) c.x = 0;
    if ( c.y < 0.1 ) c.y = 0;
  });
}
function spring(mouse, c, dx, dy, opt_strength) {
  var strength = opt_strength || 8;
  Events.dynamic(function() { mouse.x; mouse.y; c.x; c.y; }, function() {
    if ( dx === 0 && dy === 0 ) {
      c.x = mouse.x;
      c.y = mouse.y;
    } else {
      var d = Math.sqrt(dx*dx + dy*dy);
      var dx2 = c.x - mouse.x - dx;
      var dy2 = c.y - mouse.y - dy;
      var d2 = Math.sqrt(dx2*dx2 + dy2*dy2);
      var dv = -strength*d2/d;
      var a = Math.atan2(dy2, dx2);
      c.vx += dv * Math.cos(a);
      c.vy += dv * Math.sin(a);
    }
  });
}
function bounceOnWalls(c, w, h) {
  Events.dynamic(function() { c.x; c.y; }, function() {
    if ( c.x < 0 ) c.vx = Math.abs(c.vx);
    if ( c.x > w ) c.vx = -Math.abs(c.vx);
    if ( c.y < 0 ) c.vy = Math.abs(c.vy);
    if ( c.y > w ) c.vy = -Math.abs(c.vy);
  });
}

var N = 21;
for ( var x = 0 ; x < N ; x++ ) {
  for ( var y = 0 ; y < N ; y++ ) {
    var c = Circle.create({
      r: 4,
      color: 'white',
      borderWidth: 10,
      border: 'hsl(' + x/N*100 + ',' + (35+y/N*100*60) + '%, 60%)'
    });
    space.addChild(c);

//    strut(mouse, c, (x-2)*20, (y-2)*20);
    spring(mouse, c, (x-(N-1)/2)*20, (y-(N-1)/2)*20);
    inertia(c);
    friction(c, 0.85);
  }
}

mouse.x = mouse.y = 300;
