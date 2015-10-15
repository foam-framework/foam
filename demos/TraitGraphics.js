CLASS({
  name: 'ShadowCircle',
  extends: 'foam.graphics.Circle',
  traits: ['foam.physics.Physical', 'foam.graphics.Shadow']
});

CLASS({
  name: 'BlurCircle',
  extends: 'foam.graphics.Circle',
  traits: ['foam.physics.Physical', 'foam.graphics.MotionBlur']
});

apar(
  arequire('foam.graphics.Circle'),
  arequire('foam.graphics.MotionBlur'),
  arequire('foam.graphics.Shadow'),
  arequire('ShadowCircle'),
  arequire('BlurCircle'),
  arequire('foam.input.Mouse')
  )(function() {


var space   = foam.graphics.CView.create({width: 2000, height: 1700});
var mouse   = foam.input.Mouse.create();

space.write();
mouse.connect(space.$);

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

});
