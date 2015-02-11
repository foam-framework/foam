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
  name:  'Label',
  extendsModel: 'foam.graphics.CView',

  traits: [ 'foam.patterns.layout.LayoutItemHorizontalTrait', 'foam.patterns.layout.LayoutItemVerticalTrait' ],

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
      //isFramed: true,
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

      },
      
      documentation: function() {/* Calculates the preferred size of this 
        $$DOC{ref:'foam.graphics.Label'} based on the actual text and font. 
      */},
    }
  ]
});
