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
  name: 'OverlayHelpView',
  extends: 'foam.ui.SimpleView',

  requires: [
    'foam.ui.OverlayView',
    'foam.ui.CSSTransitionSet',
  ],
  imports: [
    'animate',
    'document',
    'setTimeout',
  ],

  properties: [
    {
      type: 'Array',
      subType: 'foam.ui.HelpSnippetView',
      name: 'helpSnippets',
      required: true,
    },
    {
      type: 'Function',
      name: 'onComplete',
      defaultValue: nop,
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'actionLocation',
      defaultValue: '',
      choices: [
        ['TOP_LEFT', 'Top-left'],
        ['TOP_RIGHT', 'Top-right'],
        ['BOTTOM_LEFT', 'Bottom-left'],
        ['BOTTOM_RIGHT', 'Bottom-right'],
      ],
    },
    {
      type: 'Int',
      name: 'index',
      defaultValue: 0,
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'state',
      defaultValue: 'CLOSED',
      choices: [
        ['CLOSED', 'Closed'],
        ['OPENING', 'Opening'],
        ['OPEN', 'Open'],
        ['CLOSING', 'Closing'],
        ['COMPLETE', 'Complete'],
      ],
    },
    {
      type: 'Array',
      subType: 'foam.ui.OverlayView',
      name: 'overlays_',
    },
  ],

  methods: [
    function opening() {
      var helpSnippetView = this.helpSnippets[this.index];
      if ( ! helpSnippetView ) {
        this.state = 'CLOSED';
        return;
      }
      var closeActionView = this.closeActionView;

      helpSnippetView.alpha = 0;
      this.aconstructContent(function() {
        this.actionLocation = helpSnippetView.actionLocation;
        this.animate(
            250,
            function() {
              var os = this.overlays_;
              for ( var i = 0; i < os.length; ++i ) {
                os[i].alpha = 0.7;
              }
              helpSnippetView.alpha = 1;
              closeActionView.alpha = 1;
            }.bind(this),
            Movement.easeOut(0.25),
            function() {
              this.state = 'OPEN';
            }.bind(this))();
      }.bind(this));
    },
    function closing() {
      var helpSnippetView = this.helpSnippets[this.index];
      if ( ! helpSnippetView ) {
        this.state = 'OPEN';
        return;
      }
      var closeActionView = this.closeActionView;

      this.animate(
          250,
          function() {
            var os = this.overlays_;
            for ( var i = 0; i < os.length; ++i ) {
              os[i].alpha = 0;
            }
            helpSnippetView.alpha = 0;
            closeActionView.alpha = 0;
          }.bind(this),
          Movement.easeIn(0.25),
          function() {
            this.actionLocation = '';
            this.destroyContent();
            this.state = 'CLOSED';
          }.bind(this))();
    },
    function closed() {
      if ( this.helpSnippets[this.index + 1] ) {
        ++this.index;
        this.state = 'OPENING';
      } else {
        this.state = 'COMPLETE';
        this.onComplete();
        this.destroy();
      }
    },
    function destroyContent() {
      for ( var i = 0; i < this.overlays_.length; ++i ) {
        this.destroyView_(this.overlays_[i]);
      }
      this.overlays_ = [];
      this.destroyView_(this.helpSnippets[this.index]);
      this.helpSnippets[this.index].aafterDestroy();
    },
    function aconstructContent(ret) {
      this.helpSnippets[this.index].abeforeInit(function() {
        this.constructOverlays();
        this.constructView_(this.helpSnippets[this.index]);
        ret && ret();
      }.bind(this));
    },
    function constructOverlays() {
      var helpSnippet = this.helpSnippets[this.index];
      var $ = helpSnippet.target.$;
      var rect = $.getBoundingClientRect($);
      var vpWidth = this.document.documentElement.clientWidth;
      var vpHeight = this.document.documentElement.clientHeight;
      var Overlay = this.OverlayView.xbind({
        alpha: 0,
        cssTransitions: '',
      });

      var overlays = [];
      if ( rect.top > 0 ) overlays.push(Overlay.create({
        height: rect.top,
      }, this.Y));
      if ( rect.bottom < vpHeight ) overlays.push(Overlay.create({
        y: rect.bottom,
        height: vpHeight - rect.bottom,
      }, this.Y));
      if ( rect.left > 0 ) overlays.push(Overlay.create({
        y: rect.top,
        width: rect.left,
        height: rect.bottom - rect.top -
            (rect.bottom >= vpHeight ? 1 : 0),
      }, this.Y));
      if ( rect.right < vpWidth ) overlays.push(Overlay.create({
        x: rect.right,
        y: rect.top,
        height: rect.bottom - rect.top -
            (rect.bottom >= vpHeight ? 1 : 0),
      }, this.Y));
      this.overlays_ = overlays;

      for ( var i = 0; i < overlays.length; ++i ) {
        this.constructView_(overlays[i]);
      }
    },
    function constructView_(v) {
      this.document.body.insertAdjacentHTML('afterbegin', v.toHTML());
      v.initHTML();
    },
    function destroyView_(v) {
      var parent = v.parent;
      var $ = v.$;
      if ( parent ) parent.removeChild(v);
      else          v.destroy();
      this.document.body.removeChild($);
    },
    function construct() {
      this.constructView_(this);
    },
    function initHTML() {
      this.SUPER();
      this.state$.addListener(this.onStateChange);
      this.state = 'OPENING';
      // this.aconstructContent(0, nop);
    },
    function destroy() {
      var $ = this.$;
      var ret = this.SUPER.apply(this, arguments);
      this.document.body.removeChild($);
      return ret;
    },
  ],

  actions: [
    {
      name: 'closeAction',
      label: 'OK, got it',
      code: function() { this.state = 'CLOSING'; },
    },
  ],

  listeners: [
    {
      name: 'onStateChange',
      code: function(_, __, ___, state) {
        var stateFn = this[state.toLowerCase()];
        if ( stateFn ) stateFn.apply(this);
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <overlay-help id="%%id" %%cssClassAttr()>
        $$closeAction{
          extraClassName: 'close-action',
          raised: true,
          background: '#02A8F3',
          color: 'white',
        }
      </overlay-help>
      <% this.on('click', function() {
           console.log('Bounce');
           var e = this.$.querySelector('.close-action');
           if ( e && e.style.animation === '' ) {
             e.style.animation = e.style.webkitAnimation =
                 'bounce 0.5s ease-in-out';
             e.addEventListener('animationend', function() {
               e.style.animation = e.style.webkitAnimation = '';
             });
           }
         }.bind(this), this.id);
         this.setClass('top-left', function() {
           return this.actionLocation === 'TOP_LEFT';
         }.bind(this), this.closeActionView.id);
         this.setClass('top-right', function() {
           return this.actionLocation === 'TOP_RIGHT';
         }.bind(this), this.closeActionView.id);
         this.setClass('bottom-left', function() {
           return this.actionLocation === 'BOTTOM_LEFT';
         }.bind(this), this.closeActionView.id);
         this.setClass('bottom-right', function() {
           return this.actionLocation === 'BOTTOM_RIGHT';
         }.bind(this), this.closeActionView.id); %>
    */},
    function CSS() {/*
      @keyframes bounce {
          0%   { transform: scale(1.0); }
          50%  { transform: scale(1.15); }
          80%  { transform: scale(0.9); }
          90%  { transform: scale(1.05); }
          95%  { transform: scale(0.95); }
          100% { transform: scale(1.0); }
      }
      overlay-help {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 1000;
      }
      overlay-help .close-action {
        display: none;
        position: fixed;
        z-index: 2000;
      }
      overlay-help .close-action.top-left { display: block; top: 0; left: 0; }
      overlay-help .close-action.top-left { display: block; top: 0; left: 0; }
      overlay-help .close-action.top-right { display: block; top: 0; right: 0; }
      overlay-help .close-action.bottom-left { display: block; bottom: 0; left: 0; }
      overlay-help .close-action.bottom-right { display: block; bottom: 0; right: 0; }
    */},
  ],
});
