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
  package: 'foam.ui',
  name: 'OverlayView',
  extends: 'foam.ui.SimpleView',

  requires: [ 'foam.ui.CSSTransitionSet' ],
  imports: [
    'document',
    'window',
  ],

  properties: [
    {
      type: 'Int',
      name: 'x',
      defaultValue: 0,
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.style.left = nu;
      },
    },
    {
      type: 'Int',
      name: 'y',
      defaultValue: 0,
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.style.top = nu;
      },
    },
    {
      type: 'Int',
      name: 'width',
      defaultValueFn: function() {
        var fullWidth = this.document.documentElement.clientWidth - this.x;
        if ( this.displayMode === 'FIXED' ) return fullWidth;
        var container = this.$container;
        return container ? container.offsetWidth - this.x : fullWidth;
      },
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.style.width = nu;
      },
    },
    {
      type: 'Int',
      name: 'height',
      defaultValueFn: function() {
        var fullHeight = this.document.documentElement.clientHeight - this.y;
        if ( this.displayMode === 'FIXED' ) return fullHeight;
        var container = this.$container;
        return container ? container.offsetHeight - this.y : fullHeight;
      },
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.style.height = nu;
      },
    },
    {
      type: 'Float',
      name: 'alpha',
      defaultValue: null,
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.style.opacity = nu === null ? '' : nu;
      },
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'displayMode',
      defaultValue: 'FIXED',
      choices: [
        ['FIXED', 'Fixed'],
        ['RELATIVE', 'Relative'],
      ],
    },
    {
      type: 'foam.ui.CSSTransitionSet',
      name: 'cssTransitions',
      lazyFactory: function() {
        return this.CSSTransitionSet.create({
          opacity: '0.1s cubic-bezier(0.4, 0.0, 1, 1)',
        });
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) old.unsubscribe(['property'], this.onTransitionChange);
        if ( nu ) nu.subscribe(['property'], this.onTransitionChange);
      },
    },
    {
      name: '$container',
      getter: function() {
        if ( this.displayMode === 'FIXED' ) return this.document.body;
        if (  ! this.$ ) return null;

        var container;
        for ( container = this.$.parentElement;
              container && this.window.getComputedStyle(container).position !== 'relative';
              container = container.parentElement );
        return container;
      },
    },
  ],

  methods: [
    function initHTML() {
      this.SUPER();
      this.onTransitionChange();
      this.onCSSPropertyInit();
    },
    function destroy() {
      return this.SUPER.apply(this, arguments);
    },
  ],

  listeners: [
    {
      name: 'onTransitionChange',
      code: function() {
        if ( ! this.$ ) return;
        this.$.style.transition = this.cssTransitions.toString();
      },
    },
    {
      name: 'onCSSPropertyInit',
      isFramed: true,
      code: function() {
        this.$.style.left = this.x;
        this.$.style.top = this.y;
        this.$.style.width = this.width;
        this.$.style.height = this.height;
        this.$.style.opacity = this.alpha;
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <overlay id="%%id" class="overlay"></overlay>
      <% this.setClass('fixed', function() {
           return this.displayMode === 'FIXED';
         }.bind(this), this.id);
         this.setClass('relative', function() {
           return this.displayMode === 'RELATIVE';
         }.bind(this), this.id); %>
    */},
    function CSS() {/*
      overlay, .overlay {
        display: block;
        top: 0px;
        left: 0px;
        bottom: 0px;
        right: 0px;
        background: black;
        opacity: 0;
        z-index: 100;
      }
      .overlay.fixed {
        position: fixed;
      }
      .overlay.relative {
        position: absolute;
      }
    */}
  ]
});
