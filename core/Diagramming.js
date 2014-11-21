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
  name: 'DiagramItemTrait',
  package: 'diagram',

  documentation: function() {/* This trait overrides $$DOC{ref:'.addChild'} and $$DOC{ref:'.removeChild'}
       to introduce extra diagram-specific functionality. it is designed to work with $$DOC{ref:'CView2'}. */},

  properties: [
    {
      model_: 'IntProperty',
      name: 'globalX',
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name: 'globalY',
      defaultValue: 0
    },
    {
      name: 'parent',
      postSet: function() {
        if (this.dynamicListeners_ && this.dynamicListeners_.destroy) {
          this.dynamicListeners_.destroy();
        }
        this.dynamicListeners_ = Events.dynamic(function() { 
          this.globalX = this.parent.globalX + this.x;
          this.globalY = this.parent.globalY + this.y;
         }.bind(this))
      }
    },
    {
      name: 'dynamicListeners_',
      hidden: true
    }
  ],
  
  
});


MODEL({
  name: 'Diagram',
  package: 'diagram',

  extendsModel: 'CView2',
  traits: ['diagram.DiagramItemTrait'],

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
  name: 'ParentageListener',
  documentation: "Tracks changes in a parent chain and runs bind/unbind functions as parents enter or leave.",
  package: 'diagram',
  
  properties: [
    {
      name: 'data',
      preSet: function(old,nu) {
        // new data, so clean out all old parents
        if (this.boundParents_) this.removeParents(this.boundParents_);
        return nu;
      },
      postSet: function() { 
        // bind parents, add listeners for parent changes
        this.updateChain();
      },
    },
    {
      name: 'bindFn',
      type: 'Function',
      preSet: function(old,nu) {  
        if (nu && this.boundParents_) {
          this.boundParents_.map(nu); // we have items we're attached to, but didn't run bindFn on!
        }
        return nu;
      },      
    },
    {
      name: 'unbindFn',
      type: 'Function',
    },
    {
      name: 'boundParents_',
      hidden: true,
      documentation: "The items we have bound to, for later cleanup",
      //factory: function() { return []; }
    }
  ],
  methods: {
    removeParents: function(pList) {
      pList.clone().forEach(function(p) {
        p.parent$.removeListener(this.updateChain);
        if (this.unbindFn) this.unbindFn(p);
        this.boundParents_.remove(p);
        // don't recurse here since we already know exactly what we've bound to,
        //  and parentage may have changed
      }.bind(this));
    },
    addParent: function(p) {
      if (this.boundParents_.indexOf(p) === -1) { // we don't already have it
        if (this.bindFn) this.bindFn(p);
        p.parent$.addListener(this.updateChain);
        this.boundParents_.push(p);
        
        // recurse on parents of p
        if (p.parent) this.addParent(p.parent);
      }
    }
  },
  listeners: [
    {
      name: 'updateChain',
      isFramed: true,
      code: function() {
        if (!this.boundParents_) this.boundParents_ = [].clone();
        // brute force: remove all, redo parent chain
        this.removeParents(this.boundParents_);
        this.addParent(this.data);
      }
    }
  ]
  
});

MODEL({
  name: 'LinkPoint',
  package: 'diagram',
  //extendsModel: 'canvas.Point', // screws up ids

//  requires: ['diagram.ParentageListener as ParentageListener'],

  ids: ['owner','name','side'],

  properties: [
    // {
    //   name: 'parentage',
    //   type: 'ParentageListener',
    //   factory: function() {
    //     return this.ParentageListener.create({ bindFn: this.bindXY, unbindFn: this.unbindXY, data: this.owner });
    //   }
    // },
    {
      name: 'side',
      type: 'String',
      defaultValue: 'right', // left, top, bottom, right
      //postSet: function() { this.updatePosition(); },
    },
    {
      name: 'name',
      type: 'String'
    },
    {
      name: 'owner',
      preSet: function(old,nu) { this.unbindPositioning(); return nu; },
      postSet: function() { this.bindPositioning(); }
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
    },
    {
      name: 'dynamicListeners_',
      hidden: true
    }
  ],
  
  methods: {
    bindPositioning: function() {
        
      if (!this.owner || !this.positioningFunctionX || !this.positioningFunctionY) 
        return;
      
      this.dynamicListeners_ = Events.dynamic(
        function() { 
          this.owner.width; this.owner.height; this.owner.globalX; this.owner.globalY;
          this.side;
         }.bind(this),
         function() { 
           this.updatePosition();
          }.bind(this)
       );
      
      // // listen for changes to the owner width, height
//       this.owner.width$.addListener(this.updatePosition);
//       this.owner.height$.addListener(this.updatePosition);
//
//       Events.map(this.owner.globalX$, this.x$, this.positioningFunctionX);
//       Events.map(this.owner.globalY$, this.Y$, this.positioningFunctionY);
    },
    unbindPositioning: function() {
      if (this.dynamicListeners_ && this.dynamicListeners_.destroy) {
        this.dynamicListeners_.destroy();
      }
      // if (this.owner) {
      //   // unlisten for changes to the owner
      //   this.owner.width$.removeListener(this.updatePosition);
      //   this.owner.height$.removeListener(this.updatePosition);
      //
      //   Events.unfollow(this.owner.globalX$, this.x$, this.positioningFunctionX);
      //   Events.unfollow(this.owner.globalY$, this.Y$, this.positioningFunctionY);
      // }
    }    
  },
  
  listeners: [
    {
      name: 'updatePosition',
      isFramed: true,
      code: function() {
        this.x = this.positioningFunctionX(this.owner.globalX);
        this.y = this.positioningFunctionY(this.owner.globalY);
      }
    },
    {
      name: 'positioningFunctionX',
      documentation: function() {/* The function to position this point inside the $$DOC{ref:'.owner'}.
            Parameters (self, this.owner) are passed in to avoid binding confusion with <code>this</code>. 
            The default implementation positions the point based on $$DOC{ref:'.side'}. */},
      code: function(x) {
        if(this.side === 'top') {
          return x + (this.owner.width / 2);
        } else
        if(this.side === 'bottom') {
          return x + (this.owner.width / 2);
        } else
        if(this.side === 'left') {
          return x;
        } else           
        if(this.side === 'right') {
          return x + (this.owner.width);
        }                          
      },
      
    },
    {
      name: 'positioningFunctionY',
      documentation: function() {/* The function to position this point inside the $$DOC{ref:'.owner'}.
            Parameters (this, this.owner) are passed in to avoid binding confusion with <code>this</code>. 
            The default implementation positions the point based on $$DOC{ref:'.side'}. */},
      code: function(y) {
        if(this.side === 'top') {
          return y;
        } else
        if(this.side === 'bottom') {
          return y + (this.owner.height);
        } else
        if(this.side === 'left') {
          return y + (this.owner.height/2);
        } else           
        if(this.side === 'right') {
          return y + (this.owner.height/2);
        }
                          
      },
      
    },
  ]
});

