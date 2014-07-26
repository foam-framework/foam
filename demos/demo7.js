    var timer  = Timer.create();
    var tt     = Turntable.create();
    var dragon = Dragon.create({
      width:  1000,
      height: 800,
      timer:  timer
    });

    tt.time$ = timer.time$;

    var stack = StackView.create();

    document.writeln("<table><tr><td width=100% colspan=2>");
    stack.write(document);
    document.writeln("</td></tr><tr><td>");
    Dragon.write(document);
    document.writeln("</td><td width=60% valign=top><div>");
//    dragon.write(document);
    stack.setPreview(dragon);
    stack.setPreview = function() {};
    document.writeln("<table><tr><td>");
    timer.write(document);
    document.writeln("</td><td>");
    tt.write(document);
    document.writeln("</td></tr></table>");
    document.writeln("</div></td></tr></tabel>");

    tt.paint();
    dragon.paint();

    var dmouse = Mouse.create();
    dmouse.connect(dragon.parent.$);
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
