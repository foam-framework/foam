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
    'foam.graphics.CView',
    'foam.graphics.Circle',
    'foam.ui.DetailView', // TODO: This shouldn't be required
    'foam.ui.md.PopupView'
  ],

  constants: {
    SELECTED_COLOR:   '#ddd',
    UNSELECTED_COLOR: 'white'
  },

  models: [
    {
      name: 'DiameterDialog',
      extendsModel: 'foam.ui.DetailView',

      templates: [
        function toHTML() {/*
          Adjust the diameter of the circle at ($$x{mode: 'read-only'}, $$y{mode: 'read-only'}).<br>
          $$r{model_: 'foam.ui.RangeView', maxValue: 200, onKeyMode: true}
        */}
      ]
    }
  ],

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
        this.canvas.removeAllChildren();
        for ( var i = 0 ; i < m.length ; i++ ) {
          var c = m[i];
          this.addCircle(c.x, c.y, c.r);
        }
        this.selected = null;
      },
    },
    {
      name: 'mementoValue',
      factory: function() { return this.memento$; }
    },
    {
      name: 'canvas',
      factory: function() {
        return this.CView.create({width: 600, height: 500, background: '#f3f3f3'});
      }
    },
  ],
  methods: [
    function initHTML() {
      this.SUPER();
      this.canvas.$.addEventListener('click',       this.onClick);
      this.canvas.$.addEventListener('contextmenu', this.onRightClick);
    },
    function addCircle(x, y, opt_d) {
      var c = this.Circle.create({
        x: x,
        y: y,
        r: opt_d || 25,
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
      }
    },
    {
      name: 'onRightClick',
      code: function(evt) {
        evt.preventDefault();
        if ( ! this.selected ) return;
        var p = this.PopupView.create({delegate: function() { return this.DiameterDialog.create({data: this.selected}); }.bind(this), layoutMode: 'relative'});
        p.open(this.$);

        // If the size is changed with the dialog, then create an updated memento
        var oldR = this.selected.r;
        var l = function(_, _, _, state) {
          if ( state === 'closed' ) {
            if ( this.selected.r !== oldR )
              this.updateMemento();
            p.state$.removeListener(l);
          }
        }.bind(this);
        p.state$.addListener(l);
      }
    }
  ],
  templates: [
    function CSS() {/*
      .CircleDrawer { width:610px; height: 600px; margin: 20px; }
      .CircleDrawer canvas { border: 1px solid black; }
      .CircleDrawer .md-card { font-size: 20px; }
      .CircleDrawer .actionButton { margin: 10px; }
      .CircleDrawer input[type='range'] { width: 400px; }
      .CircleDrawer .popup-view-container { width: 640px; height: 585px; }
    */},
    function toHTML() {/*
      <div id="%%id" class="CircleDrawer">
        <center class="buttonRow">$$back{label: 'Undo'} $$forth{label: 'Redo'}</center>
        %%canvas
      </div>
    */}
  ]
});
