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
  extends: 'foam.browser.ui.StackView',

  requires: [
    'foam.apps.builder.controller.Overlay',
    'foam.apps.builder.controller.Panel',
    'foam.apps.builder.controller.Transition',
  ],

  properties: [
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

        var slideFromRight = this.Transition.create({
          onPush: function(view, hints) {
            debugger;
            if ( ! sanityCheck(view, hints, ['index', 'containerWidth']) ) return;
            var style = view.$.style;
            style.zIndex = hints.index;
            style.width = '0px';
            style.left = hints.containerWidth + 'px';
            style.transition = 'left 300ms ease';
          },
          onPop: function(view, hints) {
            if ( ! sanityCheck(view, hints, ['containerWidth']) ) return;
            view.$.style.left = hints.containerWidth;
          },
          onResize: function(view, hints) {
            debugger;
            if ( ! sanityCheck(view, hints, ['left', 'width']) ) return;
            var style = view.$.style;
            style.left = hints.left + 'px';
            style.width = hints.width + 'px';
            style.top = '0px';
          },
        });
        return {
          slide: slideFromRight,
          slideFromRight: slideFromRight,
          slideFromLeft: this.Transition.create({
            onPush: function(view, hints) {
              if ( ! sanityCheck(view, hints, ['index', 'containerWidth']) ) return;
              var style = view.$.style;
              style.zIndex = hints.index;
              style.width = '0px';
              style.left = '-' + hints.containerWidth + 'px';
              style.transition = 'left 300ms ease';
            },
            onPop: function(view, hints) {
              if ( ! sanityCheck(view, hints, ['containerWidth']) ) return;
              view.$.style.left = '-' + hints.containerWidth + 'px';
            },
            onResize: function(view, hints) {
              if ( ! sanityCheck(view, hints, ['left', 'width']) ) return;
              var style = view.$.style;
              style.left = hints.left + 'px';
              style.width = hints.width + 'px';
              style.top = '0px';
            },
          }),
          overlayFromLeft: this.Transition.create({
            onPush: function(view, hints) {
              if ( ! sanityCheck(view, hints, ['index', 'containerWidth']) ) return;
              var style = view.$.style;
              style.zIndex = hints.index;
              style.width = '0px';
              style.left = '-' + hints.containerWidth + 'px';
              style.transition = 'left 300ms ease';
            },
            onPop: function(view, hints) {
              if ( ! sanityCheck(view, hints, ['containerWidth']) ) return;
              view.$.style.left = '-' + hints.containerWidth + 'px';
            },
            onResize: function(view, hints) {
              if ( ! sanityCheck(view, hints, ['left', 'width']) ) return;
              var style = view.$.style;
              style.left = hints.left + 'px';
              style.width = hints.width + 'px';
              style.top = '0px';
            },
          }),
          fade: this.Transition.create({
            onPush: function(view, hints) {
              if ( ! sanityCheck(view, hints, ['index']) ) return;
              var style = view.$.style;
              style.zIndex = hints.index;
              style.opacity = 0;
              style.transition = 'opacity 300ms ease';
              this.X.setTimeout(function() { style.opacity = 1; }, 50);
            },
            onPop: function(view, hints) {
              if ( ! sanityCheck(view) ) return;
              view.$.style.opacity = 0;
            },
            onResize: function(view, hints) {
              if ( ! sanityCheck(view, hints, ['left', 'width']) ) return;
              var style = view.$.style;
              style.left = hints.left + 'px';
              style.width = hints.width + 'px';
              style.top = '0px';
            },
          }),
        };
      },
    },
  ],

  methods: [
    function createInternalView_(view, opt_hints) {
      var childView = this.Panel.create({ view: view });

      // Attach hinted transition to panel.
      if ( opt_hints && opt_hints.transition &&
          this.transitions[opt_hints.transition] )
        this.transitions[opt_hints.transition].attach(childView, this, view.id);
      else
        this.transitions.slide.attach(childView, this, view.id);

      // Wrap panel in overlay; attach appropriate transition to overlay.
      if ( opt_hints && opt_hints.overlay ) {
        childView = this.Overlay.create({ view: childView });
        this.transitions.fade.attach(childView, this, view.id);
      }

      return {
        // Used in foam.ui.StackView to destroy child views.
        id: childView.id,
        // Construct StackView controller children views using "childView".
        childView: childView,
        // Layout views in terms of "view" preferences.
        view: view,
        overlay: opt_hints ? opt_hints.overlay : false,
      };
    },
    function distributeSlack_(sizes, slack) { return sizes; },
    function elementAnimationAdd_(style, index, opt_hints) {
      var internalView = this.views_[index];
      this.publish([ 'push', internalView.view.id,
                     { index: index, containerWidth: this.$.offsetWidth } ]);
    },
    function elementAnimationRemove_(style, index, opt_hints) {
      var internalView = this.views_[index];
      this.publish([ 'pop', internalView.view.id,
                     { containerWidth: this.$.offsetWidth } ]);
    },
    function childHTML(index, view) {
      return this.views_[index].childView.toHTML();
    },
    function resize() {
      if ( ! this.$ ) return;
      this.setLayoutVisibleBoundaries_();
      if (this.visibleStart_ < 0) return;
      var sizes = this.getLayoutSizes_();

      var pos = 0;
      for ( var i = 0; i <= this.visibleEnd_; ++i ) {
        var size = sizes[i] || 0; // size zero for buried items to the left.
        this.publish([ 'resize', this.views_[i].view.id,
                       { left: pos, width: size } ]);
        pos += size;
      }
    },
  ],
});
