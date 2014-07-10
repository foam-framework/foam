var space   = CView2.create({width: 1500, height: 800, background:'black'});
var mouse   = Mouse.create();

MODEL({name: 'Circle', extendsModel: 'Circle2', properties: [
  { name: 'vx', defaultValue: 0 },
  { name: 'vy', defaultValue: 0 }
] });


MODEL({
  name: 'Collider',
  properties: [
    { name: 'children', factory: function() { return []; } }
  ],
  listeners: [
    {
      name: 'tick',
      code: function () {
        this.detectCollisions();
        this.start();
      }
    }
  ],
  methods: {
    start: function() {
      this.X.requestAnimationFrame(this.tick);
    },
    detectCollisions: function() {
      // console.log('tick: ', this.children.length);
      var cs = this.children;
      for ( var i = 0 ; i < cs.length ; i++ ) {
        var c1 = cs[i];
        for ( var j = i+1 ; j < cs.length ; j++ ) {
          var c2 = cs[j];
          var dx = c1.x - c2.x;
          //            console.log('dx: ', dx);
          if ( dx > 70 || dx < -70 ) continue;
          var dy = c1.y - c2.y;
          //            console.log('dy: ', dy);
          if ( dy > 70 || dy < -70 ) continue;

          var ds = dx*dx + dy*dy;
          var rs = c1.r + c2.r;
//          if ( i == 0 ) console.log(c1.x, c1.y, c2.x, c2.y, ds, rs*rs);
          if ( ds < rs*rs ) this.collide(c1, c2);
        }
      }
    },
    collide: function(c1, c2) {

    },
    add: function(c) { this.children.push(c); }
  }
});

var collider = Collider.create();

space.write(document);
mouse.connect(space.$);

function bounceOnWalls(c, w, h) {
  Events.dynamic(function() { c.x; c.y; }, function() {
    if ( c.x < c.r ) c.vx = Math.abs(c.vx);
    if ( c.x > w - c.r ) c.vx = -Math.abs(c.vx);
    if ( c.y < c.r ) c.vy = Math.abs(c.vy);
    if ( c.y > h - c.r ) c.vy = -Math.abs(c.vy);
  });
}

var cueBall = Circle.create({
  r: 30,
  color: 'white'
});
space.addChild(cueBall);

var center = Circle.create({
  r: 0,
  x: 1600,
  y: 400,
  color: 'white'
});
space.addChild(center);

var N = 7;
for ( var x = 0 ; x < N ; x++ ) {
  for ( var y = 0 ; y < N ; y++ ) {
    var c = Circle.create({
      r: 25,
      x: 600+(x-(N-1)/2)*80,
      y: 400+(y-(N-1)/2)*80,
      border: 'white',
      borderWidth: 0,
      color: 'hsl(' + x/N*100 + ',' + (35+y/N*100*60) + '%, 60%)'
    });
    space.addChild(c);

//  Movement.strut(mouse, c, (x-2)*20, (y-2)*20);
    Movement.spring(center, c, (x-(N-1)/2)*90-1000, (y-(N-1)/2)*90);
    Movement.inertia(c);
    Movement.friction(c, 0.99);
    bounceOnWalls(c, space.width, space.height);
    collider.add(c);
  }
}

collider.collide = function(c1, c2) {
  if ( c2 === cueBall ) {
    this.collide(c2, c1);
  } else if ( c1 === cueBall ) {
    var a = Math.atan2(c2.y-c1.y, c2.x-c1.x);
    c2.vx += 25 * Math.cos(a);
    c2.vy += 25 * Math.sin(a);
  } else {
    var a = Math.atan(c1.y-c2.y, c1.x-c2.x);
    var d = Movement.distance(c1.y-c2.y, c1.x-c2.x);
    var m = (d - (c1.r+c2.r) ) / 2;
    c1.x += m * Math.cos(-a);
    c1.y += m * Math.sin(-a);
    c2.x += m * Math.cos(a);
    c2.y += m * Math.sin(a);

    var vx1 = c1.vx;
    var vy1 = c1.vy;
    var vx2 = c2.vx;
    var vy2 = c2.vy;

    c2.vx += c1.vx/2;
    c1.vx /= 2;
    c2.vy += c1.vy/2;
    c1.vy /= 2;

    c1.vx += c2.vx/2;
    c2.vx /= 2;
    c1.vy += c2.vy/2;
    c2.vy /= 2;
  }
};
Movement.strut(mouse, cueBall, 0, 0);
collider.add(cueBall);
collider.start();