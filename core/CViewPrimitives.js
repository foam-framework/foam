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
  name:  'Margin',

  extendsModel: 'CView2',

  package: 'canvas',

  traits: [ 'layout.LayoutItemHorizontalTrait',
            'layout.LayoutItemVerticalTrait' ],

  models: [
    {
      name: 'MarginProxy',
      extendsModel: 'layout.LayoutItemLinearConstraintsProxy',

      documentation: function() {/* Adds an $$DOC{ref:'.addAmount'} to the proxied constraints. */},

      properties: [
        {
          name: 'data',
          postSet: function() {
            var mapFn = function(val) { return val + this.addAmount }.bind(this);

            Events.map(this.data.preferred.pix$, this.preferred.val$, mapFn);
            Events.map(this.data.max.pix$, this.max.val$, mapFn);
            Events.map(this.data.min.pix$, this.min.val$, mapFn);

            Events.follow(this.data.stretchFactor$, this.stretchFactor$);
            Events.follow(this.data.shrinkFactor$, this.shrinkFactor$);
          }
        },
        {
          model_: 'IntProperty',
          name: 'addAmount',
          documentation: function() {/* The amount to add to the proxied pixel values. */},
          defaultValue: 0
        }
      ]
    }
  ],

  properties: [
    {
      model_: 'IntProperty',
      name:  'top',
      label: 'Top Margin',
      documentation: function() {/* Margin in pixels. */},
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name:  'left',
      label: 'Left Margin',
      documentation: function() {/* Margin in pixels. */},
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name:  'right',
      label: 'Right Margin',
      documentation: function() {/* Margin in pixels. */},
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name:  'bottom',
      label: 'Bottom Margin',
      documentation: function() {/* Margin in pixels. */},
      defaultValue: 0
    },
    {
      name: 'horizontalConstraints',
      documentation: function() {/* Horizontal layout constraints. Proxied from
          the child. */},
      factory: function() { /* override with our special proxy */
        return this.X.canvas.Margin.MarginProxy.create();
      }
    },
    {
      name: 'verticalConstraints',
      documentation: function() {/* Vertical layout constraints. Proxied from
          the child. */},
      factory: function() { /* override with our special proxy */
        return this.X.canvas.Margin.MarginProxy.create();
      }
    }

  ],
  methods: {
    init: function() {
      this.SUPER();

      Events.dynamic(
            function(){ this.top; this.left; this.right; this.bottom;
                        this.width; this.height; }.bind(this),
            this.updateMargins);
    },

    addChild: function(child) { /* Adds a child $$DOC{ref:'CView2'} to the scene
                                   under this. Add our listener for child constraint
                                   changes. */
      // remove any existing children so we only have at most one at all times
      this.children.forEach(this.removeChild);

      this.SUPER(child);

      // proxy the child's constraints into ours
      if (child.verticalConstraints)
        this.verticalConstraints.data = child.verticalConstraints;
      if (child.horizontalConstraints)
        this.horizontalConstraints.data = child.horizontalConstraints;


    },
    removeChild: function(child) { /* Removes a child $$DOC{ref:'CView2'} from the scene. */
      // unlisten
      this.verticalConstraints.data = undefined;
      this.horizontalConstraints.data = undefined;

      this.SUPER(child);
    }

  },

  listeners: [
    {
      name: 'updateMargins',
      isFramed: true,
      documentation: function() {/* Adjusts child item. */},
      code: function(evt) {
        this.verticalConstraints.addAmount = this.top+this.bottom;
        this.horizontalConstraints.addAmount = this.left+this.right;

        var child = this.children[0];
        if (child) {
          child.x = this.left;
          child.y = this.top;
          child.width = this.width - (this.left + this.right);
          child.height = this.height - (this.bottom + this.top);
        }
      }
    },
  ]
});



MODEL({
  name:  'Rectangle',

  extendsModel: 'CView2',

  package: 'canvas',

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

    paintSelf: function() {
      var c = this.canvas;
      c.save();

      c.globalAlpha = this.alpha;

      if ( this.color ) {
        c.fillStyle = this.color;

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
  name:  'Label',

  extendsModel: 'CView2',

  package: 'canvas',

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
    }

  ],

  methods: {

    paintSelf: function() {
      var c = this.canvas;
      c.save();

      c.textBaseline = 'top';
      c.fillStyle = this.color;
      if (this.font) c.font = this.font;
      c.fillText(this.text, 0, 0, this.width);

      c.restore();
    }
  }
});




















