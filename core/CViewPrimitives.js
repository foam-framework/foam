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
  traits: [ 'layout.LinearLayoutTrait'],

  methods: {
      init: function() {
        this.SUPER();

        var self = this;
        // if we change size, redo internal layout
        this.X.dynamic(function() { self.width; self.height; },
                       this.performLayout);
//        this.X.dynamic(function() { self.width; self.height; },
//                       function() { console.log(self.width, self.height);} );
      },
      addChild: function(child) { /* Adds a child $$DOC{ref:'CView2'} to the scene
                                     under this. Add our listener for child constraint
                                     changes. */
        this.SUPER(child);

        var constraints = this.orientation === 'horizontal'?
                            child.horizontalConstraints :
                            child.verticalConstraints;
        constraints.addListener(this.performLayout);
      }
    }
  
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
console.log("paint label", this.text);

      c.textBaseline = 'top';
      c.fillStyle = this.color;
      if (this.font) c.font = this.font;
      c.fillText(this.text, 0, 0, this.width);

      c.restore();
    }
  }
});




















