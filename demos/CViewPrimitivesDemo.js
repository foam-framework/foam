/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var canv = X.diagram.Diagram.create({width: 1000, height: 300});
canv.write(document);

var outerLayout = X.canvas.LinearLayout.create({});
canv.addChild(outerLayout);

var view = X.canvas.LinearLayout.create({width: 120, height: 300, orientation: 'vertical'});
outerLayout.addChild(view);

MODEL({
  name: 'BorderLabel',
  extendsModel: 'canvas.Label',
  traits: ['canvas.BorderTrait']

});

var spacer1 = X.canvas.Spacer.create({
  fixedHeight: 20,
  fixedWidth: 30
});
view.addChild(spacer1);

var rect1 = X.diagram.Block.create({
       x: 0,
       y: 20,
       border: 'black',
       background: 'white',
       width: 120,
       height: 30,
  
}, canv.X);
var sect1 = X.diagram.Section.create({
  title: 'A Model'
}, canv.X);
rect1.addChild(sect1);
var sect2 = X.diagram.Section.create({
  title: 'propertyName',
  titleFont: '12px Roboto'
}, canv.X);
rect1.addChild(sect2);

view.addChild(rect1);

var spacer1b = X.canvas.Spacer.create({
  fixedHeight: 20,
  fixedWidth: 30
});
view.addChild(spacer1b);


var rect2 = X.BorderLabel.create({
       x: 60,
       y: 25,
       color: 'blue',
       width: 120,
       height: 30,
       text: 'Hello World',
       border: 'red',
       borderWidth: 2

});
view.addChild(rect2);

var rect3 = X.canvas.Rectangle.create({
       x: 120,
       y: 30,
       border: 'red',
       width: 120,
       height: 30,
  
});
view.addChild(rect3);

var spacer2 = X.canvas.Spacer.create({
  fixedHeight: 20,
  fixedWidth: 50
});
outerLayout.addChild(spacer2);


var rect4 = X.diagram.Block.create({
       x: 120,
       y: 0,
       border: 'green',
       background: 'white',
       width: 120,
       height: 50,
  
}, canv.X);
var rect4Margin = X.canvas.Margin.create({ left: 20, top: 8, bottom: 8, right: 30, height: 80});
rect4Margin.addChild(rect4);
outerLayout.addChild(rect4Margin);

var sect1b = X.diagram.Section.create({
  title: 'More Model'
}, canv.X);
rect4.addChild(sect1b);
var sect2b = X.diagram.Section.create({
  title: 'imports',
  titleFont: 'italic 12px Roboto'
}, canv.X);
rect4.addChild(sect2b);


var link = X.diagram.Link.create({color: 'red'}, canv.X);
link.start = canv.X.linkPoints[1];
link.end = canv.X.linkPoints[9];
canv.addChild(link);

//view.performLayout();
var mouse = X.Mouse.create();
mouse.connect(canv.$);

Events.dynamic(function() { mouse.x; mouse.y; }, function() {
  outerLayout.width = mouse.x;
  outerLayout.height = mouse.y;
});

var editor1 = X.DetailView.create({ data: rect1 });
editor1.write(document);

var editor1b = X.DetailView.create({ data: spacer1 });
editor1b.write(document);

var editor2 = X.DetailView.create({ data: rect2});
editor2.write(document);

var editor3 = X.DetailView.create({ data: rect3});
editor3.write(document);

var editor4 = X.DetailView.create({ data: rect4});
editor4.write(document);
var editor4b = X.DetailView.create({ data: rect4Margin});
editor4b.write(document);

var editorV = X.DetailView.create({data: view});
editorV.write(document);

// var label = X.canvas.Label.create({
//      x: 20,
//      y: 20,
//      color: 'black',
//      width: 100,
//      height: 30,
//      text: "hello world",
//      font: "12pt Roboto"
//    });
// var box = X.canvas.Rectangle.create({
//     x: 10,
//     y: 10,
//     color: '#ff00ff',
//     width: 100,
//     height: 20,
//     border: "blue"
//   });
//
// var circle = X.Circle2.create({
//    x: 10,
//    y: 10,
//    color: 'red',
//    radius: 20,
//
//  });
//
// view.addChild(box);
// view.addChild(circle);
// view.addChild(label);

