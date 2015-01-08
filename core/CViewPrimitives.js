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
  package: 'foam.graphics',
  name: 'AnimatedPropertyTrait',
  
  properties: [
    'duration', 'interpolation',
    {
      name: 'install',
      defaultValue: function(prop) {      
        this.defineProperty(
          {
            name: prop.name+"$Animation",
            defaultValue: 0,
            hidden: true,
            documentation: function() { /* The animation controller. */ },
          }
        );
        
        // replace setter with animater
        var actualSetter = this.__lookupSetter__(prop.name);
        this.__defineSetter__(prop.name, function(nu) {
          // setter will be called on the instance, so "this" is an instance now
          this[prop.name+"$Animation"] && this[prop.name+"$Animation"]();

          this[prop.name+"$Animation"] = Movement.animate(
            prop.duration,
            actualSetter.apply(this, nu),
            prop.interpolation
          );
        });
        
      }
    }
  ],
  
  methods: {
    animPropInstallFn: function(prop) {      
      this.defineProperty(
        {
          name: prop.name+"$AnimationLatch",
          defaultValue: 0,
          hidden: true,
          documentation: function() { /* The animation controller. */ },
        }
      );

      var actualSetter = this.__lookupSetter__(prop.name);
      this.defineProperty(
        {
          name: prop.name+"$AnimationSetValue",
          defaultValue: 0,
          hidden: true,
          documentation: function() { /* The animation value setter. */ },
          postSet: function(_, nu) {
            //console.log("Anim internal set: ",  nu, this.$UID);
            actualSetter.call(this, nu);
          }
        }
      );
      
      // replace setter with animater
      this.__defineSetter__(prop.name, function(nu) {
        // setter will be called on the instance, so "this" is an instance now
        //console.log("Anim SET: ",  nu, this.$UID);
        
        var latch = this[prop.name+"$AnimationLatch"] ;
        latch && latch();
        //this[prop.name+"$AnimationLatch"] && this[prop.name+"$AnimationLatch"]().stop();

        var anim = Movement.animate(
          500, //prop.duration,
          function() { 
            this[prop.name+"$AnimationSetValue"] = nu; 
          }.bind(this),
          Movement.linear//ease(1,1) // prop.interpolation
        );
        this[prop.name+"$AnimationLatch"] = anim();
        
//         console.log("Anim: ",  nu, this.$UID);
//         this[prop.name+"$AnimationSetValue"] = nu;
      }); 
    } 
  }

});

CLASS({
  package: 'foam.graphics',
  name: 'AnimatedIntProperty',
  extendsModel: 'IntProperty',
  
  traits: ['foam.graphics.AnimatedPropertyTrait']
});
  

CLASS({
  package: 'foam.graphics',
  name: 'AnimatedYTrait',
  
  requires: ['foam.graphics.AnimatedIntProperty'],
  
  properties: [
     {
      name: 'y',
      //model_: 'AnimatedIntProperty',
      //interpolation: Movement.ease(0.2, 0.2),
      //duration: 500,
      install: X.foam.graphics.AnimatedPropertyTrait.getFeature('animPropInstallFn').code

    },
  ],
   
 });



CLASS({
  package: 'foam.graphics',
  name: 'AnimatedHeightTrait',
  
  requires: ['foam.graphics.AnimatedIntProperty'],
  
  properties: [
    {
      name: 'height',
      //model_: 'AnimatedIntProperty',
      //interpolation: Movement.ease(0.2, 0.2),
      //duration: 500,
      install: X.foam.graphics.AnimatedPropertyTrait.getFeature('animPropInstallFn').code

    }
  ],
   
 });
 


CLASS({
  package: 'foam.graphics',
  name: 'AnimatedAlphaTrait',
  
  requires: ['foam.graphics.AnimatedIntProperty'],
  
  properties: [
    {
      name: 'height',
      //model_: 'AnimatedIntProperty',
      //interpolation: Movement.ease(0.2, 0.2),
      //duration: 500,
      install: X.foam.graphics.AnimatedPropertyTrait.getFeature('animPropInstallFn').code

    }
  ],
   
 });


CLASS({
  package: 'foam.graphics',
  name: 'LinearLayout',
  extendsModel: 'foam.graphics.CView',

  traits: [
    'layout.LinearLayoutTrait',
    'layout.LayoutItemHorizontalTrait',
    'layout.LayoutItemVerticalTrait'
  ],

  methods: {
    init: function() {
      this.SUPER();

      var self = this;
      // if we change size, redo internal layout
       this.X.dynamic(
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
    }
  }
});


CLASS({
  package: 'foam.graphics',
  name: 'LockToPreferredLayout',
  extendsModel: 'foam.graphics.CView',

  documentation: function() {/*
      A simple layout for items not already in a layout. It will take the preferred
      size of its child and set the width and height of itself to match.
    */},

  methods: {
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
    }
  },
  listeners: [
    {
      name: 'performLayout',
      isFramed: true,
      code: function() {
        // lock our size to the child's preferred size
        if (this.children[0]) {
          if (this.children[0].horizontalConstraints) {
            this.width =  this.children[0].horizontalConstraints.preferred;
            this.children[0].width = this.width;
          }
          if (this.children[0].verticalConstraints) {
            this.height = this.children[0].verticalConstraints.preferred;
            this.children[0].height = this.height;
          }
        }
      }
    }
  ]

});


CLASS({
  package: 'foam.graphics',
  name: 'Margin',
  extendsModel: 'foam.graphics.CView',
  traits: [
    'layout.MarginTrait',
    'layout.LayoutItemHorizontalTrait',
    'layout.LayoutItemVerticalTrait'
  ],
});


