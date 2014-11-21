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

var outerLayout = X.canvas.LinearLayout.create({ width : 500, height: 300});
canv.addChild(outerLayout);

var spacer1e = X.canvas.Spacer.create({});
outerLayout.addChild(spacer1e);

var view = X.canvas.LinearLayout.create({width: 120, height: 300, orientation: 'vertical'});
outerLayout.addChild(view);

MODEL({
  name: 'BorderLabel',
  extendsModel: 'canvas.Label',
  traits: ['canvas.BorderTrait']

});

var spacer1 = X.canvas.Spacer.create({});
view.addChild(spacer1);

var block1 = X.diagram.Block.create({
       x: 0,
       y: 20,
       border: 'black',
       background: 'white',
       width: 120,
       height: 30,
  
}, canv.X); 
block1.horizontalConstraints.min = 50;
block1.horizontalConstraints.max = 50;
block1.verticalConstraints.min = 100;
block1.verticalConstraints.max = 100;

view.addChild(block1);

var sect1 = X.diagram.Section.create({
  title: 'A Model'
}, canv.X);
block1.addChild(sect1);
var sect2 = X.diagram.Section.create({
  title: 'propertyName',
  titleFont: '12px Roboto'
}, canv.X);
block1.addChild(sect2);




var spacer1b = X.canvas.Spacer.create({
  fixedHeight: 20,
  fixedWidth: 30
});
view.addChild(spacer1b);


var label1 = X.BorderLabel.create({
       x: 60,
       y: 25,
       color: 'blue',
       width: 120,
       height: 30,
       text: 'Hello World',
       border: 'red',
       borderWidth: 2

});
view.addChild(label1);

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


var block2 = X.diagram.Block.create({
       x: 120,
       y: 0,
       border: 'green',
       background: 'white',
       width: 120,
       height: 50,

}, canv.X);
var block2Margin = X.canvas.Margin.create({ left: 20, top: 8, bottom: 8, right: 30, height: 80});
block2Margin.addChild(block2);
outerLayout.addChild(block2Margin);

var sect1b = X.diagram.Section.create({
  title: 'More Model'
}, canv.X);
block2.addChild(sect1b);
var sect2b = X.diagram.Section.create({
  title: 'imports',
  titleFont: 'italic 12px Roboto'
}, canv.X);
block2.addChild(sect2b);
var spacer3 = X.canvas.Spacer.create();
spacer3.verticalConstraints.stretchFactor = 1;
block2.addChild(spacer3);


var link = X.diagram.Link.create({color: 'red'}, canv.X);
link.start = sect2b.myLinkPoints;
link.end = sect2.myLinkPoints;
canv.addChild(link);

//view.performLayout();
var mouse = X.Mouse.create();
mouse.connect(canv.$);

Events.dynamic(function() { mouse.x; mouse.y; }, function() {
  outerLayout.width = mouse.x;
  outerLayout.height = mouse.y;
});


///////////////////Editors

var editors = [block2, block2Margin, sect1b, sect2b, outerLayout];

editors.forEach(function(thing) {
  var editor = X.DetailView.create({ data: thing});
  editor.write(document);

});


