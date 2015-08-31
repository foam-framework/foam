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
  extendsModel: 'foam.ui.SimpleView',

  exports: [ 'as popup' ],
  imports: [
    'clearTimeout',
    'setTimeout',
    'document'
  ],

  properties: [
    {
      model_: 'ViewFactoryProperty',
      name: 'delegate',
      documentation: function() {/* The inner view to pop up.
        This should be created in the context of this popup,
        so that X.popup is available to the inner
        view to control the popup.</p>
        <p>The ViewContainerController interface includes methods to control
        your containing view, including .accept() and .reject()
        for standard dialogs. */}
    },
    {
      name: 'delegateView',
      defaultValue: null
    },
    {
      name: '$content',
      getter: function() {
        return this.document.getElementById(this.id+'Content');
      }
    },
    {
      name: '$blocker',
      getter: function() {
        return this.document.getElementById(this.id+'Blocker');
      }
    },
    {
      name: 'cardClass',
      defaultValue: 'md-card'
    },
    {
      name: 'className',
      defaultValue: "popup-view-container"
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'layoutMode',
      defaultValue: 'fixed',
      choices: [
        ['fixed', 'Fixed'],
        ['relative', 'Relative']
      ]
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'blockerMode',
      defaultValue: 'cancellable',
      choices: [
        ['cancellable', 'Cancellable'],
        ['modal', 'Modal']
      ]
    },
    {
      name: 'state',
      defaultValue: 'closed'
    },
    {
      name: 'closeLatch_'
    },
    {
      name: 'width',
      help: 'If set, specifies the CSS width of the content container.',
    },
    {
      name: 'height',
      help: 'If set, specifies the CSS height of the content container.',
    }
  ],

  methods: {
    open: function(sourceElement) {
      if ( this.closeLatch_ ) this.closeLatch_();

      if ( this.state == 'closed' ) {
        this.delegateView = this.delegate({ data$: this.data$ }, this.Y);

        this.layoutMode = sourceElement ? 'relative' : 'fixed';

        if ( this.$ ) this.$.outerHTML = '';  // clean up old copy, in case of rapid re-activation
        var parentElement = sourceElement || this.document.body;
        parentElement.insertAdjacentHTML('beforeend', this.toHTML());
        this.initializePosition();
        this.setTimeout(function() {  this.animateToExpanded(); }.bind(this), 100);
        this.initHTML();
        this.state = 'open';
      }
    },
    initializePosition: function() {
      this.$content.style.zIndex = "1010";
      //this.$content.style.transform = "translateY("+this.viewportSize().height+"px)";
      this.$content.style.opacity = "0";
      this.$blocker.style.opacity = "0";
      if ( this.width ) this.$content.style.width = this.width;
      if ( this.height ) this.$content.style.height = this.height;
    },
    animateToExpanded: function() {
      //this.$content.style.transition = "transform cubic-bezier(0.0, 0.0, 0.2, 1) .1s";
      //this.$content.style.transform = "translateY(0)";
      this.$content.style.transition = "opacity cubic-bezier(0.0, 0.0, 0.2, 1) .1s";
      this.$content.style.opacity = "1";

      this.$blocker.style.transition = "opacity cubic-bezier(0.0, 0.0, 0.2, 1) .1s";
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
      this.state = 'closing';

      this.animateToHidden();
      var id = this.setTimeout(function() { this.destroy(); }.bind(this), 300);
      this.closeLatch_ = function() {
        this.clearTimeout(id);
        this.closeLatch_ = '';
        this.destroy();
      }.bind(this);
    },
    destroy: function(p) {
      if ( this.$ ) this.$.outerHTML = '';
      this.delegateView = null;
      this.state = 'closed';
      this.SUPER(p);
    },

  },

  templates: [
    function toInnerHTML() {/*
      <div id="<%= this.id %>Blocker" class='popup-view-modal-blocker'></div>
      <% this.on('click', function() {
           if ( this.blockerMode === 'cancellable' ) self.close();
         }, this.id + 'Blocker'); %>
      <div id="<%= this.id %>Content" class='md-popup-view-content <%= this.cardClass %>'>
        %%delegateView
      </div>
      <% this.setClass('fixed', function() {
           return this.layoutMode === 'fixed';
         }, this.id); %>
      <% this.setClass('relative', function() {
           return this.layoutMode === 'relative';
         }, this.id); %>
    */},
    function CSS() {/*
      .fixed .popup-view-modal-blocker, .fixed.popup-view-container {
        position: fixed;
      }
      .relative .popup-view-modal-blocker, .relative.popup-view-container {
        position: absolute;
      }
      .popup-view-modal-blocker {
        top: 0px;
        left: 0px;
        bottom: 0px;
        right: 0px;
        background: black;
        opacity: 0;
      }
      .popup-view-container {
        display: flex;
        align-items: center;
        justify-content: center;
        top: 0px;
        left: 0px;
        bottom: 0px;
        right: 0px;
        z-index: 1000;
      }
      .popup-view-content {
        background: white;
      }

    */}
  ]
});