CLASS({
  package: 'foam.graphics',
  name:  'BorderTrait',
  documentation: function() {/* Add $$DOC{ref:'.'} to a CView to paint
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
      defaultValue: 1,
      documentation: function() {/*
        The width to draw the border, straddling the item's edge. A width of 1
        will draw the item's rect exactly, a width of 2 will expand past the item's
        edge by 1 pixel (depending on canvas scaling).</p>
        <p>Note that a transparent border is still respected when drawing the
        background. A default border of 1 will leave a 1 pixel transparent area around
        the background fill, as if a border were to be drawn there. This can be
        useful in situations when you want to fill inside a border that has been
        drawn by an item underneath this item.
      */}
    },
    {
      name: 'background',
      defaultValue: 'rgba(0,0,0,0)'
    }
  ],

  methods: {
    paintSelf: function() { /* make sure to call <code>this.SUPER();</code> in
                                your BorderTrait model's $$DOC{ref:'.paintSelf'}. */
      this.SUPER();

      var c = this.canvas;
      c.save();

      c.globalAlpha = this.alpha;

      if ( this.background ) {
        c.fillStyle = this.background;

        c.beginPath();
        var hbw = this.borderWidth/2;
        c.rect(hbw, hbw, this.width-this.borderWidth, this.height-this.borderWidth);
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


CLASS({
  package: 'foam.graphics',
  name:  'SimpleRectangle',
  extendsModel: 'foam.graphics.CView',
  documentation: function() {/* A $$DOC{ref:'foam.graphics.CView'} rectangle with no layout capability. */},

  traits: [ 'foam.graphics.BorderTrait' ]
});


CLASS({
  package: 'foam.graphics',
  name: 'Rectangle',
  extendsModel: 'foam.graphics.SimpleRectangle',
  traits: [ 'layout.LayoutItemHorizontalTrait', 'layout.LayoutItemVerticalTrait' ],
  documentation: function() {/* A $$DOC{ref:'foam.graphics.CView'} rectangle that can be laid out. */}
});


CLASS({
  package: 'foam.graphics',
  name: 'Spacer',
  extendsModel: 'foam.graphics.CView',
  traits: [ 'layout.LayoutItemHorizontalTrait', 'layout.LayoutItemVerticalTrait' ],
  documentation: function() {/* A $$DOC{ref:'foam.graphics.CView'} layout spacer. No children
      or painting is supported. */},

  methods: {
    addChild: function() {/* Does nothing. */},
    removeChild: function() {/* Does nothing. */},
    paintSelf: function() {/* Does nothing. */},
    paint: function() {/* Does nothing. */},
    init: function() {
      this.SUPER();

      // change defaults
      this.horizontalConstraints.preferred = 0;
      this.verticalConstraints.preferred = 0;

      this.horizontalConstraints.stretchFactor$ = this.stretchFactor$;
      this.verticalConstraints.stretchFactor$ = this.stretchFactor$;

      // apply fixed settings if specified
      if (this.fixedWidth) this.fixedWidth = this.fixedWidth;
      if (this.fixedHeight) this.fixedHeight = this.fixedHeight;
    }
  },

  properties: [
    {
      name:  'fixedWidth',
      label: 'Fixed Width',
      type:  'String',
      defaultValue: '',
      help: "Optional shortcut to set a fixed width (integer or percent value).",
      documentation: "Optional shortcut to set a fixed width (integer or percent value).",
      postSet: function() {
        if (this.fixedWidth && this.horizontalConstraints) {
          this.horizontalConstraints.min = this.fixedWidth;
          this.horizontalConstraints.max = this.fixedWidth;
          this.horizontalConstraints.preferred = this.fixedWidth;
        }
      }
    },
    {
      name:  'fixedHeight',
      label: 'Fixed Height',
      type:  'ConstraintValue',
      defaultValue: '',
      help: "Optional shortcut to set a fixed height (integer or percent value).",
      documentation: "Optional shortcut to set a fixed width (integer or percent value).",
      postSet: function() {
        if (this.fixedHeight && this.verticalConstraints) {
          this.verticalConstraints.min = this.fixedHeight;
          this.verticalConstraints.max = this.fixedHeight;
          this.verticalConstraints.preferred = this.fixedHeight;
        }
      }
    },
    {
      name: 'stretchFactor',
      model_: 'IntProperty',
      defaultValue: 1
    }
  ]
});


CLASS({
  package: 'foam.graphics',
  name:  'Label',
  extendsModel: 'foam.graphics.CView',

  traits: [ 'layout.LayoutItemHorizontalTrait', 'layout.LayoutItemVerticalTrait' ],

  properties: [
    {
      name:  'textAlign',
      label: 'Text Alignment',
      type:  'String',
      defaultValue: 'left',
      help: 'Text alignment can be left, right, center, or the locale aware start and end.'
    },
    {
      name: 'text',
      aliases: 'data',
      type: 'String',
      defaultValue: ''
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
    },
    {
      name: 'clipped',
      defaultValue: true     
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
          this.horizontalConstraints.preferred = c.measureText(this.text).width + this.padding*2;
          c.restore();

          // if no shrink, lock minimum to preferred
          if ( ! this.isShrinkable )
            this.horizontalConstraints.min = this.horizontalConstraints.preferred;

          // height (this is not directly accessible... options include putting
          // a span into the DOM and getting font metrics from that, or just going
          // by raw font height setting (which is always pixels in a canvas)
          if ( ! this.font ) this.font = c.font;

          var height = parseInt(/[0-9]+(?=pt|px)/.exec(this.font) || 0);
          this.verticalConstraints.preferred = height + this.padding*2;

          // if no shrink, lock minimum to preferred
          if ( ! this.isShrinkable )
            this.verticalConstraints.min = this.verticalConstraints.preferred;
        }

      }
    }
  ]
});
