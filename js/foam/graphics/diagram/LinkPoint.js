/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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

CLASS({
  package: 'foam.graphics.diagram',
  name: 'LinkPoint',
  //extends: 'foam.graphics.Point', // screws up ids

//  requires: ['foam.graphics.diagram.ParentageListener as ParentageListener'],

  ids: ['owner','name','side'],

  documentation: function() {/* Represents one attachment point for a link.
    The point tracks the owner to keep updated on changes to its global
    canvas position.
  */},
  
  properties: [
    {
      name: 'side',
      type: 'String',
      defaultValue: 'right', // left, top, bottom, right
      //postSet: function() { this.updatePosition(); },
      
      documentation: function() {/* The side of the owner this link point
        projects from: left, top, bottom, or right. 
      */},
    },
    {
      name: 'name',
      type: 'String',
      
      documentation: function() {/* An optional name for the link. */},
    },
    {
      name: 'owner',
      preSet: function(old,nu) { this.unbindPositioning(); return nu; },
      postSet: function() { this.bindPositioning(); },
      
      documentation: function() {/* The object the link point is attached to. */},
    },
    {
      type: 'Int',
      name: 'x',
      defaultValue: 0,
      documentation: function() {/* The global-coordinate x position of the link
        point. 
      */},
    },
    {
      type: 'Int',
      name: 'y',
      defaultValue: 0,
      documentation: function() {/* The global-coordinate y position of the link
        point. 
      */},
    },
    {
      name: 'dynamicListeners_',
      hidden: true
    }
  ],
  
  methods: {
    bindPositioning: function() {
      /* Set up listeners to track the owner's position and size changes. */
      if (!this.owner || !this.positioningFunctionX || !this.positioningFunctionY) 
        return;
      
      this.dynamicListeners_ = Events.dynamicFn(
        function() { 
          this.owner.width; this.owner.height; this.owner.globalX; this.owner.globalY;
          this.side;
         }.bind(this),
         function() { 
           this.updatePosition();
          }.bind(this)
       );
    },
    unbindPositioning: function() {
      /* Unbind the listeners from any previous owner. */
      if (this.dynamicListeners_ && this.dynamicListeners_.destroy) {
        this.dynamicListeners_.destroy();
      }
    },
    
    offsetBy: function(amount) {
      /* Return this point offset by the given amount, in the direction that this
      link point projects from its owner. */
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
      //isFramed: true,
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

