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
  name: 'PopupView',
  package: 'foam.ui.md',
  extendsModel: 'foam.flow.Element',

  requires: [ 'foam.ui.md.ModalOverlayView' ],
  exports: [ 'as popup' ],

  constants: { ELEMENT_NAME: 'popup' },

  properties: [
    {
      model_: 'StringProperty',
      name: 'className',
      defaultValue: 'closed'
    },
    {
      model_: 'FloatProperty',
      name: 'alpha',
      defaultValue: 0
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'overlay',
      defaultValue: 'foam.ui.md.ModalOverlayView'
    },
    {
      name: 'overlayView'
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'delegate',
      defaultValue: {
        factory_: 'foam.ui.md.Card',
        delegate: {
          factory_: 'foam.ui.md.CardTitle',
          data: 'Popup Title'
        }
      }
    },
    {
      name: 'delegateView'
    },
    {
      name: 'containerView'
    },
    {
      model_: 'FloatProperty',
      name: 'openDuration',
      defaultValue: 300
    },
    {
      model_: 'FloatProperty',
      name: 'closeDuration',
      defaultValue: 300
    },
    {
      name: 'animationEase',
      defaultValue: Movement.easeOut(0.9)
    },
    {
      name: 'openAnimation',
      factory: function() {
        return Movement.animate(
            this.openDuration,
            function() { this.alpha = 1; }.bind(this),
            this.animationEase,
            function() { this.className = 'open'; }.bind(this));
      }
    },
    {
      name: 'closeAnimation',
      factory: function() {
        return Movement.animate(
            this.closeDuration,
            function() { this.alpha = 0; }.bind(this),
            this.animationEase,
            function() { this.className = 'closed'; }.bind(this));
      }
    }
  ],

  methods: [
    {
      name: 'construct',
      code: function() {
        this.overlayView = this.overlay();
        this.delegateView = this.delegate();
        this.addChild(this.overlayView);
        this.addDataChild(this.delegateView);
        return this.SUPER.apply(this, arguments);
      }
    },
    {
      name: 'initHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        this.containerView = this.X.$(this.id + '-container');

        Events.dynamic(function() {
          this.alpha;
          if ( this.overlayView )
            this.overlayView.alpha = this.overlayView.openAlpha * this.alpha;
          if ( this.containerView )
            this.containerView.style.opacity = this.alpha;
        }.bind(this));
      }
    },
    {
      name: 'open',
      code: function() {
        this.className = '';
        this.openAnimation();
      }
    },
    {
      name: 'close',
      code: function() {
        this.className = '';
        this.closeAnimation();
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*
      %%overlayView
      <popup-container id="{{this.id}}-container">
        %%delegateView
      </popup-container>
    */},
    function CSS() {/*
      popup.closed { display: none; }
      popup {
        display: block;
        z-index: 100;
      }
      popup-container {
        position: fixed;
        top: 0px;
        left: 0px;
        right: 0px;
        bottom: 0px;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
    */}
  ]
});
