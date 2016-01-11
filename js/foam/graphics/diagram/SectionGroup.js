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
  name: 'SectionGroup',
  extends: 'foam.graphics.diagram.LinearLayout',

  label: 'Section Group',

  requires: ['foam.graphics.diagram.Section'],
    
  documentation: function() {/*
      A group of $$DOC{ref:'foam.graphics.diagram.Section',usePlural:true}, with a heading.
      Typically placed inside $$DOC{ref:'foam.graphics.diagram.Block',usePlural:true}.
    */},
  
  properties: [
    {
      name: 'orientation',
      defaultValue: 'vertical',
      documentation: function() {/* Force layout to vertical. */},
    },
    {
      name: 'titleSection',
      // type: 'foam.graphics.diagram.Section',
      documentation: function() {/* The $$DOC{ref:'foam.graphics.diagram.Section'} created
        to display the title text.
      */},
    },
    {
      name: 'title',
      type: 'String',
      documentation: function() {/* The title of the group. */},
    },
    {
      name: 'titleFont',
      type: 'String',
      defaultValue: 'bold 14px Roboto',
      documentation: function() {/* The font to use to display the title. */},
    },
    {
      name: 'titleColor',
      type: 'String',
      defaultValue: 'black',
      documentation: function() {/* The color to use to display the title. */},
    },
    {
      name: 'titleBackground',
      type: 'String',
      documentation: function() {/* The background color to use to display the title. */},
    },
    {
      name: 'titleBorder',
      type: 'String',
      documentation: function() {/* The border color to use to display the title. */},
    },
    {
      name: 'titleBorderWidth',
      type: 'String',
      documentation: function() {/* The border width to use to display the title. */},
    },
    {
      name: 'clipping',
      defaultValue: true,
      documentation: function() {/* Force clipping to true to contain children. */},
    },
    {
      name: 'width',
      install: null,
      documentation: function() {/* Disables animation, if set in $$DOC{ref:'foam.graphics.diagram.Block'}.  */},
    }
  ],
  
  methods: {
    init: function() {
      this.SUPER();
      this.construct();
    },
    construct: function() {
      /* Sets up the title section if not already there. */
      if (!this.titleSection) {
        this.titleSection = this.Section.create({title$: this.title$, titleFont$: this.titleFont$, 
                                color$: this.titleColor$, background$: this.titleBackground$, border$: this.titleBorder$,
                                borderWidth$: this.titleBorderWidth$  });
        this.myLinkPoints$ = this.titleSection.myLinkPoints$;
      }
      this.addChild(this.titleSection);
    },
    addLinkPoints: function() {
      /* No points to add... we just use our title section's points. */
    }

  }


});

