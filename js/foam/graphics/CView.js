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
  name:  'CView',
  label: 'CView',

  requires: [
    'foam.graphics.PositionedCViewView',
    'foam.graphics.CViewView'
  ],

  traits: [ 'foam.patterns.ChildTreeTrait' ],

  documentation: function() {/*
      The base class for a canvas item. A $$DOC{ref:'.'} can be directly inserted
      into the DOM with $$DOC{ref:'.write'}, and will generate a $$DOC{ref:'CViewView'}
      wrapper.</p>
      <p>$$DOC{ref:'.'} submodels directly nest inside each other, with a single
      root $$DOC{ref:'.'} attached to the canvas. Use $$DOC{ref:'.addChild'} to attach a new
      $$DOC{ref:'.'} to the scene graph:</p>
      <p><code>
            var rootNode = this.X.CView.create({width:300, height:200});<br/>
            <br/>
            rootNode.write(this.X); // a CViewView wrapper is created for us<br/>
            <br/>
            rootNode.addChild(this.X.Circle.create({x:30, y:50, radius: 30, color: 'blue'});<br/>
            rootNode.addChild(this.X.Label.create({x: 50, y: 30, text: "Hello", color: 'black'});<br/>
      </code></p>
      <p>When modeling your own $$DOC{ref:'foam.graphics.CView'} submodel, override $$DOC{ref:'.paintSelf'}
      to render your content. Children will automatically be painted for you. For more direct
      control over child rendering, override $$DOC{ref:'.paint'}.
    */},

  properties: [
    {
      name:  'view',
      type:  'Canvas2',
      postSet: function(_, view) {
        for ( var key in this.children ) {
          var child = this.children[key];
          child.view = view;
          if ( view ) child.addListener(view.paint);
        }
      },
      transient: true,
      hidden: true,
      documentation: function() {/* The canvas view this scene draws into */ }
    },
    {
      name: 'children',
      hidden: true
    },
    {
      name: 'canvas',
      getter: function() { return this.view && this.view.canvas; },
      transient: true,
      hidden: true,
      documentation: function() {/* Safe getter for the canvas view this scene draws into */ }
    },
    {
      name: '$',
      getter: function() { return this.view && this.view.$; },
      transient: true,
      hidden: true,
      documentation: function() {/* Safe getter for the canvas DOM element this scene draws into */ }
    },
    {
      name: 'state',
      defaultValue: 'initial',
      documentation: function() {/* Indicates if canvas setup is in progress ('initial'),
                                  or ready to paint ('active'). */}
    },
    {
      name: 'suspended',
      model_: 'BooleanProperty',
      defaultValue: false,
      documentation: function() {/*
          Suspend painting. While this property is true, this
          $$DOC{ref:'foam.graphics.CView'} will not paint itself or its
          children.
        */},
    },
    {
      name: 'className',
      help: 'CSS class name(s), space separated. Used if adapted with a CViewView.',
      defaultValue: '',
      documentation: function() {/* CSS class name(s), space separated.
          Only used if this is the root node adapted with a $$DOC{ref:'CViewView'}. */},
      postSet: function() {
        if ( ! this.$ ) return;
        this.$.className = this.className;
      }
    },
    {
      model_: 'FloatProperty',
      name: 'x',
      defaultValue: 0,
      documentation: function() {/*
          The X offset of this view relative to its parent. */}
    },
    {
      model_: 'FloatProperty',
      name: 'y',
      defaultValue: 0,
      documentation: function() {/*
          The Y offset of this view relative to its parent. */}
    },
    {
      model_: 'FloatProperty',
      name: 'a',
      label: 'Rotation',
      defaultValue: 0
    },
    {
      model_: 'FloatProperty',
      name: 'scaleX',
      defaultValue: 1
    },
    {
      model_: 'FloatProperty',
      name: 'scaleY',
      defaultValue: 1
    },
    {
      name: 'canvasX',
      hidden: true,
      getter: function() { return this.x + ( this.parent ? this.parent.canvasX : 0 ); }
    },
    {
      name: 'canvasY',
      hidden: true,
      getter: function() { return this.y + ( this.parent ? this.parent.canvasY : 0 ); }
    },
    {
      model_: 'IntProperty',
      name:  'width',
      defaultValue: 10,
      documentation: function() {/*
          The width of this view. Painting is not automatically clipped, so a view
          may render outside of its apparent rectangle. */}
    },
    {
      model_: 'IntProperty',
      name:  'height',
      defaultValue: 10,
      documentation: function() {/*
          The height of this view. Painting is not automatically clipped, so a view
          may render outside of its apparent rectangle. */}
    },
    {
      model_: 'FloatProperty',
      name:  'alpha',
      defaultValue: 1,
      documentation: function() {/*
          The desired opacity of the content, from 0:transparent to 1:opaque.
          Child views do not inherit and are not limited by this value. */}
    },
    {
      name:  'color',
      label: 'Foreground Color',
      type:  'String',
      defaultValue: 'black',
      documentation: function() {/*
          The foreground color for rendering primary content. */}
    },
    {
      name:  'background',
      label: 'Background Color',
      type:  'String',
      defaultValue: 'white',
      documentation: function() {/*
          The optional background color for opaque items that $$DOC{ref:'.erase'}
          their background. */}
    },
    {
      name: 'font',
      documentation: function() {/*
          The font to use for rendering text, in CSS string format: <code>'24px Roboto'</code>. */}
    },
    {
      name: 'clipped',
      model_: 'BooleanProperty',
      defaultValue: false
    }
  ],

  methods: {
    toView_: function() { /* Internal. Creates a CViewView wrapper. */
      if ( ! this.view ) {
        var params = {cview: this};
        if ( this.className )   params.className   = this.className;
        if ( this.tooltip )     params.tooltip     = this.tooltip;
        if ( this.speechLabel ) params.speechLabel = this.speechLabel;
        if ( this.tabIndex )    params.tabIndex    = this.tabIndex;
        if ( this.role )        params.role        = this.role;
        if ( this.data$ )       params.data$       = this.data$;
        this.view = this.CViewView.create(params);
      }
      return this.view;
    },
    toGLView_: function() { /* internal, creates a CViewGLView wrapper for 3d canvases */
      var model = this.X.lookup('foam.graphics.webgl.CViewGLView')
      if ( model ) return model.create({ sourceView: this });
      return '';
    },
    toPositionedView_: function() { /* Internal. Creates a PositionedCViewView wrapper. */
      if ( ! this.view ) {
        var params = {cview: this};
        if ( this.className ) params.className = this.className;
        this.view = this.PositionedCViewView.create(params);
      }
      return this.view;
    },
    initCView: function() { /* Override in submodels for initialization. Callled
          once on first $$DOC{ref:'.paint'} when transitioning from 'initial'
          to 'active' '$$DOC{ref:'.state'}. */ },

    write: function(opt_X) { /* Inserts this $$DOC{ref:'foam.graphics.CView'} into the DOM
                                   with an $$DOC{ref:'foam.graphics.AbstractCViewView'} wrapper. */
      var X = opt_X || this.X;
      X.writeView(this.toView_(), X);
    },
    addChild: function(child) { /* Adds a child $$DOC{ref:'foam.graphics.CView'} to the scene
                                   under this. */
      this.SUPER(child);

      if ( this.view ) {
        child.view = this.view;
        child.addListener(this.view.paint);
        this.view.paint();
      }
      return this;
    },

    removeChild: function(child) { /* Removes a child from the scene. */
      this.SUPER(child);
      child.view = undefined;
      if ( this.view ) {
        child.removeListener(this.view.paint);
        this.view.paint();
      }
      return this;
    },

    removeAllChildren: function(child) { /* Removes all children from the scene. */
      for ( var i = this.children.length-1 ; i >= 0 ; i-- )
        this.removeChild(this.children[i]);
      return this;
    },

    findChildAt: function(x, y) {
      var c2 = { x: x, y: y, r: 1 };

      var cs = this.children;
      // Start from the end to find the child in the foreground
      for ( var i = cs.length-1 ; i >= 0 ; i-- ) {
        var c1 = cs[i];
        if ( c1.intersects && c1.intersects(c2) ) return c1;
      }
    },

    erase: function() { /* Wipes the canvas area of this $$DOC{ref:'.'}. Primarily used
                          by the root node to clear the entire canvas, but an opaque child
                          may choose to erase its own area, if required. */
// Why do we do a clearRect()?  It causes problems when opacity isn't 1.
//      this.canvas.clearRect(0, 0, this.width, this.height);
      this.canvas.fillStyle = this.background;
      this.canvas.fillRect(0, 0, this.width, this.height);
    },

    paintChildren: function() { /* Paints each child. */
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var child = this.children[i];
        this.canvas.save();
        this.canvas.beginPath(); // reset any existing path (canvas.restore() does not affect path)
        child.paint();
        this.canvas.restore();
      }
    },

    paintSelf: function() { /* Implement this in sub-models to do your painting. */ },

    paint: function() { /* Translates the canvas to our ($$DOC{ref:'.x'}, $$DOC{ref:'.y'}),
                          does a $$DOC{ref:'.paintSelf'} then paints all the children. */
      if ( ! this.$ ) return; // no canvas element, so do nothing
      if ( ! this.width || ! this.height ) return;
      if ( this.state === 'initial' ) {
        this.state = 'active';
        this.initCView();
      }
      if ( this.suspended ) return; // we allowed initialization, but if suspended don't paint

      var c = this.canvas;
      c.save();
      c.globalAlpha *= this.alpha;
      this.transform();
      if ( this.clipped ) {
        c.rect(0,0,this.width,this.height);
        c.clip();
      }
      this.paintSelf();
      this.paintChildren();
      c.restore();
    },

    transform: function() {
      this.canvas.translate(this.x, this.y);
      this.canvas.scale(this.scaleX, this.scaleY);
      if ( this.a ) this.canvas.rotate(this.a);
    },

    scale: function(s) {
      this.scaleX = this.scaleY = s;
    },

    mapToParent: function(point) { /* Maps a coordinate from this to our parents'. */
      point.x += this.x;
      point.y += this.y;
      return point;
    },

    mapToCanvas: function(point) { /* Maps a coordinate from this to the canvas.
                    Useful for sharing a point between sibling or cousin items. */
      this.mapToParent(point);
      if ( this.parent && this.parent.mapToCanvas )
        this.parent.mapToCanvas(point);
      return point;
    },

    destroy: function() {}
  }
});
