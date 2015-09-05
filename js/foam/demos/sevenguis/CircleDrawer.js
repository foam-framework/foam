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

MODEL({
  package: 'foam.demos.sevenguis',
  name: 'CircleDrawer',
  extendsModel: 'foam.ui.View',

  requires: [
    'foam.graphics.Circle',
    'foam.graphics.CView'
  ],

  constants: {
    SELECTED_COLOR: '#ddd',
    UNSELECTED_COLOR: 'white'
  },

  properties: [
    {
      name: 'selected',
      postSet: function(o, n) {
        if ( o ) o.color = this.UNSELECTED_COLOR;
        if ( n ) n.color = this.SELECTED_COLOR;
      }
    },
    {
      name: 'canvas',
      factory: function() {
        return this.CView.create({width: 500, height: 500, background: '#f3f3f3'});
      }
    },
  ],
  methods: [
    function initHTML() {
      this.SUPER();
      this.canvas.$.addEventListener('click', this.onClick);
      this.canvas.$.addEventListener('contextmenu', this.onRightClick);
    }
  ],
  listeners: [
    {
      name: 'onClick',
      code: function(evt) {
        var x = evt.offsetX;
        var y = evt.offsetY;
        var c = this.canvas.findChildAt(x, y);
        if ( c ) {
          this.selected = c;
        } else {
          this.canvas.addChild(this.Circle.create({
            x: x,
            y: y,
            r: 25,
            color: this.UNSELECTED_COLOR,
            border: 'black'}));
        }
        this.canvas.paint();
      }
    },
    {
      name: 'onRightClick',
      code: function(evt) {
        console.log('right-click: ', evt);
        evt.preventDefault();
      }
    }
  ],
  templates: [
    function toHTML() {/*
      Undo Redo <br> %%canvas
    */}
  ]
});
