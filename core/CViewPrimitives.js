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
  name: 'LinearLayout',
  extendsModel: 'CView2',
  package: 'canvas',
  traits: [ 'layout.LinearLayoutTrait', 
            'layout.LayoutItemHorizontalTrait',
            'layout.LayoutItemVerticalTrait' ],



  methods: {
      init: function() {
        this.SUPER();

        var self = this;
        // if we change size, redo internal layout
        this.X.dynamic(function() { self.width; self.height; },
                       this.performLayout); // TODO: don't react to orientation-independent one

      },
      addChild: function(child) { /* Adds a child $$DOC{ref:'CView2'} to the scene
                                     under this. Add our listener for child constraint
                                     changes. */
        this.SUPER(child);

        // listen for changes to child layout constraints
        var constraints = this.orientation === 'horizontal'?
                            child.horizontalConstraints :
                            child.verticalConstraints;
        constraints.addListener(this.performLayout);
        constraints.preferred.addListener(this.updatePreferredSize);
      },
      removeChild: function(child) { /* Removes a child $$DOC{ref:'CView2'} from the scene. */
        // unlisten
        var constraints = this.orientation === 'horizontal'?
                            child.horizontalConstraints :
                            child.verticalConstraints;
        constraints.removeListener(this.performLayout);
        constraints.preferred.removeListener(this.updatePreferredSize);
                
        this.SUPER(child);
      }
    }
  
});


MODEL({
  name: 'Margin',
  package: 'canvas',
  extendsModel: 'CView2',
  traits: [ 'layout.MarginTrait',
            'layout.LayoutItemHorizontalTrait',
            'layout.LayoutItemVerticalTrait' ],
});


MODEL({
  name:  'BorderTrait',
  package: 'canvas',
  documentation: function() {/* Add $$DOC{ref:'BorderTrait'} to a CView2 to paint
                              a rectangular border around your item. */},

  properties: [
    {
      name:  'border',
      label: 'Border Color',
      type:  'String',
      defaultValue: undefined
    },
    {
      name:  'borderWidth',
      type:  'int',
      defaultValue: 1
    },
    {
      name: 'background',
      defaultValue: 'rgba(0,0,0,0)'
    }
  ],

  methods: {

    paintSelf: function() { /* make sure to call <code>this.SUPER();</code> in
                                your BorderTrait using model's $$DOC{ref:'.paintSelf'}. */
      this.SUPER();

      var c = this.canvas;
      c.save();

      c.globalAlpha = this.alpha;

      if ( this.background ) {
        c.fillStyle = this.background;

        c.beginPath();
        c.rect(0, 0, this.width, this.height);
        c.closePath();
        c.fill();
      }

      if ( this.border ) {
        c.lineWidth = this.borderWidth;
        c.strokeStyle = this.border;
        c.beginPath();
        c.rect(0, 0, this.width, this.height);
        c.closePath();
        c.stroke();
      }

      c.restore();
    }
  }
});


MODEL({
  name:  'SimpleRectangle',
  extendsModel: 'CView2',
  package: 'canvas',

  traits: [ 'canvas.BorderTrait' ]
});

MODEL({
  name: 'Rectangle',
  package: 'canvas',
  extendsModel: 'canvas.SimpleRectangle',
  traits: [ 'layout.LayoutItemHorizontalTrait', 'layout.LayoutItemVerticalTrait' ],
});


MODEL({
  name:  'Label',

  extendsModel: 'CView2',

  package: 'canvas',

  traits: [ 'layout.LayoutItemHorizontalTrait', 'layout.LayoutItemVerticalTrait' ],

  properties: [
    {
      name:  'textAlign',
      label: 'Text Alignment',
      type:  'String',
      defaultValue: 'left',
      help: "Text alignment can be left, right, center, or the locale aware start and end."
    },
    {
      name: 'text',
      aliases: 'data',
      type: 'String',
      defaultValue: ""
    },
    {
      name: 'font',
      type: 'String',
      defaultValue: "",
      help: "CSS-style font description string"
    },
    {
      name: 'background',
      defaultValue: 'rgba(0,0,0,0)'
    },
    {
      model_: 'IntProperty',
      name: 'padding',
      defaultValue: 5
    },
    {
      model_: 'BooleanProperty',
      name: 'isShrinkable',
      defaultValue: false,
      documentation: function() {/* Indicates if the minimum size constraint should
        be the same as the preferred size, preventing font shrinking. */}
    }

  ],

  methods: {

    init: function() {
      this.SUPER();

      Events.dynamic(
            function() { this.text; this.font; this.canvas; this.padding; }.bind(this),
            this.updatePreferred );
      this.updatePreferred();
    },

    paintSelf: function() {
      this.SUPER();

      var c = this.canvas;
      c.save();

      c.textBaseline = 'top';
      c.fillStyle = this.color;
      if (this.font) c.font = this.font;
      c.fillText(this.text, this.padding, this.padding, this.width-(this.padding*2));

      c.restore();
    }
  },

  listeners: [
    {
      name: 'updatePreferred',
      isFramed: true,
      code: function() {
        var c = this.canvas;
        if (c) {
          // width of text
          c.save();
          if (this.font) c.font = this.font;
          this.horizontalConstraints.preferred.val = c.measureText(this.text).width + this.padding*2;
          c.restore();
          if (!this.isShrinkable) { // if no shrink, lock minimum to preferred
            this.horizontalConstraints.min.val = this.horizontalConstraints.preferred.val;
          }
          // height (this is not directly accessible... options include putting
          // a span into the DOM and getting font metrics from that, or just going
          // by raw font height setting (which is always pixels in a canvas)
          if (!this.font) this.font = c.font;

          var height = parseInt(/[0-9]+(?=pt|px)/.exec(this.font) || 0);
          this.verticalConstraints.preferred.val = height + this.padding*2;

          if (!this.isShrinkable) { // if no shrink, lock minimum to preferred
            this.verticalConstraints.min.val = this.verticalConstraints.preferred.val;
          }
        }

      }
    }
  ]



});




















