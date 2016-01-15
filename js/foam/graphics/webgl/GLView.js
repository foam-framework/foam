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
  package: 'foam.graphics.webgl',
  name: 'GLView',
  traits: [ 'foam.patterns.ChildTreeTrait' ],

  requires: [
    'foam.graphics.webgl.GLViewView',
    'foam.graphics.webgl.matrix.Matrix4',
  ],

  properties: [
    {
      name:  'view',
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
      name:  'canvas',
      getter: function() { return this.view && this.view.canvas; },
      transient: true,
      hidden: true,
      documentation: function() {/* Safe getter for the canvas view this scene draws into */ }
    },
    {
      name:  '$',
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
      type: 'Boolean',
      defaultValue: false,
      documentation: function() {/*
          Suspend painting. While this property is true, this
          $$DOC{ref:'foam.graphics.CView'} will not paint itself or its
          children.
        */},
    },
    {
      name:  'gl',
      getter: function() {
        var glc = this.view && this.view.gl;
        if ( glc && ! this.instance_.gl ) {
          // trigger setter to propagate change
          this.gl = glc;
        }
        return glc;
      },
      transient: true,
      hidden: true,
      documentation: function() {/* Safe getter for the webGL view this scene draws into */ }
    },
    {
      type: 'Float',
      name: 'x',
      defaultValue: 0,
      documentation: function() {/*
          The X offset of this view relative to its parent. */}
    },
    {
      type: 'Float',
      name: 'y',
      defaultValue: 0,
      documentation: function() {/*
          The Y offset of this view relative to its parent. */}
    },
    {
      type: 'Float',
      name: 'z',
      defaultValue: 0,
      documentation: function() {/*
          The Z offset of this view relative to its parent. */}
    },
    {
      type: 'Int',
      name:  'width',
      defaultValue: 10,
      documentation: function() {/*
          The width of this view. Painting is not automatically clipped, so a view
          may render outside of its apparent rectangle. */}
    },
    {
      type: 'Int',
      name:  'height',
      defaultValue: 10,
      documentation: function() {/*
          The height of this view. Painting is not automatically clipped, so a view
          may render outside of its apparent rectangle. */}
    },
    {
      name: 'positionMatrix',
      getter: function() {
        if ( this.instance_.positionMatrix ) return this.instance_.positionMatrix;
        if (this.parent && this.parent.positionMatrix ) {
          return this.parent.positionMatrix;
        }
        return this.Matrix4.create();
      }
    },
  ],

  methods: {
    toView_: function() { /* Internal. Creates a CViewView wrapper. */
      if ( ! this.view ) {
        var params = { cview: this };
        if ( this.className )   params.className   = this.className;
        if ( this.tooltip )     params.tooltip     = this.tooltip;
        if ( this.speechLabel ) params.speechLabel = this.speechLabel;
        if ( this.tabIndex )    params.tabIndex    = this.tabIndex;
        if ( this.role )        params.role        = this.role;
        if ( this.data$ )       params.data$       = this.data$;

        this.view = this.GLViewView.create(params);
      }
      return this.view;
    },

    erase: function() { return; },

    paintChildren: function(translucent) { /* Paints each child. */
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var child = this.children[i];
        child.paint(translucent);
      }
    },

    paint: function(translucent) { /* Draws this object. If translucent is false,
      this is the first pass for opaque objects. If true, this is the second
      pass for translucent or transparent objects. */
      if ( ! this.$ ) return; // no canvas element, so do nothing
      if ( ! this.width || ! this.height ) return;
      if ( this.state === 'initial' ) {
        this.state = 'active';
      }
      if ( this.suspended ) return; // we allowed initialization, but if suspended don't paint

      this.paintSelf(translucent);
      this.paintChildren(translucent);
    },

    transform: function() {
      return;
    },

    mapToCanvas: function(point) { /* Maps a coordinate from this to the canvas.
                    Useful for sharing a point between sibling or cousin items. */
      // TODO: reverse the matrix xform
    },

    addChild: function(child) { /* Adds a child $$DOC{ref:'foam.graphics.CView'} to the scene
                                   under this. */
      /* provide automatic wrapping a CView to CViewGLView */
      var c = child.toGLView_ ? child.toGLView_() : child;

      this.SUPER(c);

      if ( this.view ) {
        c.view = this.view;
        c.addListener(this.view.paint);
      }
      return this;
    },

    removeChild: function(child) { /* Removes a child from the scene. */
      this.SUPER(child);
      child.view = undefined;
      child.removeListener(this.view.paint);
      return this;
    },

  }

});
