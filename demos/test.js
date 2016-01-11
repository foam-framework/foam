apar(
  arequire('foam.util.Timer'),
  arequire('foam.ui.DetailView'),
  arequire('foam.ui.TableView')
)(function() {

var Bookmark = X.foam.lib.bookmarks.Bookmark;

var aDAO = [].dao;

aDAO.put(Bookmark.create({id: 1, title: 'title1'}));
aDAO.put(Bookmark.create({id: 2, title: 'title2'}));
aDAO.put(Bookmark.create({id: 3, title: 'title3'}));
aDAO.remove(2);

CLASS({
  name: 'Test',
  properties: [
    {
      name: 'cv1',
      view: 'foam.ui.ChoiceView'
    },
    {
      name: 'cv2',
      view: { factory_: 'foam.ui.ChoiceView', size: 4, choices: ['A','B','C'] }
    },
    {
      name: 'notReq'
    },
    {
      name: 'reqField',
      required: true
    },
    {
      name: 'reqView',
      view: { factory_: 'foam.ui.TextFieldView', required: true }
    },
    {
      type: 'String',
      name: 'patternField',
      pattern: '###'
    },
    {
      name: 'patternView',
      view: { factory_: 'foam.ui.TextFieldView', pattern: '###' }
    },
    {
      type: 'Int',
      name: 'intStepView',
      view: { factory_: 'foam.ui.IntFieldView', step: 10 }
    },
    {
      type: 'Float',
      name: 'floatStepView',
      view: { factory_: 'foam.ui.FloatFieldView', step: .1 }
    },
    {
      name: 'setProperty',
      view: {
        factory_: 'foam.ui.MultiChoiceView',
        choices: ['foo','bar','baz','moo'],
        size: 4
      }
    },
    {
      name: 'setPropertyFromDAO',
      view: {
        factory_: 'foam.ui.MultiChoiceView',
        dao: aDAO,
        objToChoice: function(bookmark) { return [bookmark.id, bookmark.title]; },
        size: 4
      }
    }
  ]
});

var t = GLOBAL.t = Test.create();
t.write();
t.write();

CLASS({
  name: 'ArrayDAOExample',
  properties: [
    {
      type: 'Array',
      name: 'p1',
      subType: 'Bookmark'
      // No view: specified, so defaults to DAOController
    },
    {
      type: 'Array',
      name: 'p2',
      subType: 'Bookmark',
      view: { factory_: 'foam.ui.ArrayView', model: 'Bookmark', daoView: 'foam.ui.DAOListView' }
    }
  ]
});

/*
var ade = ArrayDAOExample.create({p2: [
  Bookmark.create({id: 1, title: 'title1', img: ''}),
  Bookmark.create({id: 1, title: 'title2', img: ''})
]});
ade.write();
*/

CLASS({
  name: 'Point',
  properties: [ 'x', 'y' ],
  methods: {
    scale: function(s) { this.x *= s; this.y *= s; }
  }
});

var p = Point.create({x: 10, y: 20});
p.scale(2);
p.x = p.y;
console.log(p.toJSON());

CLASS({
  name: 'Point3D',
  extends: 'Point',
  properties: [ 'z' ],
  methods: {
    scale: function(s) { this.SUPER(s); this.z *= s; }
  }
});

var p2 = Point3D.create({x: 1, y: 2, z: 3});
p2.scale(2);
console.log(p2.toJSON());

p2.write();

var dv = foam.ui.DetailView.create({data: p2});
dv.write();

var dv2 = foam.ui.DetailView.create({model: Point3D});
dv2.write();



var bookmarks = [];

bookmarks.push(Bookmark.create({index: 1, title: 'Google Blog', url: 'http://googleblog.blogspot.com/2011/09/happy-third-birthday-chrome.html'}));

// var models = [Model, Property];
var models = [
  Model,
  Property,
  Action,
  Method,
  Circle,
  Canvas,
  Rectangle,
  foam.util.Timer,
//  foam.input.Mouse,
//  EyeCView,
//  EyesCView,
//  ClockView,
//  TextFieldView,
  Bookmark
];

/*
  document.writeln(toHTML("id", Model, Model));
  document.write("<br/>");
  document.writeln(toHTML("id2", Model.properties[0], Property));
*/
document.write("<br/>");
//    document.writeln(toHTMLTable("id3", Property.properties, Property, Property.tableProperties));

document.writeln("=======================================");

document.writeln("<table><tr><td valign=top>");
var tv1 = foam.ui.TableView.create({model: Model, dao: models});
document.writeln(tv1.toHTML());
tv1.initHTML();

document.writeln("</td><td><font size=-1>");
var dv = foam.ui.DetailView.create({model: Model});
document.writeln(dv.toHTML());
dv.initHTML();
document.writeln("</font></td></tr></table>");

tv1.selection$.addListener(function (src, property, oldValue, newValue) {
  if ( newValue )
    dv.data = tv1.selection.clone();
});

// Events.follow(tv1.selection, dv);
// dv.setModel(tv1.selection);

/*
  console.log("<br/><br/>Bookmark");
  console.log(Bookmark);

  var tvbm = TableView.create({model: Bookmark});
  tvbm.objs = bookmarks;
  document.writeln(tvbm.toHTML());
  tvbm.initHTML();
*/

document.write("<pre>");
document.write(JSONUtil.compact.stringify(Model));
document.write("\r\n");
document.write(JSONUtil.pretty.stringify(Model));
document.write("\r\n");
document.write("</pre>");
document.write("<textarea cols=120 rows=20>");
document.write(XMLUtil.stringify(Model));
document.write("\r\n");
document.write(XMLUtil.stringify(models));
document.writeln("</textarea>");

/*
  document.writeln(Model);
  document.writeln(Model.getPrototype());
  document.writeln(Model.getPrototype().create());
*/
var o = Model.create({ name: 'User', label: 'User' });

/*
  document.writeln("ModelObj: " + o);
  document.writeln("Model: " + o.model_);
  document.writeln("Model.name: " + o.name_);
*/
var example = X.$('uml');
var ctx     = example.getContext('2d');

drawUML(ctx,100,100,Model);
drawUML(ctx,400,100,Property);

ctx.beginPath();
ctx.moveTo(250,180);
ctx.lineTo(400,180);
ctx.stroke();

document.writeln("<br/><h2>Test Events</h2>");
var l = function(obj, property, oldValue, newValue)
{
  document.writeln("obj: " + obj + " property: " + property+ " oldValue: " + oldValue+ " newValue: " + newValue);
}

var pm = o.propertyValue('name');
document.writeln(pm + " val: " + pm.get());
//    pm.addListener(function() {document.writeln("name updated via property model")});

// o.addListener(l);
// o.addPropertyListener('name', l);
// o.addPropertyListener('label',l);

pm.set("foo");
pm.set("bar");

o.name = 'Group';
o.label = 'Group'

//     l("foo","bar","old", "new");

o.globalChange();

document.writeln(o);

var sm = SimpleValue.create("foo");
sm.addPropertyListener(l);

document.writeln(sm.get());
sm.set("bar");
document.writeln(sm.get());


document.writeln("<br/><h2>Test New Events</h2>");
var e = { __proto__: PropertyChangeSupport };

e.subscribe(['property','lname'], l);
e.subscribe(['property','age'], l);
e.subscribe(['property'], function (source,topic) { document.writeln("property: " + topic); });
e.subscribe([], function (source,topic) { document.writeln("global: " + topic); });
e.subscribe([], e.oneTime(function (source,topic) { document.writeln("one-time: " + topic); }));

//    document.writeln("subs: " + e.publishAsync(['property','age'], "************async***********", "*********async********"));
document.writeln("subs: " + e.publish(['property','age'], "old", "new"));
document.writeln("subs: " + e.publish(['property','lname'], "old", "new"));
document.writeln("subs: " + e.publish(['property','company'], "old", "new"));
document.writeln("subs: " + e.publish(['on','focus'], "old", "new"));

e.publish(['property','*'], "old", "new");
e.publish(['property','*'], "old", "new");

e.propertyChange('age', 10, 11);

/*
  e.subscribe(['test'], function (source,topic) { document.writeln("normal: " + topic); });
  e.subscribe(['test'], e.async(function (source,topic) { document.writeln("async: " + topic); }));
  e.subscribe(['test'], e.merged(function (source,topic) { document.writeln("merged: " + topic); }));

  e.publish(['test'], "foo", "bar");
  e.publish(['test'], "foo", "bar");
  e.publish(['test'], "foo", "bar");
  e.publish(['test'], "foo", "bar");
  e.publish(['test'], "foo", "bar");
  e.publish(['test'], "foo", "bar");

*/
example = $('view');
var view = Canvas.create({width: 300, height: 30, background:'#fff'});

var v1 = TextFieldView.create();
var v2 = TextFieldView.create();
var v3 = ProgressView.create();
var v4 = ProgressCView.create();

view.addChild(v4);

document.writeln("<br/>");

v1.write();
v2.write();
v3.write();
view.write();

v2.data$ = v1.data$;
v3.data$ = v1.data$;
v4.data$ = v1.data$;

//    document.writeln("<br/>subs: " + e.subs_);

var sview = Canvas.create({width: 50, height: 300, background: '#fff'});
var s1 = ScrollCView.create({
  x:10, y:10, width: 30, height:290,
  value:100, extent:50, size: 500
});
sview.write();
sview.addChild(s1);
s1.paint();
var sv1 = DetailView.create({data: s1});
sv1.write();

/*
  var mmodels = models.concat(models).concat(models).concat(models).concat(models);

  mmodels = mmodels.concat(mmodels).concat(mmodels);
  mmodels = mmodels.concat(mmodels).concat(mmodels);
  mmodels = mmodels.concat(mmodels).concat(mmodels);
  mmodels = mmodels.concat(mmodels).concat(mmodels);
  mmodels = mmodels.concat(mmodels).concat(mmodels);
  mmodels = mmodels.concat(mmodels).concat(mmodels);
  mmodels = mmodels.concat(mmodels).concat(mmodels);
  mmodels = mmodels.concat(mmodels).concat(mmodels);
  mmodels = mmodels.concat(mmodels).concat(mmodels);
  console.log('************************************', mmodels.length);

  var stv = ScrollBorder.create({
  view: TableView.create({
  model: Model,
  dao: mmodels,
  rows: 20
  }),
  dao: mmodels,
  });

  stv.scrollbar.height=430;
  stv.write(document);
*/
document.writeln("<br/><h2>Test DetailView</h2>");


//    var user = new (o.getPrototype())();

document.writeln("<table width=1600><tr>");
//    document.writeln("<td width=500>");

DomValue.DEFAULT_EVENT = 'keyup';
o = Model;
var dv1 = DetailView.create({data: o});
document.writeln("<td valign=top width=500>");
dv1.write();
document.writeln("</td>");

/*
  var dv2 = DetailView.create({model: o.model_});
  dv2.set(o);
  document.writeln("<td width=500>");
  dv2.write();
  document.writeln("</td>");
*/
var dv3 = TextAreaView.create({displayHeight:120});
// dv3.setModel(o.model_);
document.writeln("<td width=500 valign=top>");
document.writeln(dv3.toHTML());
document.writeln("</td>");
dv3.initHTML();

document.writeln("<td width=500 valign=top>");
var dv4 = TextAreaView.create({displayHeight:120});
// dv4.setModel(o.model_);
document.writeln(dv4.toHTML());
document.writeln("</td>");
dv4.initHTML();
document.writeln("</tr></table>");

dv1.data = o;
// dv2.setModel(o);
/** TODO: fix
    dv3.setValue({
    __proto__: o,
    set: function (val) { return JSONUtil.parse(val);},
    get: function () { return JSONUtil.stringify(this); }
    });
    dv4.setValue({
    __proto__: o,
    set: function (val) { },
    get: function () { return XMLUtil.stringify(this); }
    });
    DomValue.DEFAULT_EVENT = 'change';
**/

document.writeln("<br/><h2>Test Property Linking</h2>");


var Planet = Circle;

var space = Canvas.create({width: 800, height: 600, background:'#000'});
document.writeln("<table><tr>");
document.writeln("<td valign=top>");
space.write();
document.writeln("</td>");

var timer = foam.util.Timer.create({});
// timer.start();

var sun    = Planet.create({r:30,x:400,y:300,color:'yellow'});
var venus  = Planet.create({r:6, color: 'green'});
var earth  = Planet.create({r:10, color: 'blue'});
var moon   = Planet.create({r:5, color:'lightgray'});
var apollo = Planet.create({r:3, color:'white'});
var mars   = Planet.create({r:8, color: 'red'});
var mmoons = [
  Planet.create({r:2, color: 'red'}),
  Planet.create({r:3, color: 'red'}),
  Planet.create({r:4, color: 'red'})
];
space.addChild(sun);
space.addChild(venus);
space.addChild(earth);
space.addChild(moon);
space.addChild(apollo);
space.addChild(mars);

Movement.orbit(timer,   sun,  venus,  80,  2007);
Movement.orbit(timer,   sun,  earth, 160,  6011);
Movement.orbit(timer,   sun,   mars, 260, 10007);
Movement.orbit(timer, earth,   moon,  50,  2049);
Movement.orbit(timer,  moon, apollo,  10,  1513);
//    Movement.moveTowards(timer, moon, apollo, 0.75);
for ( var i = 0 ; i < mmoons.length ; i++ ) { space.addChild(mmoons[i]); Movement.orbit(timer, mars, mmoons[i], 30+i*10, 1500+500*i); }
space.paint();

document.writeln("<td valign=top>");

var timerView = DetailView.create({data: timer, showActions: true});;
document.writeln(timerView.toHTML());
timerView.initHTML();

document.writeln("</td><td valign=top>");
var sunView = DetailView.create({data: sun});
document.writeln(sunView.toHTML());
sunView.initHTML();

var earthView = DetailView.create({data: earth});
document.writeln(earthView.toHTML());
earthView.initHTML();

document.writeln("</td>");
document.writeln("</tr></table>");


var dragon = Dragon.create({
  width: 1000,
  height: 1000,
  timer: timer
});

var tt = foam.graphics.Turntable.create();
//    space.addChild(tt);
tt.write();
tt.paint();
dragon.write();
dragon.paint();

// timer.start();
Events.link(timer.propertyValue('time'), tt.propertyValue('time'));

var dmouse = Mouse.create();
dmouse.connect(dragon.parent.$);
dragon.eyes.watch(dmouse);

document.writeln("<br/><h2>MoveTowards</h2>");
var field = Canvas.create({width:400, height:400, background:'#0d0'});
document.writeln(field.toHTML());
field.initHTML();

var bug1 = Circle.create({r:2, color: 'blue',   x: 50, y: 50});
var bug2 = Circle.create({r:2, color: 'red',    x: 350, y: 50});
var bug3 = Circle.create({r:2, color: 'yellow', x: 350, y: 350});
var bug4 = Circle.create({r:2, color: 'orange', x: 50, y: 350});

field.addChild(bug1);
field.addChild(bug2);
field.addChild(bug3);
field.addChild(bug4);

field.paint();
field.erase = function() {};


Movement.moveTowards(timer, bug1, bug2, 1.2);
Movement.moveTowards(timer, bug2, bug3, 0.8);
Movement.moveTowards(timer, bug3, bug4, 0.4);
//    Movement.moveTowards(timer, bug4, bug1, 0.22);

var mouse = Mouse.create();
mouse.connect(field.$);
Movement.orbit(timer, mouse, bug1, 80, 1500);
//    Movement.moveTowards(timer, mouse, bug1, 0.24);

document.writeln("<table><tr><td valign=top>");
var mouseView = DetailView.create({data: mouse});
document.writeln(mouseView.toHTML());
mouseView.initHTML();

document.writeln("</td><td>");

var bugView = DetailView.create({data: bug1});
document.writeln(bugView.toHTML());
bugView.initHTML();
document.writeln("</td></tr></table>");

var clock = ClockView.create({x:700,y:90,r:80,color:'red'});
space.addChild(clock);

var eye = EyeCView.create({x:60,y:60,r:50,color:'red'});
space.addChild(eye);
eye.watch(mars);

var graph = Graph.create({x:10,y:450,width:200,height:100,axisColor:'white',data:[1,2,3,4,5,4,3,2,1,4,6,8,10]});
space.addChild(graph);
graph.watch(apollo.y$);

var pie = PieGraph.create({lineColor: 'white', r:50, x:20, y:150});
space.addChild(pie);

var eyes = EyesCView.create({x:600,y:470});
space.addChild(eyes);
eyes.watch(earth);

var eyes2 = EyesCView.create({x:100,y:100});
field.addChild(eyes2);
eyes2.watch(mouse);

// todo: fix
//    Movement.orbit(timer,   sun,  eyes,  180,  1007);



document.writeln("<br/><h2>Controller</h2>");

var bookmarksDAO = bookmarks;
var ctrl2 = DAOController.create({
  model: Bookmark,
  dao: bookmarksDAO,
  selection: bookmarks[0]
}).addDecorator(ActionBorder.create({ actions: DAOController.actions }));

var stack2 = StackView.create();

stack2.write();
ctrl2.__proto__.stackView = stack2;
stack2.pushView(ctrl2, "Bookmarks");

var ctrl = DAOController.create({
  model: Model,
  dao: models,
  selection: Model
}).addDecorator(ActionBorder.create({ actions: DAOController.actions }));

var stack = StackView.create();

stack.write();
ctrl.__proto__.stackView = stack;
stack.pushView(ctrl, "Browse Models");
});
