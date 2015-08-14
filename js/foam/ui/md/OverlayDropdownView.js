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
  package: 'foam.ui.md',
  name: 'OverlayDropdownView',
  extendsModel: 'foam.ui.SimpleView',

  imports: [
    'document',
    'window',
  ],
  exports: [
    'as popup',
  ],

  properties: [
    'data',
    {
      model_: 'ViewFactoryProperty',
      name: 'delegate',
    },
    {
      name: 'delegateView',
      defaultValue: null,
    },
    {
      model_: 'FloatProperty',
      name: 'height',
      defaultValue: 0,
      postSet: function(old, nu) {
        if ( ! this.$ || old === nu || Number.isNaN(nu) ) return;
        if ( nu < 0 ) this.$.style.height = this.getFullHeight() + 'px';
        else          this.$.style.height = nu + 'px';
      },
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'state',
      defaultValue: 'CLOSED',
      choices: [
        ['CLOSED', 'Closed'],
        ['OPEN', 'open'],
      ],
    },
    {
      model_: 'BooleanProperty',
      name: 'showBorder',
      defaultValue: false,
      postSet: function(old, nu) {
        if ( ! this.$ || old === nu ) return;
        this.$.style.border = nu ? '1px solid #eee' : 'none';
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'coverPage',
      defaultValue: false,
      postSet: function(old, nu) {
        if ( ! this.$ || old === nu ) return;
        var overlay = this.$overlay;
        var style = overlay.style;
        if ( nu ) {
          style.top = style.bottom = style.left = style.right = '0';
        } else {
          style.top = style.bottom = style.left = style.right = 'initial';
        }
      }
    },
    {
      name: '$overlay',
      defaultValueFn: function() {
        return this.document.querySelector('#' + this.id + '-overlay');
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'listeningForCancel_',
      defaultValue: false
    },
  ],

  methods: [
    function open() {
      if ( this.state === 'OPEN' || ! this.$ ) return;
      if ( ! this.delegateView ) {
        this.delegateView = this.delegate({ data$: this.data$ }, this.Y);
        var out = TemplateOutput.create(this);
        this.delegateView.toHTML(out);
        this.$.innerHTML = out.toString();
        this.delegateView.initHTML();
      }

      this.showBorder = true;
      this.height = -1;
      this.coverPage = true;
      this.state = 'OPEN';
      this.listenForCancel();
    },
    function close() {
      if ( this.state === 'CLOSED' || ! this.$ ) return;
      this.height = 0;
      this.coverPage = false;
      this.state = 'CLOSED';
      this.unlistenForCancel();
    },
    function getPositionStyle() {
      return 'height:' +
          (this.height < 0 ? this.getFullHeight() + 'px' : this.height + 'px');
    },
    function getFullHeight() {
      if ( ! this.$ ) return 0;
      console.log('OverlayDropdownView.getFullHeight', this.$);
      var last = this.$.lastElementChild;
      var margin = parseInt(this.window.getComputedStyle(last)['margin-bottom']);
      margin = Number.isNaN(margin) ? 0 : margin;
      return Math.min(last.offsetTop + last.offsetHeight + margin,
          window.document.body.clientHeight - this.$.getBoundingClientRect().top);
    },
    function initHTML() {
      this.SUPER();
      this.$.addEventListener('transitionend', this.onTransitionEnd);
      this.$.addEventListener('mouseleave', this.onMouseLeave);
      this.$.addEventListener('click', this.onClick);
    },
  ],

  listeners: [
    {
      name: 'listenForCancel',
      isFramed: true,
      code: function() {
        if ( this.listeningForCancel_ || this.state !== 'OPEN' ) return;
        this.document.body.addEventListener('click', this.onCancel);
        this.listeningForCancel_ = true;
      },
    },
    {
      name: 'unlistenForCancel',
      isFramed: true,
      code: function() {
        if ( ! this.listeningForCancel_ || this.state !== 'CLOSED' ) return;
        this.document.body.removeEventListener('click', this.onCancel);
        this.listeningForCancel_ = false;
      },
    },
    {
      name: 'onCancel',
      code: function(e) { this.close(); },
    },
    {
      name: 'onTransitionEnd',
      code: function(e) { this.showBorder = (this.state === 'OPEN'); },
    },
    {
      name: 'onMouseLeave',
      code: function(e) {
        if ( e.target !== this.$ ) return;
        this.close();
      },
    },
    {
      name: 'onClick',
      code: function(e) {
        // Prevent clicks in the popup from closing the popup.
        e.stopPropagation();
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <dropdown-overlay id="%%id-overlay"></dropdown-overlay>
      <dropdown id="%%id" style="%%getPositionStyle()"></dropdown>
    */},
    function CSS() {/*
      dropdown-overlay {
        position: fixed;
        z-index: 1009;
      }
      dropdown {
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
        display: block;
        font-size: 13px;
        font-weight: 400;
        overflow-x: hidden;
        overflow-y: scroll;
        position: absolute;
        right: 3px;
        top: 4px;
        transition: height 0.25s cubic-bezier(0,.3,.8,1);
        z-index: 1010;
      }
    */}
  ],
});
