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
  extends: 'foam.graphics.CView',

  traits: [
    'foam.patterns.layout.LayoutItemHorizontalTrait',
    'foam.patterns.layout.LayoutItemVerticalTrait'
  ],

  imports: [
    'document'
  ],

  properties: [
    {
      name:  'textAlign',
      label: 'Text Alignment',
      type:  'String',
      defaultValue: 'left',
      help: 'Text alignment can be left, right, center, or the locale aware start and end.',
      preSet: function(old,nu) {
        // TODO(jacksonic): account for locale
        if ( nu == 'start' ) {
          console.warn("Right-to-left support in foam.graphics.Label not available.");
          return 'left';
        }
        if ( nu == 'end' ) {
          console.warn("Right-to-left support in foam.graphics.Label not available.");
          return 'right';
        }
        return nu;
      }
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
      type: 'Int',
      name: 'padding',
      defaultValue: 5
    },
    {
      type: 'Boolean',
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

      Events.dynamicFn(
        function() { this.text; this.font; this.padding; }.bind(this),
        this.updatePreferred );

      this.updatePreferred();
    },

    paintSelf: function(c) {
      this.SUPER(c);

      c.save();

      c.textBaseline = 'top';
      c.textAlign = this.textAlign;
      c.fillStyle = this.color;
      if (this.font) c.font = this.font;
      if ( this.textAlign === 'center' ) {
        c.fillText(this.text, this.width/2, this.padding, this.width-(this.padding*2));
      } else if ( this.textAlign === 'right' ) {
        c.fillText(this.text, this.padding + this.width-(this.padding*2), this.padding, this.width-(this.padding*2));
      } else {
        c.fillText(this.text, this.padding, this.padding, this.width-(this.padding*2));
      }
      c.restore();
    }
  },

  listeners: [
    {
      name: 'updatePreferred',
      isFramed: false, // preferred size updates propagate up immediately
      code: function() {
        // TODO(jacksonic): Mark dirty and calculate the preferred size on next paint if possible.
        
        var e = this.document.createElement('canvas');
        var c = e.getContext('2d');

        // width of text
        c.save();
        if (this.font) c.font = this.font;
        this.horizontalConstraints.preferred =
          c.measureText(this.text).width + this.padding*2;
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
      },

      documentation: function() {/* Calculates the preferred size of this
        $$DOC{ref:'foam.graphics.Label'} based on the actual text and font.
      */},
    }
  ]
});
