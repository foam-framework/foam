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
  name: 'PositionedPopupAnimation',
  package: 'foam.ui.md',

  imports: [ 'document' ],

  properties: [
    {
      name: 'popup',
      required: true,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( this.popup && this.popup.innerView )
          this.popup.cssInnerPosition = 'absolute';
      }
    },
    {
      name: 'easing',
      defaultValue: Movement.easeOut(0.9)
    },
    {
      type: 'Float',
      name: 'openDuration',
      defaultValue: 250
    },
    {
      type: 'Float',
      name: 'closeDuration',
      defaultValue: 250
    },
    {
      name: 'openDirection',
      defaultValue: 'bottom'
    },
    {
      name: 'closeDirection',
      defaultValue: 'bottom'
    },
    {
      name: 'openAnimation',
      lazyFactory: function() {
        return this.getPositionedAnimation(true);
      }
    },
    {
      name: 'closeAnimation',
      lazyFactory: function() {
        return this.getPositionedAnimation(false);
      }
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        this.popup.alpha = 1;
        this.popup.zoom = 1;
        this.setInitialPosition(true);
      }
    },
    {
      name: 'setInitialPosition',
      todo: 'We should use a shadow flex view for this instead.',
      code: function(isOpenAnimation) {
        if ( this.popup && this.popup.innerView ) {
          var popup = this.popup, prevClassName = popup.className;
          popup.className = 'hidden';

          popup.cssInnerPosition = 'absolute';
          var direction = isOpenAnimation ? this.openDirection :
                  this.closeDirection,
              view = popup.innerView,
              parent = popup.cssPosition === 'fixed' ?
                  this.document.body : popup.$.parentNode;
          if ( isOpenAnimation ) {
            if ( direction === 'left' ) {
              popup.left = -view.clientWidth;
              popup.top = (parent.clientHeight / 2) - (view.clientHeight / 2);
            } else if ( direction === 'right' ) {
              popup.left = parent.clientWidth;
              popup.top = (parent.clientHeight / 2) - (view.clientHeight / 2);
            } else if ( direction === 'top' ) {
              popup.left = (parent.clientWidth / 2) - (view.clientWidth / 2);
              popup.top = -view.clientHeight;
            } else {
              popup.left = (parent.clientWidth / 2) - (view.clientWidth / 2);
              popup.top = parent.clientHeight;
            }
          } else {
            popup.left = (parent.clientWidth / 2) - (view.clientWidth / 2);
            popup.top = (parent.clientHeight / 2) - (view.clientHeight / 2);
          }

          popup.className = prevClassName;
        }
      }
    },
    {
      name: 'getPositionedAnimation',
      code: function(isOpenAnimation) {
        return Movement.animate(
            isOpenAnimation ? this.openDuration :
                this.closeDuration,
            function() {
              var popup = this.popup,
                  direction = isOpenAnimation ? this.openDirection :
                      this.closeDirection,
                  popupPropName = (direction === 'left' ||
                      direction === 'right') ? 'left' : 'top',
                  clientPropName = (direction === 'left' ||
                      direction === 'right') ? 'clientWidth' :
                      'clientHeight',
                  view = popup.innerView,
                  viewDim = view ? view[clientPropName] : 0,
                  parent = popup.cssPosition === 'fixed' ?
                      this.document.body : popup.$.parentNode,
                  parentDim = parent ? parent[clientPropName] : 0,
                  centerDim = (parentDim / 2) - (viewDim / 2);
              if ( isOpenAnimation ) {
                popup[popupPropName] = centerDim;
              } else {
                popup[popupPropName] = (direction === 'right' ||
                    direction === 'bottom') ? parentDim :  -viewDim;
              }
              if ( popup.overlayView )
                popup.overlayView.alpha = isOpenAnimation ?
                    popup.overlayView.openAlpha : 0;
            }.bind(this),
            this.easing,
            function() {
              this.popup.className = isOpenAnimation ? 'open' : 'closed';
              this.popup.cssInnerPosition = 'initial';
            }.bind(this));
      }
    }
  ]
});
