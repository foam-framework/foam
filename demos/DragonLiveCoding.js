var timer;
apar(
   arequire('foam.ui.StackView'),
   arequire('foam.ui.DetailView'),
   arequire('foam.graphics.Turntable'),
   arequire('foam.demos.graphics.Dragon'),
   arequire('foam.input.Mouse')
)(function() {
  timer = Timer.create();

  var Dragon = X.foam.demos.graphics.Dragon;
  var tt     = X.foam.graphics.Turntable.create();
  var dragon = Dragon.create({
    width:  1000,
    height: 800,
    timer:  timer
  });
  var dragonModelView = foam.demos.graphics.Dragon.defaultView();
  var dragonView = dragon.toView_();
  var timerView = timer.defaultView();
  var ttView = tt.toView_();
  
  X.set('stack', X.foam.ui.StackView.create());

  document.body.innerHTML = document.body.innerHTML +
    "<table><tr><td width=100% colspan=2>" +
    X.stack.toHTML() +
    "</td></tr><tr><td>" +
    dragonModelView.toHTML() +
    "</td><td width=60% valign=top><div>" +
    dragonView.toHTML() +
    "<table><tr><td>" +
    timerView.toHTML() +
    "</td><td>" + 
    ttView.toHTML() +
    "</td></tr></table>" +
    "</div></td></tr></tabel>";

  X.stack.initHTML();
  dragonModelView.initHTML();
  dragonView.initHTML();
  timerView.initHTML();
  ttView.initHTML();

  X.stack.setPreview(dragon);
  X.stack.setPreview = function() {};

  tt.paint();
  dragon.paint();

  var dmouse = X.foam.input.Mouse.create();
  dmouse.connect(dragonView.$);
  dragon.eyes.watch(dmouse);

  Dragon.methods.forEach(function(meth) {
    Events.dynamic(function() {
      console.log(meth.name);
      try {
        Dragon.getPrototype()[meth.name] = eval(meth.code);
      } catch (e) {
        console.log(e);
      }
    });
  });

  tt.time$ = timer.time$;

  timer.start();
});
