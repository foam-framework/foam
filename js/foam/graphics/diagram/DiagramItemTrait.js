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

CLASS({
  name: 'DiagramItemTrait',
  package: 'foam.graphics.diagram',

  documentation: function() {/* This trait adds a $$DOC{ref:'.globalX'} and $$DOC{ref:'.globalY'}
          that track the item's position relative to the canvas. It is designed to work with
           $$DOC{ref:'foam.graphics.CView'} or anything else with an x, y and parent 
          (with $$DOC{ref:'.'}).</p>
          <p>Note that for the coordinate transformation to work, you must apply this trait to 
          all items in the parent/child chain. Everything in a diagram should inherit $$DOC{ref:'.'}. */},

  ids: [ 'id' ],
          
  properties: [
    {
      name: 'id',
      getter: function() { return this.$UID__; }
    },
    {
      type: 'Int',
      name: 'globalX',
      defaultValue: 0,
      documentation: function() {/* The x position of the item, in canvas coordinates. */}
    },
    {
      type: 'Int',
      name: 'globalY',
      defaultValue: 0,
      documentation: function() {/* The y position of the item, in canvas coordinates. */}
    },
    {
      name: 'dynamicListeners_',
      hidden: true
    },
    {
      name: 'isLinkBlocking',
      type: 'Boolean',
      defaultValue: false,
      documentation: function() {/* If true, this item will register itself with the 
        root as a link routing blocking item. Links will attempt to avoid overlapping
        this item when routing. 
      */},
    }
  ],
  
  methods: {

    onAncestryChange_: function() {
      if (this.dynamicListeners_ && this.dynamicListeners_.destroy) {
        this.dynamicListeners_.destroy();
      }
      if ( this.parent ) {
        this.dynamicListeners_ = Events.dynamicFn(function() { 
          this.globalX = this.parent.globalX + this.x;
          this.globalY = this.parent.globalY + this.y;
        }.bind(this));
      }
    },
    
    addLinkBlocker: function(item) {
      /* Called by child when added to a parent, to report that it can block
      link routing. */
      // Only do something if the item can actually block links
      if ( item.isLinkBlocking ) {
        // if we can block links, we've already reported it and as the
        // child's container we should cover the child's rect already.
        if ( ! this.isLinkBlocking ) {
          this.parent && this.parent.addLinkBlocker && this.parent.addLinkBlocker(item); 
        }
      }
    },
    removeLinkBlocker: function(item) {
      /* Called by child when removed from a parent, to report that it can 
      no longer block link routing. */
      // Removing something that isn't there won't hurt, so ignore the checks
      this.parent && this.parent.removeLinkBlocker && this.parent.removeLinkBlocker(item); 
    },
    
    addChild: function(child) {
      /* Overridden to call $$DOC{ref:'addLinkBlocker'} if appropriate */
      this.SUPER(child);     
      this.addLinkBlocker(child);
      child.scanForLinkBlockers && child.scanForLinkBlockers();
    },
    removeChild: function(child) {
      /* Overridden to call $$DOC{ref:'removeLinkBlocker'} if appropriate */
      this.removeLinkBlocker(child);
      this.SUPER(child);
    },
    
    getDiagramRoot: function() {
      /* Find the root element of the diagram. */
      return (this.parent && this.parent.getDiagramRoot) ? this.parent.getDiagramRoot() : null;
    },
    
    scanForLinkBlockers: function() {
      /* Recursively scan all children and have them report link blockers. */
      if ( ! this.isLinkBlocking ) {
        this.children.forEach(function(c) {
          this.addLinkBlocker(c);
          c.scanForLinkBlockers && c.scanForLinkBlockers();
        }.bind(this));
      }
    }
  }
  
});

