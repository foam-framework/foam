/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.apps.builder.controller',
  name: 'StackView',
  extends: 'foam.ui.SimpleView',

  documentation: function() {/* A stack view that pushes view factories, pops
    views, and understands several layout and transition strategies. Strategies
    are selected using <i>External Hints</i> passed to interface methods.
    Transition-related information required to execute strategies is passed to
    custom
    $$DOC{ref:'foam.apps.builder.controller.Transition',usePlural:true} via
    <i>Internal Hints</i>.

    <h4>External Hints</h4>

      <ul>
        <li><i>overlay</i>: Set to truthy value to render view in an overlay.
            Set to "left" or "right" to get an overlay that slides in on the
            respective edge. Default truthy behaviour renders a horizontally
            centered panel.</li>
        <li><i>alwaysShow</i>: Set to truthy value to require that view be laid
            out, even when not at/near the top of the stack. In practice,
            <i>alwaysShow</i> views are laid out first bottom-to-top-of-stack
            (while there's still room), then other non-<i>overlay</i> views are
            laid out top-to-bottom-of-stack (while there's still room).</li>
        <li><i></i>: </li>
      </ul>

    <h4>Internal Hints</h4>

      <ul>
        <li><i>index</i>:
            $$DOC{ref:'foam.apps.builder.controller.StackView'} signal to
            $$DOC{ref:'foam.apps.builder.controller.Transition',usePlural:true}
            indicating index in the stack of the view being controlled.</li>
        <li><i>left</i>:
            $$DOC{ref:'foam.apps.builder.controller.StackView'} signal to
            $$DOC{ref:'foam.apps.builder.controller.Transition',usePlural:true}
            indicating left edge coordinate in the stack of the view being
            controlled.</li>
        <li><i>width</i>:
            $$DOC{ref:'foam.apps.builder.controller.StackView'} signal to
            $$DOC{ref:'foam.apps.builder.controller.Transition',usePlural:true}
            indicating width of the view being controlled.</li>
            indicating the full width of the clipping container.</li>
        <li><i>containerWidth</i>:
            $$DOC{'foam.apps.builder.controller.StackView'} signal to
            $$DOC{'foam.apps.builder.controller.Transition',usePlural:true}
            indicating the full width of the clipping container.</li>
      </ul>

    <h4>Transition Strategies</h4>

      These are stored in the $$DOC{ref:'.transitions'} map.

      <ul>
        <li><i>slideFromRight</i>: Slide view into layout position from outside
            the clipping container, right-to-left.</li>
        <li><i>slideFromLeft</i>: Slide view into layout position from outside
            the clipping container, left-to-right.</li>
        <li><i>slide</i>: Alias for <i>slideFromRight</i>.</li>
        <li><i>fade</i>: Fade-in view in its laid out position.</li>
        <li><i>fadeOverlay</i>: Fade-in view ignoring layout hints (used for
            overlays).</li>
      </ul>

    <h4>Layout Strategies</h4>

      Layout varies according to the three categories of views described below.
      <ul>
        <li><i>Pinned views</i> (default): Lay out views from bottom-of-stack to
            top-of-stack.</li>
        <li><i>Stacked views</i> (default): Lay out views from top-of-stack to
            bottom-of-stack.</li>
        <li><i>Overlay views</i>: Ignore horizontal layout of other views;
            overlay views on top of other layouts.</li>
      </ul>

      <i>Pinned views</i> are laid out first, then <i>stacked views</i>; both
      in the order they appear on the stack (bottom-to-top = left-to-right).
      Then <i>overlay views</i> are rendered on top (as overlays). Details about
      what to do when we run out of space and what to do with slack space in the
      pinned/stacked case can be found in $$DOC{ref:'.getLayout_'} and
      $$DOC{ref:'.distributeSlack_'}, respectively.
  */},

  requires: [
    'foam.apps.builder.controller.Overlay',
    'foam.apps.builder.controller.Panel',
    'foam.apps.builder.controller.Transition',
  ],
  imports: [
    'document',
    'setTimeout',
    'window',
  ],

  models: [
    {
      name: 'ChildView',

      properties: [
        {
          name: 'id',
          documentation: function() {/* ID used to identify this particular.
            stack item.
          */},
        },
        {
          name: 'viewFactory',
          documentation: function() {/* View factory passed to
            $$DOC{ref:'foam.apps.builder.controller.StackView.pushView'} or
            similar. Actual view constructed may be wrapped in one or more
            decorators for layout panels, overlays, etc. */},
        },
        {
          name: 'view',
          documentation: function() {/* Undecorated view produced by
            $$DOC{ref:'.viewFactory'}. */},
        },
        {
          name: 'decoratedView',
          documentation: function() {/* Decorated view to be added as a child
            of a $$DOC{ref:'foam.apps.builder.controller.StackView'}. */},
        },
        {
          name: 'hints',
          defaultValue: null,
          documentation: 'Layout hints passed at creation time.',
        },
      ],
    },
  ],

  properties: [
    {
      type: 'Array',
      subType: 'ChildView',
      name: 'views_',
      documentation: 'Internal array of view data.',
      factory: function() { return []; },
    },
    {
      name: 'transitions',
      lazyFactory: function() {
        // TODO(markdittmer): Can probably drop this once
        // controller <--> transition interface is more stable.
        var sanityCheck = function(view, hints, requiredHints) {
          var ok = true;
          if ( ! view.$ ) {
            console.warn('StackView transition: Missing view element');
            ok = false;
          }

          if ( ! requiredHints ) return ok;

          if ( requiredHints.length && ! hints ) {
            console.warn('StackView transition: Missing hints');
            ok = false;
          } else if ( requiredHints.length ) {
            for ( var i = 0; i < requiredHints.length; ++i ) {
              if ( typeof hints[requiredHints[i]] === 'undefined' ) {
                console.warn('StackView transition: Missing hint: "' +
                    requiredHints[i] + '"');
                ok = false;
              }
            }
          }
          return ok;
        };

        var notifyCompleted = function(ret, e, propName) {
          var listener = function(evt) {
            if ( evt.propertyName === propName ) {
              ret();
              e.removeEventListener('transitionend', listener);
            }
          };
          e.addEventListener('transitionend', listener);
          return listener;
        };

        var onResize = function(transitionLeft, ret, view, hints) {
          if ( ! sanityCheck(view, hints, ['left', 'width']) ) return;
          var style = view.$.style;
          style.width = hints.width + 'px';
          if ( transitionLeft && view.$.style.left !== hints.left + 'px' ) {
            style.left = hints.left + 'px';
            notifyCompleted(ret, view.$, 'left');
          } else { ret(); }
        };

        var slideFromRight = this.Transition.create({
          onAdd: function(ret, view, hints) {
            if ( ! sanityCheck(view, hints, ['index', 'containerWidth']) ) return;
            var style = view.$.style;
            style.zIndex = hints.index + 1;
            style.width = '0px';
            style.left = hints.containerWidth + 'px';
            ret();
            style.transition = 'left 300ms ease';
          },
          onRemove: function(ret, view, hints) {
            if ( ! sanityCheck(view, hints, ['containerWidth']) ) return;
            view.$.style.left = hints.containerWidth;
            notifyCompleted(ret, view.$, 'left');
          },
          onResize: onResize.bind(this, true),
        });
        return {
          slide: slideFromRight,
          slideFromRight: slideFromRight,
          slideFromLeft: this.Transition.create({
            onAdd: function(ret, view, hints) {
              if ( ! sanityCheck(view, hints, ['index', 'containerWidth']) ) return;
              var style = view.$.style;
              style.zIndex = hints.index + 1;
              style.width = '0px';
              style.left = '-' + hints.containerWidth + 'px';
              ret();
              style.transition = 'left 300ms ease';
            },
            onRemove: function(ret, view, hints) {
              if ( ! sanityCheck(view, hints, ['containerWidth']) ) return;
              view.$.style.left = '-' + hints.containerWidth + 'px';
              notifyCompleted(ret, view.$, 'left');
            },
            onResize: onResize.bind(this, true),
          }),
          fade: this.Transition.create({
            onAdd: function(ret, view, hints) {
              if ( ! sanityCheck(view, hints, ['index']) ) return;
              var style = view.$.style;
              style.zIndex = hints.index + 1;
              style.opacity = 0;
              style.transition = 'opacity 300ms ease';
              view.$.offsetLeft = view.$.offsetLeft;
              style.opacity = 1;
              notifyCompleted(ret, view.$, 'opacity');
            },
            onRemove: function(ret, view, hints) {
              if ( ! sanityCheck(view) ) return;
              view.$.style.opacity = 0;
              notifyCompleted(ret, view.$, 'opacity');
            },
            onResize: onResize.bind(this, false),
          }),
          fadeOverlay: this.Transition.create({
            onAdd: function(ret, view, hints) {
              if ( ! sanityCheck(view, hints, ['index']) ) return;
              var style = view.$.style;
              style.zIndex = hints.index + 1;
              style.opacity = 0;
              style.transition = 'opacity 300ms ease';
              view.$.offsetLeft = view.$.offsetLeft;
              style.opacity = 1;
              notifyCompleted(ret, view.$, 'opacity');
            },
            onRemove: function(ret, view, hints) {
              if ( ! sanityCheck(view) ) return;
              view.$.style.opacity = 0;
              notifyCompleted(ret, view.$, 'opacity');
            },
          }),
        };
      },
    },
  ],

  methods: [
    function init(args) {
      this.SUPER(args);
      this.window.addEventListener('resize', this.onResize);
    },
    {
      name: 'pushView',
      documentation: function () {/* Default pushView that works on the top
        level. See $$DOC{ref:'.pushView_'} for details. */},
      code: function(viewFactory, opt_hints) {
        return this.pushView_(-1, viewFactory, opt_hints);
      },
    },
    {
      name: 'popView',
      documentation: function() {/* Default popView that works on the top
        level. See $$DOC({ref:'.popView_' for details. */},
      code: function() { return this.popView_(0); },
    },
    {
      name: 'popChildViews',
      documentation: function() {/* Default popChildViews that works on the top
        level. See $$DOC{ref:'.popView_'} for details. */},
      code: function() { return this.popView_(1); },
    },
    {
      name: 'pushView_',
      documentation: function() {/* Construct and decorate a view from
        $$DOC{ref:'viewFactory'}, push it onto the stack at <i>stack index</i>
        = $$DOC{ref:'index'}, then execute its "add" transition. */},
      code: function(index, viewFactory, opt_hints) {
        if ( ! viewFactory ) return this;
        var X = this.createSubstackCtx_();
        this.onPushView(index, viewFactory, X, opt_hints);
        return X.stack;
      },
    },
    {
      name: 'popView_',
      documentation: function() {/* Execute "remove" transition, then destroy
        and evict from DOM views where <i>stack index</i> &gt;= $$DOC{ref:'index'}.
      */},
      code: function(index) { this.onPopView(index); },
    },
    {
      name: 'replaceView_',
      documentation: function() {/* Replace view at <i>stack index</i> =
        $$DOC{ref:'index'} with view generated from $$DOC{ref:'viewFactory'}.
        This entails first popping views with <i>stack index</i> &gt;=
        $$DOC{ref:'index'} off the stack, then pushing a new view. */},
      code: function(index, viewFactory, opt_hints) {
        if ( ! viewFactory ) return this;
        this.popView_(index);
        return this.pushView_(index - 1, viewFactory, opt_hints);
      },
    },
    {
      name: 'createSubstackCtx_',
      documentation: function() {/* Construct a context where <i>stack</i> is
        an interface pre-bound to the appropriate internal push/pop/replace for
        the current top-of-stack location, $$DOC{ref:'.views_.length'}. */},
      code: function() {
        return this.Y.sub({
          stack: {
            __proto__: this,
            pushView: this.pushView_.bind(this, this.views_.length),
            popView: this.popView_.bind(this, this.views_.length),
            popChildViews: this.popView_.bind(this, this.views_.length + 1),
            replaceView: this.replaceView_.bind(this, this.views_.length)
          },
        });
      },
    },
    function createChildView_(viewFactory, X, opt_hints) {
      var view = viewFactory(null, X);
      var decoratedView = this.Panel.create({ view: view }, X);
      var childViewId = this.nextID();
      var removedFutures = [];

      // Attach hinted transition to panel.
      var panelTransition = (opt_hints && opt_hints.transition &&
          this.transitions[opt_hints.transition]) ?
          this.transitions[opt_hints.transition] :
          this.transitions.slide;
      panelTransition.attach(decoratedView, this, childViewId);
      // Capture transition removed event.
      var pFuture = afuture();
      this.subscribeToTransition_(
          panelTransition, decoratedView, childViewId, pFuture);
      removedFutures.push(pFuture.get);

      // Wrap panel in overlay, attach appropriate transition to overlay.
      if ( opt_hints && opt_hints.overlay ) {
        var overlayTransition = this.transitions.fadeOverlay;
        decoratedView = this.Overlay.create({ view: decoratedView }, X);
        overlayTransition.attach(decoratedView, this, childViewId);
        // Capture transition removed event.
        var oFuture = afuture();
        this.subscribeToTransition_(
            overlayTransition, decoratedView, childViewId, oFuture);
        removedFutures.push(oFuture.get);
      }

      // Trigger child view cleanup when all decorators have finished onRemove
      // animation.
      apar.apply(null, removedFutures)(
          this.cleanupChildView_.bind(this, decoratedView));

      return this.ChildView.create({
        id: childViewId,
        viewFactory: viewFactory,
        view: view,
        decoratedView: decoratedView,
        hints: opt_hints,
      }, X);
    },
    function subscribeToTransition_(transition, view, id, future) {
      // When transition completes onRemove animation:
      // - Unsubscribe from transition events,
      // - Detach transition from view,
      // - Resolve remove-transition-complete future.
      transition.subscribe(['removed', id], function() {
        transition.unsubscribe(['removed', id]);
        transition.detach(view, this);
        future.set();
      }.bind(this));
    },
    function destroyChildViews_(index, opt_hints) {
      // Initiate view removal animations and remove from views_.
      // Subscription to transition : ['removed', id] manages view cleanup.
      while ( this.views_.length > index ) {
        var viewData = this.views_[this.views_.length - 1];
        this.publish(['remove', viewData.id,
                      { containerWidth: this.$.offsetWidth }]);
        this.views_.pop();
      }
    },
    function cleanupChildView_(decoratedView) {
      // End view lifecycle, remove from DOM.
      decoratedView.destroy();
      var e = this.X.$(decoratedView.id);
      if ( e ) e.outerHTML = '';
    },
    function renderChild(index, opt_hints) {
      var viewData = this.views_[index];
      var parent = (viewData.hints && viewData.hints.overlay) ?
          this.document.body : this.$;
      var decoratedView = viewData.decoratedView;
      parent.insertAdjacentHTML('beforeend', decoratedView.toHTML());
      decoratedView.initHTML();
      this.publish(['add', viewData.id,
                    { index: index, containerWidth: this.$.offsetWidth }]);
    },
    function resize() {
      if ( ! this.$ ) return;
      var layout = this.getLayout_();
      var sizes = layout.sizes, slack = layout.slack;
      var pos = 0;
      var viewData, hints, size;
      for ( var i = 0; i < this.views_.length; ++i ) {
        viewData = this.views_[i];
        hints = viewData.hints;
        size = sizes[i] || 0;
        if ( ! (hints && hints.overlay) ) {
          // Default layout: Fill out stack space left-to-right.
          this.publish(['resize', viewData.id,
                        { left: pos, width: size }]);
          pos += size;
        } else if ( hints.overlay === 'left' ) {
          this.publish(['resize', viewData.id,
                        { left: 0, width: size }]);
        } else if ( hints.overlay === 'right' ) {
          this.publish(['resize', viewData.id,
                        { left: this.$.offsetWidth - size, width: size }]);
        } else {
          // Default overlay: horizontally centered.
          this.publish([ 'resize', viewData.id,
                         { left: (this.$.offsetWidth - size) / 2, width: size } ]);
        }
      }
    },
    function getLayout_() {
      var width = this.$.offsetWidth;
      var sizes = [];
      var viewData, hints, size;

      // First pass: Allocate space for overlay and alwaysShow views according
      // to minWidth.
      for ( var i = 0; i < this.views_.length; ++i ) {
        viewData = this.views_[i];
        hints = viewData.hints;
        size = hints && (hints.overlay || hints.alwaysShow) ?
            (viewData.view.minWidth || 0) : 0;
        sizes[i] = size;
        // Overlay views do not occupy stack space.
        if ( (!viewData.hints) || (!viewData.hints.overlay) ) width -= size;
      }

      // Second pass: Allocate minimum space to remaining views.
      for ( i = this.views_.length - 1; i >= 0; --i ) {
        // Skip already laid out viwes.
        if ( sizes[i] > 0 ) continue;
        size = this.views_[i].view.minWidth;
        // Stop when there isn't enough room for the next view.
        if ( width < size ) break;
        sizes[i] = size;
        width -= size;
      }

      // Manipulates sizes in place and returns remaining slack.
      width = this.distributeSlack_(sizes, width);

      return { sizes: sizes, slack: width };
    },
    function distributeSlack_(sizes, slack) {
      // Manipulate sizes in place and return remaining slack.

      // First pass: Expand to preferredWidth.
      slack = this.distributeSlack__(sizes, slack, 'preferredWidth');
      if ( slack === 0 ) return slack;

      // Second pass: Expand to maxWidth.
      slack = this.distributeSlack__(sizes, slack, 'maxWidth');
      return slack;
    },
    function distributeSlack__(sizes, slack, widthPropName) {
      // Manipulate sizes in place and return remaining slack.
      for ( var i = this.views_.length - 1; i >= 0; --i ) {
        var viewData = this.views_[i];
        var hints = viewData.hints;
             // Treat overlay and always show views as fixed width.
        if ( (hints && (hints.overlay || hints.alwaysShow)) ||
             // Do not increase slack.
             (viewData.view[widthPropName] < sizes[i]) ) continue;
        var shift = Math.min(viewData.view[widthPropName] - sizes[i], slack);
        sizes[i] += shift;
        slack -= shift;
        if ( slack === 0 ) return slack;
      }
      return slack;
    },
  ],

  listeners: [
    {
      name: 'onLoad',
      code: function() {
        // Render and configure each child view that has already been loaded.
        for (var i = 0; i < this.views_.length; i++) {
          this.renderChild(i);
        }
        this.resize();
      },
    },
    {
      name: 'onResize',
      isFramed: true,
      code: function() { this.resize(); },
    },
    {
      name: 'onPushView',
      isFramed: true,
      code: function(index, viewFactory, X, opt_hints) {
        // Push(i) ==> Pop(j) for all j > i.
        this.destroyChildViews_(index + 1, opt_hints);

        this.views_.push(this.createChildView_(viewFactory, X, opt_hints));
        if ( this.$ ) this.renderChild(index + 1, opt_hints);
        this.onResize();
      },
    },
    {
      name: 'onPopView',
      isFramed: true,
      code: function (index) {
        this.destroyChildViews_(index);
        this.onResize();
      },
    },
  ],

  templates: [
    function CSS() {/*
      stackview-container {
        display: block;
        height: 100%;
        width: 100%;
        overflow-x: hidden;
        position: relative;
      }
    */},
    function toHTML() {/*
      <stackview-container id="%%id" %%cssClassAttr()></stackview-container>
      <% this.addInitializer(this.onLoad); %>
    */},
  ],
});
