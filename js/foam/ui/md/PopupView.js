/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  name: 'PopupView',
  package: 'foam.ui.md',
  extendsModel: 'foam.ui.View',

  requires: [
  ],
  exports: [ 'as popup' ],

  properties: [
    {
      model_: 'ViewFactoryProperty',
      name: 'delegate'
    },
    {
      name: 'delegateView'
    },
  ],

  methods: [
    {
      name: 'open',
      code: function(sourceElement) {
        this.className = '';
        this.updateHTML();
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
      <% if ( this.className != 'closed' ) { %>
        <%
          this.overlayView = this.overlay({ cssPosition: 'inerhit' });
          this.delegateView = this.delegate();
          this.addChild(this.overlayView);
          this.addDataChild(this.delegateView);
        %>
        %%overlayView
        <popup-container id="{{this.id}}-container">
          <popup-view id="{{this.id}}-view">
            %%delegateView
          </popup-view>
        </popup-container>
      <% } %>
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
