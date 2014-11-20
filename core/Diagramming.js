/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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




MODEL({
  name: 'Diagram',
  package: 'diagram',

  extendsModel: 'CView2',

  exports: ['linkPoints'],

  properties: [
    {
      name: 'linkPoints',
      type: 'DAOProperty',
      documentation: function () {/* The shared store of linkable points in the diagram. */},
      factory: function() { return [].dao; }
    }
  ],

  methods: {
    paint: function()  {
      this.SUPER();
// DEBUG painting
      var c = this.canvas;
      c.save();
      this.linkPoints.forEach(function(pt) {
        c.fillStyle = "#FF0000";
        c.fillRect(pt.x-2, pt.y-2, 4, 4);

      }.bind(this));
      c.restore();
    }
  }
});



MODEL({
  name: 'LinkPoint',
  package: 'diagram',
  //extendsModel: 'canvas.Point', // screws up ids

  ids: ['owner','name','side'],

  properties: [
    {
      name: 'side',
      type: 'String',
      defaultValue: 'right' // left, top, bottom, right
    },
    {
      name: 'name',
      type: 'String'
    },
    {
      name: 'owner'
    },
    {
      model_: 'IntProperty',
      name: 'x',
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name: 'y',
      defaultValue: 0
    }
  ]
  
});


MODEL({
  name: 'Block',
  package: 'diagram',
  
  requires: ['diagram.LinkPoint'],

  extendsModel: 'canvas.LinearLayout',
  traits: ['canvas.BorderTrait'],
  
  imports: ['linkPoints'],

  properties: [
    {
      name: 'orientation',
      defaultValue: 'vertical'
    },
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.addLinkPoints();
    },
    // TODO: account for movement that changes our parent but not our x,y,width,height
    addLinkPoints: function() {
      {
        // make four points at our edges
        var pt1 = this.LinkPoint.create({owner: this, name: '1'});
        pt1.side = 'top';
        Events.dynamic(function() { this.x; this.y; this.width; this.height; }.bind(this),
                       function() { pt1.x = (0 + this.width / 2);
                                    pt1.y = (0);
                                    this.mapToCanvas(pt1);
                                  }.bind(this) )
        this.linkPoints.push(pt1);
      }
      {
        var pt2 = this.LinkPoint.create({owner: this, name: '2'});
        pt2.side = 'bottom';
        Events.dynamic(function() { this.x; this.y; this.width; this.height; }.bind(this),
                       function() { pt2.x = (0 + this.width / 2);
                                    pt2.y = (0 + this.height);
                                    this.mapToCanvas(pt2);
                                  }.bind(this) )
        this.linkPoints.push(pt2);
      }
      {
        var pt3 = this.LinkPoint.create({owner: this, name: '3'});
        pt3.side = 'left';
        Events.dynamic(function() { this.x; this.y; this.height; this.width; }.bind(this),
                       function() { pt3.x = (0);
                                    pt3.y = (0 + this.height/2);
                                    this.mapToCanvas(pt3);
                                  }.bind(this) )
        this.linkPoints.push(pt3);
      }
      {
        var pt4 = this.LinkPoint.create({owner: this, name: '4'});
        pt4.side = 'right';
        Events.dynamic(function() { this.x; this.y; this.height; this.width; }.bind(this),
                       function() { pt4.x = (0 + this.width);
                                    pt4.y = (0 + this.height/2);
                                    this.mapToCanvas(pt4);
                                  }.bind(this) )
        this.linkPoints.push(pt4);
      }
    }
  }
});

MODEL({
  name: 'Section',
  package: 'diagram',
  label: 'Section',

  requires: ['canvas.Label as Label',
             'diagram.LinkPoint'],

  extendsModel: 'canvas.LinearLayout',
  traits: ['canvas.BorderTrait'],

  imports: ['linkPoints'],

  properties: [
    {
      name: 'orientation',
      defaultValue: 'horizontal'
    },
    {
      name: 'title',
      type: 'String',
    },
    {
      name: 'titleFont',
      type: 'String',
      defaultValue: 'bold 14px Roboto'
    },
    {
      name: 'border',
      defaultValue: 'black'
    },
    {
      name: 'myLinkPoints',
      type: 'DAOProperty',
//      dynamicValue: function() {
//        // proxy until this shows up in the context?
//        if (this.linkPoints) this.myLinkPoints = this.linkPoints.where(EQ(LinkPoint.OWNER, this));
//      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.addChild(this.Label.create({text$: this.title$, font$: this.titleFont$}));
      this.verticalConstraints.max$ = this.verticalConstraints.preferred$Pix$;

      this.addLinkPoints();
    },
    // TODO: account for movement that changes our parent but not our x,y,width,height
    addLinkPoints: function() {
      {
        var pt3 = this.LinkPoint.create({owner: this, name: '3'});
        pt3.side = 'left';
        Events.dynamic(function() { this.x; this.y; this.height; this.width; }.bind(this),
                       function() { pt3.x = (0);
                                    pt3.y = (0 + this.height/2);
                                    this.mapToCanvas(pt3);
                                  }.bind(this) )
        this.linkPoints.push(pt3);
      }
      {
        var pt4 = this.LinkPoint.create({owner: this, name: '4'});
        pt4.side = 'right';
        Events.dynamic(function() { this.x; this.y; this.height; this.width; }.bind(this),
                       function() { pt4.x = (0 + this.width);
                                    pt4.y = (0 + this.height/2);
                                    this.mapToCanvas(pt4);
                                  }.bind(this) )
        this.linkPoints.push(pt4);
      }
    }

  }


});


MODEL({
  name: 'Link',
  package: 'diagram',

  extendsModel: 'CView2',

  properties: [
    {
      name: 'start',
      type: 'diagram.LinkPoint',
      documentation: function () {/* The starting point of the link. */},
    },
    {
      name: 'end',
      type: 'diagram.LinkPoint',
      documentation: function () {/* The starting point of the link. */},
    }
  ],

  methods: {
    paintSelf: function()  {
      this.SUPER();

      var c = this.canvas;
      c.save();

      c.moveTo(this.start.x, this.start.y);
      c.lineTo(this.end.x, this.end.y);
      c.stroke();

      c.restore();
    }
  }

});



