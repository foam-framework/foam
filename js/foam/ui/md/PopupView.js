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
      name: '$content',
      getter: function() {
        return this.X.$$('popup-view-content')[0];
      }
    },
    {
      name: '$blocker',
      getter: function() {
        return this.X.$$('popup-view-modal-blocker')[0];
      }
    },
  ],

  methods: {
    open: function(sourceElement) {
      if ( this.$ ) this.$.outerHTML = '';  // clean up old copy, in case of rapid re-activation
      this.X.document.body.insertAdjacentHTML('beforeend', this.toHTML());
      this.initializePosition();
      this.animateToExpanded();
      this.initHTML();
    },
    initializePosition: function() {
      this.$content.style.zIndex = "1010";
      this.$content.style.transform = "translate3d(0, "+this.viewportSize().height+"px, 0)";
    },
    animateToExpanded: function() {
      this.$content.style.transition = "transform cubic-bezier(0.0, 0.0, 0.2, 1) .1s";
      this.$content.style.transform = "translate3d(0,0,0)";
      this.$blocker.style.transition = "opacity cubic-bezier(0.0, 0.0, 0.2, 1) .1s"
      this.$blocker.style.opacity = "0.4";
      this.isHidden = false;
    },
    animateToHidden: function() {
      this.isHidden = true;
      if ( this.$content ) {
        this.$content.style.transition = "opacity cubic-bezier(0.4, 0.0, 1, 1) .1s"
        this.$content.style.opacity = "0";
        this.$content.style.pointerEvents = "none";
      }
      if ( this.$blocker ) {
        this.$blocker.style.transition = "opacity cubic-bezier(0.4, 0.0, 1, 1) .1s"
        this.$blocker.style.opacity = "0";
        this.$blocker.style.pointerEvents = "none";
      }
    },
    close: function() {
      this.animateToHidden();
      this.X.setTimeout(function() { if ( this.$ ) this.$.outerHTML = ''; }.bind(this), 500);
      this.SUPER();
    },
    destroy: function(p) {
      this.X.setTimeout(function() { if ( this.$ ) this.$.outerHTML = ''; }.bind(this), 500);
      this.SUPER(p);
    }
  },

  templates: [
    function toInnerHTML() {/*
      <div class='popup-view-modal-blocker'></div>
      <div class='popup-view-content'>
        %%delegate()
      </div>
    */},
    function CSS() {/*
      .popup-view-modal-blocker {
        position: fixed;
        top: 0px;
        left: 0px;
        bottom: 0px;
        right: 0px;
        color: black;
        opacity: 0.001;

      }
    */}
  ]
});
