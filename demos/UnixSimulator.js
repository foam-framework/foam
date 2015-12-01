  var timer;
  apar(
     arequire('foam.ui.View'),
     arequire('foam.ui.DetailView'),
     arequire('System'),
     arequire('foam.ui.StringArrayView'),
     arequire('Label'),
     arequire('foam.util.Timer'),
     arequire('Developer'),
     arequire('foam.ui.Window')
  )(
   function() {
    var w = foam.ui.Window.create({window: window, name: 'iframe'});
    var X = w.Y;
    timer  = foam.util.Timer.create({interval:20}, X);
    var graphs = Canvas.create({width: 400, height: 700, background:'#fff'}, X);
    var space  = Canvas.create({width: 450, height: 700, background:'#fff'}, X);
    var space2 = Canvas.create({width: 450, height: 700, background:'#fff'}, X);

    // document.writeln("<table><tr><td>");
    var spaceView = space.write(X);
    // document.writeln("</td><td>");
    var graphsView = graphs.write(X);
    // document.writeln("</td><td>");
    var space2View = space2.write(X);
    // document.writeln("</td><tr></table>");

    var timerView = timer.write(X);

    var sys = System.create({
      parent: space,
      title: 'Multics',
      devColor: 'blue',
      font: '10pt arial',
      numDev: 100,
      features: ['sorting', 'search', 'paging', 'printing', 'editing', 'storage', 'viewing', '...' ],
      entities: ['users', 'groups', 'processes', 'devices', 'files', 'directories', 'print queues', 'print jobs', 'cron jobs'],
    }, X);

    var sys2 = System.create({
      parent: space2,
      title: 'Unix',
      numDev: 2,
      devColor: 'red',
      font: '10pt arial',
      features: sys.features,
      entities: sys.entities
    }, X);

    // document.writeln('<table><tr><td>');
    // var sysView = sys.write(X);
    // document.writeln('</td><td>');
    // var sys2View = sys2.write(X);
    // document.writeln('</td></tr></table>');

    space2.$.addEventListener('click', addPlatforms);

    graphs.addChildren(
      sys.codeGraph,
      sys.utilityGraph,
      sys.efficiencyGraph,
      sys2.codeGraph,
      sys2.utilityGraph,
      sys2.efficiencyGraph,
      Label.create({text:'Lines of Code', align: 'center', font:'14pt Arial', x:200, y:36}),
      Label.create({text:'Utility', align: 'center', font:'14pt Arial', x:200, y:274}),
      Label.create({text:'Efficiency', align: 'center', font:'14pt Arial', x:200, y:514})
    );

    sys.architecture  = System.getPrototype().mixed;
    sys2.architecture = System.getPrototype().mixed;
//    sys2.architecture = foam;

    X.dynamicFn(function () {
        //timer.second;
        timer.time;
      },
      function () {
        sys.tick(timer);
        sys2.tick(timer);
        space.children[0].paint();
        space2.children[0].paint();

        if ( timer.i % 10 == 0 ) {
          sys.codeGraph.addData(sys.totalCode, 1000);
          sys.utilityGraph.addData(sys.totalUtility(), 1000);
          sys.efficiencyGraph.addData(100*sys.totalUtility()/sys.totalCode, 1000);

          sys2.codeGraph.addData(sys2.totalCode, 1000);
          sys2.utilityGraph.addData(sys2.totalUtility(), 1000);
          sys2.efficiencyGraph.addData(100*sys2.totalUtility()/sys2.totalCode, 1000);

          sys.utilityGraph.maxValue = sys2.utilityGraph.maxValue = Math.max(1000, sys.utilityGraph.lastValue(), sys2.utilityGraph.lastValue());
          sys.efficiencyGraph.maxValue = sys2.efficiencyGraph.maxValue = Math.max(1000, sys.efficiencyGraph.lastValue(), sys2.efficiencyGraph.lastValue());
          sys.codeGraph.maxValue = sys2.codeGraph.maxValue = Math.max(1000, sys.codeGraph.lastValue(), sys2.codeGraph.lastValue());
        }
    });

   // space.paint();
   timer.start();

   function makeIDE() {
     var entities = [

     ];
     sys.title = "NetBeans";
     sys2.entities = [ "Repositories", "Source", "Libraries", "HTML/CSS", "IDL's", "DB Schema", "GUI's", "???", "???" ];

     sys2.title = "CHIME";
     sys2.entities = [ "Models", "Properties", "Actions", "Methods", "Listeners", "Topics", "Templates", "Unit Tests", "Issues" ];
   }

   function makeApps() {
     var entities = [

     ];
     sys.title = "Google";
     sys.entities = [ "Email", "Contacts", "ToDo's", "Calendar Evts", "Docs", "Spreadsheets", "Presentations", "Images", "..." ];

     sys2.title = "Google ???";
     sys2.entities = sys.entities;

     // change colours # number
     // create CRM strategy
     // change developer sizes
     // create 3rd dimension
   }

   function addPlatforms() {
      var systems = ['PDP 9', 'PDP 11', 'Primus', 'ADUS', 'Apollo', 'Cray', 'VAX', '8086', '68000', '80386', 'Sparc', 'MIPS', 'Next', 'HP/UX', 'RS/6000', 'Data General', 'Siemens', 'Sequent', 'Power PC', 'Alpha', '...', 'Linux', 'OSX', 'iOS', 'Android', 'ChromeOS' ];

      var proto = System.create(sys2); space2.removeChild(proto);
      function dim(s) {
         s.y += 200;
         s.height -= 200;
         s.width -= 100;
         X.animate(40000, function() {
            s.x = 400;
            s.y = 0;
            s.width = 20;
            s.height = 30;
            s.alpha = 0;
         },
       //  Movement.easeOut(1)
         Math.sqrt
      )();
      }
      dim(sys);
      dim(sys2);
      for ( var i = 0 ; i < 100 ; i++ ) {
        X.setTimeout((function(i) { return function() {
          proto.parent = space2;
          var sys = proto.model_.create(proto);
          sys.parent = space2;
          proto.parent = null;
          sys.architecture = sys2.architecture;
          sys.code = sys2.code;
          sys.title = i >= systems.length ? "???" : systems[i];
          space2.addChild(sys);
          dim(sys);
          X.dynamicFn(
            function() { timer.time; },
            function() { sys.parent = space2; sys.tick(timer); });
        }})(i), (i+1)*2000);
      }
   }
  });
