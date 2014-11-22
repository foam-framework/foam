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
      model_: 'IntProperty',
      name: 'distanceToClear',
      defaultValue: 0,
      documentation: function() {/* The distance from the link point to the edge of the 
           owner (typically half the width or half the height for a centered link). */}
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
           this.updateClearing();
          }.bind(this)
       );
    },
    unbindPositioning: function() {
      if (this.dynamicListeners_ && this.dynamicListeners_.destroy) {
        this.dynamicListeners_.destroy();
      }
    },
    
    offsetBy: function(amount) {
      if(this.side === 'top') {
        return { x: this.x, y: this.y - amount };
      } else
      if(this.side === 'bottom') {
        return { x: this.x, y: this.y + amount };
      } else
      if(this.side === 'left') {
        return { x: this.x - amount, y: this.y };
      } else           
      if(this.side === 'right') {
        return { x: this.x + amount, y: this.y };
      }             
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
      name: 'updateClearing',
      isFramed: true,
      code: function() {
        if(this.side === 'top' || this.side === 'bottom') {
          this.distanceToClear = this.owner.width/2;
        } else
        if(this.side === 'left' || this.side === 'right') {
          this.distanceToClear = this.owner.height/2;
        }    
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
  
  //imports: ['linkPoints'],

  properties: [
    {
      name: 'orientation',
      defaultValue: 'vertical'
    },
    {
      name: 'myLinkPoints',
      type: 'DAOProperty',
      factory: function() { return []; }
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
        
        //this.linkPoints.push(pt1);
        this.myLinkPoints.push(pt1);
      }
      {
        var pt2 = this.LinkPoint.create({owner: this, name: '2', side: 'bottom'});
        
        //this.linkPoints.push(pt2);
        this.myLinkPoints.push(pt2);
      }
      {
        var pt3 = this.LinkPoint.create({owner: this, name: '3', side: 'left'});
        
        //this.linkPoints.push(pt3);
        this.myLinkPoints.push(pt3);
      }
      {
        var pt4 = this.LinkPoint.create({owner: this, name: '4', side: 'right'});
        
        //this.linkPoints.push(pt4);
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

  //imports: ['linkPoints'],

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
        
        //this.linkPoints.push(pt3);
        this.myLinkPoints.push(pt3);
      }
      {
        var pt4 = this.LinkPoint.create({owner: this, name: '4', side:'right'});
        
        //this.linkPoints.push(pt4);
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
    },
    {
      name: 'arrowLength',
      model_: 'IntProperty',
      defaultValue: 20
    }

  ],

  methods: {
    paintSelf: function()  {
      this.SUPER();

      var c = this.canvas;
      c.save();

      var points = this.selectBestPoints();
      var s = points.start.offsetBy(this.arrowLength);
      var e = points.end.offsetBy(this.arrowLength);

      var H = 0;
      var V = 1;
      var sideDirs = { left: -1, right: 1, top: -1, bottom: 1 };

      // draw arrows
      c.save();
      
      // fake arrows
      c.lineWidth = 4;
      c.moveTo(points.start.x, points.start.y);
      c.lineTo(s.x, s.y);
      
      c.moveTo(points.end.x, points.end.y);
      c.lineTo(e.x,e.y);
      
      c.stroke();
      
      c.restore();

      // draw connector
      if (this.style === 'manhattan')
      {        
        // hor/vert orientation of points
        var sOr = (points.start.side==='left' || points.start.side==='right')? H : V;
        var eOr = (points.end.side==='left' || points.end.side==='right')? H : V;
        
        var sDir = sideDirs[points.start.side];
        var eDir = sideDirs[points.end.side];
        
        // check if the ideal direction is no good
        if (sOr === H) {
          if ((sDir > 0 && s.x > e.x)
              || (sDir < 0 && s.x < e.x)) {
            sOr = V;
            sDir = 0;
          }
        } else if (sOr === V) {
          if ((sDir > 0 && s.y > e.y)
              || (sDir < 0 && s.y < e.y)) {
            sOr = H;
            sDir = 0;
          }
        }
        if (eOr === H) {
          if ((eDir > 0 && s.x < e.x)
              || (eDir < 0 && s.x > e.x)) {
            eOr = V;
            eDir = 0;
          }
        } else if (eOr === V) {
          if ((eDir > 0 && s.y < e.y)
              || (eDir < 0 && s.y > e.y)) {
            eOr = H;
            eDir = 0;
          }
        }
        
        // if we reset the direction, find the new one
        if (sDir === 0) {
          if (sOr === V) {
            sDir = e.y - s.y;
          } else  {
            sDir = e.x - s.x;
          }
          sDir = sDir / Math.abs(sDir); // normalize
        }
        if (eDir === 0) {
          if (eOr === V) {
            eDir = s.y - e.y;
          } else  {
            eDir = s.x - e.x;
          }
          eDir = eDir / Math.abs(eDir); // normalize
        }
        
        if (sOr !== eOr) { // corner
          c.moveTo(s.x, s.y);
          if (sOr===H) {
            c.lineTo(e.x, s.y); 
          } else {
            c.lineTo(s.x, e.y); 
          }
          
          c.moveTo(e.x, e.y);
          if (eOr===H) {
            c.lineTo(s.x, e.y); 
          } else {
            c.lineTo(e.x, s.y); 
          }
        } else { // center split
          c.moveTo(s.x, s.y);
          if (sOr===H) {
            var half = s.x + (e.x - s.x) / 2;
            c.lineTo(half, s.y);
            c.lineTo(half, e.y);
          } else {
            var half = s.y + (e.y - s.y) / 2;
            c.lineTo(s.x, half);
            c.lineTo(e.x, half);
          }
          c.lineTo(e.x, e.y);
        }
        
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
      self.start.forEach(function(startP) {
        var start = startP.offsetBy(this.arrowLength);
        self.end.forEach(function(endP) {
          var end = endP.offsetBy(this.arrowLength);
          var dist = Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
          if (dist < smallest) {
            smallest = dist;
            smallestStart = startP;
            smallestEnd = endP;
          }
        }.bind(this));
      }.bind(this));
      return { start: smallestStart, end: smallestEnd }
    }

  }

});



