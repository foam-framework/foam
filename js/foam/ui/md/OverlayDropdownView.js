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
  extends: 'foam.ui.SimpleView',

  requires: [
    'foam.ui.md.FlatButton',
  ],
  imports: [
    'document',
    'window',
  ],
  exports: [
    'as dropdown',
  ],

  properties: [
    'data',
    {
      type: 'ViewFactory',
      name: 'delegate',
    },
    {
      name: 'delegateView',
      defaultValue: null,
    },
    {
      type: 'Float',
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
      model_: 'foam.core.types.StringEnumProperty',
      name: 'animationState',
      defaultValue: 'CLOSED',
      choices: [
        ['CLOSED', 'Closed'],
        ['OPEN', 'open'],
      ],
    },
    {
      type: 'Boolean',
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
      type: 'Boolean',
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
      var getComputedStyle = this.window.getComputedStyle.bind(this.window);

      var myStyle = getComputedStyle(this.$);
      var border = 0;
      ['border-top', 'border-bottom'].forEach(function(name) {
        var match = myStyle[name].match(/^([0-9]+)px/);
        if ( match ) border += parseInt(match[1]);
      });

      var last = this.$.lastElementChild;
      var margin = parseInt(getComputedStyle(last)['margin-bottom']);
      margin = Number.isNaN(margin) ? 0 : margin;

      return Math.min(border + last.offsetTop + last.offsetHeight + margin,
          this.document.body.clientHeight - this.$.getBoundingClientRect().top);
    },
    function initHTML() {
      this.SUPER();
      this.$.addEventListener('transitionend', this.onTransitionEnd);
      this.$.addEventListener('mouseleave', this.onMouseLeave);
      this.$.addEventListener('click', this.onClick);
    },
    function init() {
      this.SUPER();
      this.Y.registerModel(this.FlatButton.xbind({
        displayMode: 'LABEL_ONLY',
        color: 'black',
      }), 'foam.ui.ActionButton');
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
      code: function(e) { this.animationState = this.state; },
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
        // Prevent clicks in the dropdown from closing the dropdown.
        e.stopPropagation();
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <dropdown-overlay id="%%id-overlay"></dropdown-overlay>
      <dropdown id="%%id" style="%%getPositionStyle()"></dropdown>
      <% this.setClass(
             'open',
             function() {
               this.state; this.animationState;
               return this.state === 'OPEN' && this.animationState === 'OPEN';
             }.bind(this),
             this.id); %>
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
        overflow-y: hidden;
        position: absolute;
        right: 3px;
        top: 4px;
        transition: height 0.25s cubic-bezier(0,.3,.8,1);
        z-index: 1010;
      }
      dropdown.open {
        overflow-y: auto;
      }
      dropdown action-list.vertical {
        margin-top: 0;
      }
      dropdown action-list.vertical .md-button {
        border-radius: 0;
      }
      dropdown action-list.vertical .md-button-label {
        text-transform: none;
      }
      dropdown .label-only {
        margin: 0;
        padding: 0;
      }
      dropdown .label-only .md-button-label {
        margin: auto;
        font-weight: 400;
      }
    */}
  ],
});
