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

  constants: {
    // Duration of in/out transitions, in seconds.
    TRANSITION_DURATION: 0.3,

    // Animation strategies:
    FADE: {
      initialContentOpacity: 0,
      initialBlockerOpacity: 0,
      animateToHidden: function() {
        if ( this.$content ) {
          this.setTransition(this.$content,
                             'opacity', 'cubic-bezier(0.4, 0.0, 1, 1) ' +
                                 this.TRANSITION_DURATION + 's');
          this.$content.style.opacity = '0';
          this.$content.style.pointerEvents = 'none';
        }
        if ( this.$blocker ) {
          this.setTransition(this.$blocker,
                             'opacity', 'cubic-bezier(0.4, 0.0, 1, 1) ' +
                                 this.TRANSITION_DURATION + 's', '0');
          this.$blocker.style.pointerEvents = 'none';
        }
      },
      animateToExpanded: function() {
        //this.$content.style.transition = 'transform cubic-bezier(0.0, 0.0, 0.2, 1) ' + this.TRANSITION_DURATION + 's';
        //this.$content.style.transform = 'translateY(0)';
        this.setTransition(this.$content,
                           'opacity', 'cubic-bezier(0.0, 0.0, 0.2, 1) ' +
                               this.TRANSITION_DURATION + 's');
        this.$content.style.opacity = '1';

        this.setTransition(this.$blocker,
                           'opacity', 'cubic-bezier(0.0, 0.0, 0.2, 1) ' +
                               this.TRANSITION_DURATION + 's', '0.4');
      },
    },
    BOTTOM: {
      initialContentOpacity: 0,
      initialBlockerOpacity: 0,
      animateToHidden: function() {
        if ( this.$content ) {
          // Current location before animation begins.
          var rect = this.$content.getBoundingClientRect();

          // Switch to fixed layout strategy without moving element.
          this.$content.style.position = 'fixed';
          this.$content.style.top = rect.top;
          this.$content.style.left = rect.left;
          this.$content.style.width = rect.width;
          this.$content.style.height = rect.height;
          this.setTransition(this.$content,
                             'top', 'cubic-bezier(0.4, 0.0, 1, 1) ' +
                                 this.TRANSITION_DURATION + 's',
                             '' + this.document.documentElement.clientHeight);
          this.$content.style.pointerEvents = 'none';
        }
        if ( this.$blocker ) {
          this.setTransition(this.$blocker,
                             'opacity', 'cubic-bezier(0.4, 0.0, 1, 1) ' +
                                 this.TRANSITION_DURATION + 's', '0');
          this.$blocker.style.pointerEvents = 'none';
        }
      },
      animateToExpanded: function() {
        // Target location based on current layout.
        var rect = this.$content.getBoundingClientRect();
        // Target layout to restore after animation completes.
        var style = this.X.window.getComputedStyle(this.$content);
        var position = style.position;
        var top = style.top;
        var left = style.left;
        var width = style.width;
        var height = style.height;

        // Switch to fixed layout situated beneath the viewport.
        this.$content.style.position = 'fixed';
        this.$content.style.top = this.document.documentElement.clientHeight;
        this.$content.style.left = rect.left;
        this.$content.style.width = rect.width;
        this.$content.style.height = rect.height;
        this.$content.style.opacity = '1';
        // Transition to target location.
        this.setTransition(this.$content,
                           'top', 'cubic-bezier(0.4, 0.0, 1, 1) ' +
                               this.TRANSITION_DURATION + 's', '' + rect.top);
        // Restore initial styling after animation completes.
        var listener = function() {
          var rect2 = this.$content.getBoundingClientRect();
          if ( rect2.top !== rect.top ) return;
          this.setTransition(this.$content,
                             'none');
          this.$content.style.top = top;
          this.$content.style.left = left;
          this.$content.style.width = width;
          this.$content.style.height = height;
          this.$content.style.position = position;
          this.$content.removeEventListener('transitionend', listener);
        }.bind(this);
        this.$content.addEventListener('transitionend', listener);

        this.setTransition(this.$blocker,
                           'opacity', 'cubic-bezier(0.0, 0.0, 0.2, 1) ' +
                               this.TRANSITION_DURATION + 's', '0.4');
      }
    }
  },

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
        ['fixed',    'Fixed'],
        ['relative', 'Relative']
      ]
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'layoutPosition',
      defaultValue: 'center',
      choices: [
        ['center',    'Center'],
        ['top',    'Top'],
        ['bottom', 'Bottom']
      ]
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'blockerMode',
      defaultValue: 'cancellable',
      choices: [
        ['cancellable', 'Cancellable'],
        ['modal',       'Modal']
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
    },
    {
      name: 'animationStrategy',
      help: 'A strategy that implements animateToHidden() and animateToExpanded()',
      lazyFactory: function() { return this.FADE; },
      adapt: function(old, nu) {
        if ( old === nu ) return nu;
        if ( typeof nu === 'string' && this[nu.toUpperCase()] )
          nu = this[nu.toUpperCase()];
        if ( ! nu || ! nu.animateToHidden || ! nu.animateToExpanded )
          return this.FADE;
        return nu;
      }
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
      this.$content.style.opacity = this.animationStrategy.initialContentOpacity;
      this.$blocker.style.opacity = this.animationStrategy.initialBlockerOpacity;
      if ( this.width ) this.$content.style.width = this.width;
      if ( this.height ) this.$content.style.height = this.height;
    },
    animateToExpanded: function() {
      this.animationStrategy.animateToExpanded.call(this);
      this.isHidden = false;
    },
    animateToHidden: function() {
      this.isHidden = true;
      this.animationStrategy.animateToHidden.call(this);
    },
    close: function() {
      this.state = 'closing';

      this.animateToHidden();
      var id = this.setTimeout(function() { this.destroy(); }.bind(this),
                               this.TRANSITION_DURATION * 1000 + 150);
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
    setTransition: function(e, prop, transition, value) {
      e.style.transition = prop + ' ' + transition;
      e.offsetLeft = e.offsetLeft;
      if ( value ) e.style[prop] = value;
    }
  },

  templates: [
    function toInnerHTML() {/*
      <% if ( this.delegateView ) { %>
        <div id="<%= this.id %>Blocker" class='popup-view-modal-blocker'></div>
        <% this.on('click', function() {
             if ( this.blockerMode === 'cancellable' ) self.close();
           }, this.id + 'Blocker'); %>
        <div id="<%= this.id %>Content" class='md-popup-view-content <%= this.cardClass %>'>
          %%delegateView
        </div>
        <% this.setClass('center', function() {
             return this.layoutPosition === 'center';
           }, this.id); %>
        <% this.setClass('top', function() {
             return this.layoutPosition === 'top';
           }, this.id); %>
        <% this.setClass('bottom', function() {
             return this.layoutPosition === 'bottom';
           }, this.id); %>
        <% this.setClass('fixed', function() {
             return this.layoutMode === 'fixed';
           }, this.id); %>
        <% this.setClass('relative', function() {
             return this.layoutMode === 'relative';
           }, this.id); %>
      <% } %>
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
        justify-content: center;
        align-items: center;
        top: 0px;
        left: 0px;
        bottom: 0px;
        right: 0px;
        z-index: 1000;
      }
      .popup-view-container.center {
        align-items: center;
      }
      .popup-view-container.bottom {
        align-items: flex-end;
      }
      .popup-view-container.top {
        align-items: flex-start;
      }
      .popup-view-content {
        background: white;
      }
    */}
  ]
});
