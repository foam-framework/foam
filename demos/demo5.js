function setDisplay(txt) {
  $('display').innerHTML = txt;
}

var timer = Timer.create({interval:16});

document.writeln("<table><tr><td valign=top>");
var space = Canvas.create({width: 1000, height: 800, background:'#fff'});
space.write();
timer.write();

document.writeln("</td><td valign=top>");
document.writeln('<div id="display"></div>');
document.writeln("</td><tr></table>");

var Models = [
  'Models',
  'Properties',
  'Actions',
  'Methods',
  'Listeners',
  'Templates',
  'Unit Tests',
  'Issues',
  'Timer',
  'foam.input.Mouse',
  'EyeCView',
  'EyesCView',
  'ClockView',
  'Graph',
  'System',
  'Developer',
  'Canvas',
  'Circle',
  'Rect',
  'Box',
  'Label',
  'PowerInfo',
  'Backlite',
  'foam.ui.DAOController',
  'foam.ui.StackView',
  'NeedleMeter',
  'BatteryMeter',
  'BatteryGraph'
];

var sys = System.create({
  parent: space,
  title: 'FOAM',
  numDev: 2,
  devColor: 'red',
  features: [
    'Help',
    'Detail',
    'Table',
    'Summary',
    'XML',
    'JSON',
    'JS Proto',
    'Java Src.',
    'Dart Src.',
    'Actions',
    'Local DAO',
    'Trans. DAO',
    'UML',
    'Controller',
    'JavaDoc'
    /*
      'Sort',
      'Search',
      'Paging',
      'Printing',
      'SQL',
      'PDF',
      'ProtoBuf',
      'C++'
    */
  ],
  entities: Models,
});

var M = Movement;

var foam = function(system, dev)
{
  var r = Math.random();
  var nx = Math.floor(Math.random() * 100000) % system.features.length + 1;
  var ny = Math.floor(Math.random() * 100000) % system.entities.length + 1;

  if ( dev.f === undefined ) {
    dev.f = nx;
    dev.e = ny;
  }

  randomAct(
    10, function() {
      system.moveDev(dev, nx, ny);
    },
    5, function() {
      system.moveDev(dev, dev.f, dev.e);
    },
    50, function() {
      system.moveDev(dev, 0, ny);
    },
    50, function() {
      system.moveDev(dev, nx, 0);
    });

  system.addCode(dev.f, dev.e, 1);
};

sys.architecture = foam;

Events.dynamicFn(function () {
    //timer.second;
    timer.time;
  },
  function () {
    sys.tick(timer);
    space.paint();
  });

function protoToString(proto) {
  var buf = [];
  for ( var key in proto) {
    try {
      buf.push(key, ':', proto[key]);
      buf.push('\n');
    } catch(x) { }
  }
  return buf.join('');
}

Events.dynamicFn(function() { console.log(sys.selectedX, sys.selectedY); },
  function() {
    var MODELS = [Model, Property, Action, Method, Method, Template, UnitTest, Issue,
                  Timer, Mouse, EyeCView, EyesCView, ClockView, Graph, System, Developer, Canvas, Circle, Rectangle, Box, Label, Power, Screen, DAOController, StackView, NeedleMeter, BatteryMeter, BatteryGraph ];
    if ( sys.selectedY < 1 || sys.selectedX < 0 ) return;

    var model = MODELS[sys.selectedY-1];
    var obj = null;
    try {
      obj = model.create();
      for ( var key in model.properties ) {
        var prop = model.properties[key];
        obj.instance_[prop.name] = obj[prop.name];
      }
    } catch(x) { }
    var arr = [obj];
    var value = SimpleValue.create(obj);
    console.log("Model: ", model.name);

    switch ( sys.selectedX ) {
    case 0:
      setDisplay('<pre>' + model.toJSON() + '</pre>');
      break;
    case 1: setDisplay(HelpView.create({model: model}).toHTML()); break;
    case 2: var dv = DetailView.create({model: model, value: value}); setDisplay(dv.toHTML()); dv.initHTML(); break;
    case 3: setDisplay(TableView.create({model: model, value: SimpleValue.create(arr)}).toHTML()); break;
    case 4: setDisplay(SummaryView.create({model: model, value: value}).toHTML()); break;
    case 5: setDisplay("<textarea rows=100 cols=80>" + obj.toXML() + "</textarea>"); break;
    case 6: setDisplay("<pre>" + obj.toJSON() + "</pre>"); break;
    case 7: setDisplay("<textarea rows=100 cols=80>" + protoToString(model.getPrototype()) + '</textarea>'); break;
    case 8: setDisplay('<pre>' + model.javaSource() + '</pre>'); break;
    case 9: setDisplay('<pre>' + model.dartSource() + '</pre>'); break;
    case 10: setDisplay(JSONUtil.stringify(model.actions)); break;
    case 11:
      var dao = GLOBAL[model.plural] || GLOBAL[model.name + 'DAO'];
      if ( dao ) dao.select()(function(a) {
        setDisplay('<pre>' + JSONUtil.stringify(a) + '</pre>');
      });
      break;
    case 12: setDisplay(); break;
    case 13:
      setDisplay('<canvas id="uml" width=800 height=1000> </canvas>');
      var ctx = $('uml').getContext('2d');
      if ( GLOBAL.drawUML ) drawUML(ctx,100,100,model);
      break;
    case 14:
      GLOBAL.stack = StackView.create();
      setDisplay(stack.toHTML());
      stack.initHTML();

      FOAM.browse(model);
      //setDisplay();
      break;
    case 15:
      var dv = DetailView.create({model: Model, value: SimpleValue.create(model)}); setDisplay(dv.toHTML() ); dv.initHTML();
      break;
    }
  });

space.paint();
timer.start();