MODEL({
  name: 'LinearLayout',
  package: 'diagram',
  
  extendsModel: 'canvas.LinearLayout',
  traits: ['diagram.DiagramItemTrait'],
});
MODEL({
  name: 'Margin',
  package: 'diagram',
  extendsModel: 'canvas.Margin',
  traits: ['diagram.DiagramItemTrait'],
});

MODEL({
  name: 'Block',
  package: 'diagram',
  
  requires: ['diagram.LinkPoint'],

  extendsModel: 'diagram.LinearLayout',
  traits: ['canvas.BorderTrait'],
  
  imports: ['linkPoints'],

  properties: [
    {
      name: 'orientation',
      defaultValue: 'vertical'
    },
    {
      name: 'myLinkPoints',
      type: 'DAOProperty',
      factory: function() { return []; }
//      dynamicValue: function() {
//        // proxy until this shows up in the context?
//        if (this.linkPoints) this.myLinkPoints = this.linkPoints.where(EQ(LinkPoint.OWNER, this));
//      }
    }
    
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
        var pt1 = this.LinkPoint.create({owner: this, name: '1', side: 'top'});
        
        this.linkPoints.push(pt1);
        this.myLinkPoints.push(pt1);
        
      }
      {
        var pt2 = this.LinkPoint.create({owner: this, name: '2', side: 'bottom'});
        
        this.linkPoints.push(pt2);
        this.myLinkPoints.push(pt2);
      }
      {
        var pt3 = this.LinkPoint.create({owner: this, name: '3', side: 'left'});
        
        this.linkPoints.push(pt3);
        this.myLinkPoints.push(pt3);
      }
      {
        var pt4 = this.LinkPoint.create({owner: this, name: '4', side: 'right'});
        
        this.linkPoints.push(pt4);
        this.myLinkPoints.push(pt4);
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

  extendsModel: 'diagram.LinearLayout',
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
      factory: function() { return []; }
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
        var pt3 = this.LinkPoint.create({owner: this, name: '3', side:'left'});
        
        this.linkPoints.push(pt3);
        this.myLinkPoints.push(pt3);
      }
      {
        var pt4 = this.LinkPoint.create({owner: this, name: '4', side:'right'});
        
        this.linkPoints.push(pt4);
        this.myLinkPoints.push(pt4);
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
      type: 'diagram.LinkPoint[]',
      documentation: function () {/* The potential starting points of the link. */},
    },
    {
      name: 'end',
      type: 'diagram.LinkPoint[]',
      documentation: function () {/* The potential ending points of the link. */},
    },
    {
      name: 'style',
      type: 'String',
      defaultValue: 'manhattan',
      documentation: function () {/* The connector style. Choose from manhattan. */},
    }

  ],

  methods: {
    paintSelf: function()  {
      this.SUPER();

      var c = this.canvas;
      c.save();

      var points = this.selectBestPoints();

      if (this.style === 'manhattan')
      {
        c.moveTo(points.start.x, points.start.y);
        c.lineTo(points.end.x, points.end.y);
        c.stroke();
      }

      c.restore();
    },

    selectBestPoints: function() {
      /* For each starting point, find the closest ending point.
        Take the smallest link distance. */
      var self = this;
      var BIG_VAL = 999999999;

      var smallest = BIG_VAL;
      var smallestStart;
      var smallestEnd;
      self.start.forEach(function(start) {
        self.end.forEach(function(end) {
          var dist = Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
          if (dist < smallest) {
            smallest = dist;
            smallestStart = start;
            smallestEnd = end;
          }
        });
      });
      return { start: smallestStart, end: smallestEnd }
    }

  }

});



