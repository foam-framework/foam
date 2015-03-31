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

  requires: [
    'foam.ui.md.ModalOverlayView',
    'foam.ui.md.PositionedPopupAnimation as Animation'
  ],
  exports: [ 'as popup' ],

  constants: { ELEMENT_NAME: 'popup' },

  properties: [
    {
      model_: 'StringProperty',
      name: 'className',
      defaultValue: 'closed'
    },
    {
      model_: 'StringProperty',
      name: 'cssPosition',
      defaultValue: 'fixed',
      postSet: function(old, nu) {
        if ( ! this.$ ) return;
        this.$.style.position = this.cssPosition;
      }
    },
    {
      model_: 'StringProperty',
      name: 'cssInnerPosition',
      defaultValue: 'fixed',
      postSet: function(old, nu) {
        if ( ! this.innerView ) return;
        this.innerView.style.position = this.cssInnerPosition;
      }
    },
    {
      name: 'left',
      defaultValue: '',
      postSet: function(old, nu) {
        if ( ! this.innerView || old === nu ) return;
        this.innerView.style.left = this.left ? this.left + 'px' : '';
      }
    },
    {
      name: 'top',
      defaultValue: '',
      postSet: function(old, nu) {
        if ( ! this.innerView || old === nu ) return;
        this.innerView.style.top = this.top ? this.top + 'px' : '';
      }
    },
    {
      model_: 'FloatProperty',
      name: 'alpha',
      defaultValue: 1
    },
    {
      model_: 'FloatProperty',
      name: 'zoom',
      defaultValue: 1
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
      name: 'innerView'
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
      name: 'animation',
      lazyFactory: function() {
        return this.Animation.create({ popup: this });
      }
    }
  ],

  methods: [
    {
      name: 'construct',
      code: function() {
        this.overlayView = this.overlay({ cssPosition: 'inerhit' });
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
        this.innerView = this.X.$(this.id + '-view');

        this.$.style.position = this.cssPosition;

        Events.dynamic(function() {
          this.alpha; this.zoom;
          if ( this.containerView ) {
            var cvStyle = this.containerView.style;
            cvStyle.opacity = this.alpha;
            cvStyle.zoom = this.zoom;
          }
        }.bind(this));

        this.animation && this.animation.initHTML && this.animation.initHTML();
      }
    },
    {
      name: 'initInnerHTML',
      code: function() {
        this.SUPER.apply(this, arguments);
        this.animation && this.animation.initInnerHTML &&
            this.animation.initInnerHTML();
      }
    },
    {
      name: 'open',
      code: function() {
        this.className = '';
        if ( this.animation ) {
          this.animation.setInitialPosition &&
              this.animation.setInitialPosition(true);
          this.animation.openAnimation &&
              this.animation.openAnimation();
        }
      }
    },
    {
      name: 'close',
      code: function() {
        this.className = '';
        if ( this.animation ) {
          this.animation.setInitialPosition &&
              this.animation.setInitialPosition(false);
          this.animation.closeAnimation &&
              this.animation.closeAnimation();
        }
      }
    },
    {
      name: 'getPositionedAnimation',
      code: function(positionPropName, isOpen) {
        return Movement.animate(
            isOpen ? this.openDuration : this.closeDuration,
            function() {
              if ( isOpen ) {
                // this[positionPropName] = 0;
              } else {
                var parent = this.cssPosition === 'fixed' ?
                    this.document.body : this.$.parentNode;
                this[positionPropName] =
                    (positionPropName.indexOf('left') >= 0 ||
                    positionPropName.indexOf('right' >= 0)) ?
                    parent.clientWidth : parent.clientHeight;
              }
              if ( this.overlayView )
                this.overlayView.alpha = isOpen ? this.overlayView.openAlpha : 0;
            }.bind(this),
            this.animationEase,
            function() {
              this.className = isOpen ? 'open' : 'closed';
            }.bind(this));
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*
      %%overlayView
      <popup-container id="{{this.id}}-container">
        <popup-view id="{{this.id}}-view">
          %%delegateView
        </popup-view>
      </popup-container>
    */},
    function CSS() {/*
      popup.closed { display: none; }
      popup.hidden { visibility: hidden; }
      popup {
        display: block;
        z-index: 100;
      }
      popup-container {
        position: inherit;
        top: 0px;
        left: 0px;
        right: 0px;
        bottom: 0px;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      popup-view {
        display: block;
      }
    */}
  ]
});
