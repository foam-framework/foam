var space   = CView2.create({width: 2000, height: 1700, background:'black'});
var mouse   = Mouse.create();

MODEL({name: 'Circle', extendsModel: 'Circle2', properties: [
  { name: 'vx', defaultValue: 0 },
  { name: 'vy', defaultValue: 0 }
] });

space.write(document);
mouse.connect(space.$);

function distance(x1, x2) { Math.sqrt(x1*x1, x2*x2); }
function follow(mouse, c, dx, dy) {
  Events.dynamic(function() { mouse.x; mouse.y; }, function() {
    c.x = mouse.x + dx;
    c.y = mouse.y + dy;
  });
}
function friction(c) {
  Events.dynamic(function() { c.vx; c.vy; }, function() {
    c.vx *= 0.9;
    c.vy *= 0.9;
  });
}
function move(c) {
  Events.dynamic(function() { c.vx; c.vy; }, function() {
    c.x += c.vx;
    c.y += c.vy;
  });
}
function spring(mouse, c, dx, dy) {
  Events.dynamic(function() { mouse.x; mouse.y; c.x; c.y; }, function() {
    c.vx += -(c.x - mouse.x - dx)/Math.max(50, Math.abs(dx));
    c.vy += -(c.y - mouse.y - dy)/Math.max(50, Math.abs(dy));
  });
}
function springFollow(mouse, c, dx, dy) {
  spring(mouse, c, dx, dy);
  move(c);
  friction(c);
}

for ( var x = 0 ; x < 5 ; x++ ) {
  for ( var y = 0 ; y < 5 ; y++ ) {
    var c = Circle.create({
      r: 30,
      color: 'white',
      borderWidth: 12, // 90%
      border: 'hsl(' + x/.005 + ',' + (35+y/.005*60) + '%, 60%)'
    });

//    follow(mouse, c, (x-2)*100, (y-2)*100);
    springFollow(mouse, c, (x-2)*100, (y-2)*100);
    space.addChild(c);
  }
}
