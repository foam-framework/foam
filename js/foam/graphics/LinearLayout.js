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
  package: 'foam.graphics',
  name: 'LinearLayout',
  extends: 'foam.graphics.CView',

  traits: [
    'foam.patterns.layout.LinearLayoutTrait',
    'foam.patterns.layout.LayoutItemHorizontalTrait',
    'foam.patterns.layout.LayoutItemVerticalTrait'
  ],

  documentation: function() {/* A $$DOC{ref:'foam.graphics.CView'} based
    linear layout. Use to lay out CView child items that include the
    $$DOC{ref:'foam.patterns.layout.LayoutItemHorizontalTrait'}
    $$DOC{ref:'foam.patterns.layout.LayoutItemVerticalTrait'} or
    traits depending on layout orientation.
  */},

  methods: {
    init: function() {
      this.SUPER();

      var self = this;
      // if we change size, redo internal layout
       this.X.dynamicFn(
         function() { self.width; self.height; },
         this.performLayout); // TODO: don't react to orientation-independent one
    },

    addChild: function(child) { /* Adds a child $$DOC{ref:'foam.graphics.CView'} to the scene
                                   under this. Add our listener for child constraint
                                   changes. */
      this.SUPER(child);

      // listen for changes to child layout constraints
      if (child.horizontalConstraints) {
        child.horizontalConstraints.subscribe(['constraintChange'], this.performLayout);
      }
      if (child.verticalConstraints) {
        child.verticalConstraints.subscribe(['constraintChange'], this.performLayout);
      }
    },

    removeChild: function(child) { /* Removes a child $$DOC{ref:'foam.graphics.CView'} from the scene. */
      // unlisten
      if (child.horizontalConstraints) {
        child.horizontalConstraints.unsubscribe(['constraintChange'], this.performLayout);
      }
      if (child.verticalConstraints) {
        child.verticalConstraints.unsubscribe(['constraintChange'], this.performLayout);
      }

      this.SUPER(child);
    },

    paintSelf: function(canvas) {
      /* To reduce the number of potential re-layout operations, only calculate
      a dirty layout when painting. A property change will cause a repaint,
      to $$DOC{ref:'foam.patterns.layout.LinearLayoutTrait.layoutDirty'} changing to true will
      cause a repaint. */
      this.SUPER(canvas);

      // only calculate layout on paint
      if ( this.layoutDirty ) {
//console.log("calculateLayout ", this.$UID);
        this.calculateLayout();

//console.log("  layout dirty? ", this.layoutDirty);
      }

      // Enable to debug layout
//       var c = this.canvas;
//       if ( c ) {
//         c.rect(0,0,this.width,this.height);
//         c.stroke();
//       }
      }
  }
});
