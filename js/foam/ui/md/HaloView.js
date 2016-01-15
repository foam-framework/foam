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
  name:  'HaloView',
  package: 'foam.ui.md',

  extends: 'foam.graphics.CView',

  requires: [
    'foam.ui.md.Halo',
    'foam.ui.md.HaloCViewView as CViewView'
  ],

  properties: [
    {
      name: 'background',
      defaultValue: 'rgba(0,0,0,0)'
    },
    {
      name: 'halo',
      type: 'ViewFactory',
      defaultValue: {
        factory_: 'foam.ui.md.Halo'
      }
    },
    {
      name: 'haloView',
      factory: function() {
        return this.halo({
          easeInTime$:   this.easeInTime$,
          easeOutTime$:  this.easeOutTime$,
          startAlpha$:   this.startAlpha$,
          pressedAlpha$: this.pressedAlpha$,
          finishAlpha$:  this.finishAlpha$,
          color$:        this.color$,
          recentering$:  this.recentering$
        }, this.Y);
      }
    },
    {
      name: 'style',
      documentation: 'solid|ring',
      defaultValue: 'solid',
      postSet: function(_, style) {
        if ( style !== this.RING_INNER_COLOR ) this.setColorAndBorder();
      }
    },
    {
      name: 'easeInTime',
      defaultValue: 200
    },
    {
      name: 'easeOutTime',
      defaultValue: 150
    },
    {
      name: 'startAlpha',
      defaultValue: 0.8
    },
    {
      name: 'pressedAlpha',
      defaultValue: 0.4
    },
    {
      name: 'finishAlpha',
      defaultValue: 0
    },
    {
      name: 'color'
    },
    {
      name: 'recentering',
      defaultValue: true
    }

  ],

  methods: {
    init: function() {
      this.SUPER();
      this.addChild(this.haloView);
    }
  }
});
