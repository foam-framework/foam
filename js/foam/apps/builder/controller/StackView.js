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

  models: [
    {
      name: 'Transition',

      properties: [
        {
          model_: 'FunctionProperty',
          name: 'onAdd',
          args: [
            { name: 'style', documentation: 'DOMElement.style to be manipualted' },
            { name: 'container', documentation: 'The stack view container DOMElement' },
            { name: 'opt_hints', documentation: 'Optional hints for configuring animation' },
          ],
        },
        {
          model_: 'FunctionProperty',
          name: 'onRemove',
          args: [
            { name: 'style', documentation: 'DOMElement.style to be manipualted' },
            { name: 'container', documentation: 'The stack view container DOMElement' },
            { name: 'opt_hints', documentation: 'Optional hints for configuring animation' },
          ],
        },
        {
          model_: 'FunctionProperty',
          name: 'onResize',
          args: [
            { name: 'style', documentation: 'DOMElement.style to be manipualted' },
            { name: 'index', documentation: 'View index on stack' },
            { name: 'left', documentation: 'Layout location for eft edge of view' },
            { name: 'width', documentation: 'Layout width of view' },
          ],
        },
        {
          model_: 'FunctionProperty',
          name: 'decorateHTML',
          args: [
            { name: 'index', documentation: 'View index on stack' },
            { name: 'delegateToHTML', documentation: 'Default toHTML for view' },
          ],
          defaultValue: function(index, delegateToHTML) { return delegateToHTML(); },
        },
      ],
    },
  ],

  properties: [
    {
      name: 'transitions',
      lazyFactory: function() {
        var slideFromRight = this.Transition.create({
          onAdd: function(index, view, container, opt_hints) {
            var style = view.view.style;
            style.zIndex = index;
            style.width = '0px';
            style.left = container.offsetWidth + 'px';
            style.transition = 'left 300ms ease';
          },
          onRemove: function(index, view, container, opt_hints) {
            view.view.style.left = container.offsetWidth;
          },
          onResize: function(index, view, left, width) {
            var style = view.view.style;
            style.left = left + 'px';
            style.width = width + 'px';
            style.top = '0px';
          },
        });
        return {
          slide: slideFromRight,
          slideFromRight: slideFromRight,
          slideFromLeft: this.Transition.create({
            onAdd: function(index, view, container, opt_hints) {
              var style = view.view.style;
              style.zIndex = index;
              style.width = '0px';
              style.left = '-' + container.offsetWidth + 'px';
              style.transition = 'left 300ms ease';
            },
            onRemove: function(index, view, container, opt_hints) {
              view.view.style.left = '-' + container.offsetWidth + 'px';
            },
            onResize: function(index, view, left, width) {
              var style = view.view.style;
              style.left = left + 'px';
              style.width = width + 'px';
              style.top = '0px';
            },
          }),
          overlayFromLeft: this.Transition.create({
            onAdd: function(index, view, container, opt_hints) {
              var style = view.view.style;
              style.zIndex = index;
              style.width = '0px';
              style.left = '-' + container.offsetWidth + 'px';
              style.transition = 'left 300ms ease';
            },
            onRemove: function(index, view, container, opt_hints) {
              view.view.style.left = '-' + container.offsetWidth + 'px';
            },
            onResize: function(index, view, left, width) {
              var style = view.view.style;
              style.left = left + 'px';
              style.width = width + 'px';
              style.top = '0px';
            },
          }),
          fade: this.Transition.create({
            onAdd: function(index, view, container, opt_hints) {
              var style = view.view.style;
              style.zIndex = index;
              style.opacity = 0;
              style.transition = 'opacity 300ms ease';
              this.X.setTimeout(function() { style.opacity = 1; }, 50);
            },
            onRemove: function(index, view, container, opt_hints) {
              view.view.style.opacity = 0;
            },
            onResize: function(index, view, left, width) {
              var style = view.view.style;
              style.left = left + 'px';
              style.width = width + 'px';
              style.top = '0px';
            },
          }),
        };
      },
    },
    {
      name: 'transition_',
      getter: function() {
        return this.transitions[this.transition] ||
            this.transitions.slide;
      },
    },
  ],

  methods: [
    function createInternalView_(view, opt_hints) {
      return {
        id: this.nextID(),
        view: view,
        transition: opt_hints && opt_hints.transition &&
            this.transitions[opt_hints.transition] ?
            this.transitions[opt_hints.transition] :
            this.transition_,
      };
    },
    function elementAnimationAdd_(style, index, opt_hints) {
      this.views_[index].transition.onAdd(index, this.views_[index], this.$, opt_hints);
    },
    function elementAnimationRemove_(style, index, opt_hints) {
      this.views_[index].transition.onRemove(index, this.views_[index], this.$, opt_hints);
    },
    function childHTML(index, view) {
      return view.decorateHTML(index, this.childHTML_.bind(this, index));
    },
    function resize() {
      if ( ! this.$ ) return;
      this.setLayoutVisibleBoundaries_();
      if (this.visibleStart_ < 0) return;
      var sizes = this.getLayoutSizes_();

      var pos = this.$.offsetWidth;
      for (var i = this.visibleEnd_; i >= 0; i--) {
        var size = sizes[i] || 0; // size zero for buried items to the left
        pos -= size; // left edge
        var s = this.X.$(this.views_[i].id).style;
        this.views_[i].transition.onResize(i, this.views_[i], pos, size);
      }
    },
  ],
});
