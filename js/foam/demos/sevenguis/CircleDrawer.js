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
  traits: [ 'foam.memento.MementoMgr' ],

  requires: [
    'foam.demos.sevenguis.DiameterDialog',
    'foam.graphics.Circle',
    'foam.graphics.CView',
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
      name: 'memento',
      postSet: function(l, m) {
        if ( this.feedback_ ) return;
        this.canvas.children = [];
        for ( var i = 0 ; i < m.length ; i++ ) {
          var c = m[i];
          this.addCircle(c.x, c.y, c.r);
        }
        this.selected = null;
        this.canvas.view.paint(); // TODO: This shouldn't be necessary
      },
    },
    {
      name: 'mementoValue',
      factory: function() { return this.memento$; }
    },
    {
      name: 'canvas',
      factory: function() {
        return this.CView.create({width: 300, height: 300, background: '#f3f3f3'});
      }
    },
  ],
  methods: [
    function initHTML() {
      this.SUPER();
      this.canvas.$.addEventListener('click',       this.onClick);
      this.canvas.$.addEventListener('contextmenu', this.onRightClick);
GLOBAL.cd = this;
    },
    function addCircle(x, y, opt_d) {
      var d = opt_d || 25;
      var c = this.Circle.create({
        x: x,
        y: y,
        r: d,
        color: this.UNSELECTED_COLOR,
        border: 'black'});
      this.canvas.addChild(c);
      return c;
    },
    function updateMemento() {
      var m = [];
      var cs = this.canvas.children;
      for ( var i = 0 ; i < cs.length ; i++ ) {
        var c = cs[i];
        m.push({x: c.x, y: c.y, r: c.r});
      }
      this.feedback_ = true;
      this.memento = m;
      this.feedback_ = false;
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
          this.selected = this.addCircle(x, y);
          this.updateMemento();
        }
        this.canvas.paint();
      }
    },
    {
      name: 'onRightClick',
      code: function(evt) {
        evt.preventDefault();
        if ( ! this.selected ) return;
        var d = this.DiameterDialog.create({data: this.selected});
        d.write(document);
      }
    }
  ],
  templates: [
    function toHTML() {/*
      $$back $$forth<br>
      %%canvas
    */}
  ]
});
