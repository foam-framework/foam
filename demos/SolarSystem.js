var Planet = Circle;

var space = Canvas.create({width: 800, height: 600, background:'#000'});
document.writeln("<table><tr>");
document.writeln("<td valign=top>");
space.write(document);
document.writeln("</td>");

var timer = Timer.create({});

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

var tt = Turntable.create();
tt.write(document);
tt.paint();

Events.link(timer.propertyValue('time'), tt.propertyValue('time'));

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
