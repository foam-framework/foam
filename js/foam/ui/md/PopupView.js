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
  extends: 'foam.ui.SimpleView',

  requires: [
    'foam.input.touch.GestureTarget'
  ],
  exports: [ 'as popup' ],
  imports: [
    'clearTimeout',
    'gestureManager',
    'setTimeout',
    'document'
  ],

  constants: {
    // Duration of in/out transitions, in seconds.
    TRANSITION_DURATION: 0.3,

    // Published event when close is a result of clicking outside popup.
    CANCEL: 'cancel',

    // Animation strategies:

    // Fade in/out: Supports -> open ->  close.
    FADE: {
      animateToHidden: function() {
        if ( this.$content ) {
          this.setTransition(this.$content,
                             'opacity', 'cubic-bezier(0.4, 0.0, 1, 1) ' +
                                 this.TRANSITION_DURATION + 's');
          this.$content.style.opacity = '0';
          this.$content.style.pointerEvents = 'none';
          this.setLatch('closed');
        }
        if ( this.$blocker ) {
          this.setTransition(this.$blocker,
                             'opacity', 'cubic-bezier(0.4, 0.0, 1, 1) ' +
                                 this.TRANSITION_DURATION + 's', '0');
          this.$blocker.style.pointerEvents = 'none';
        }
        this.setLatch('closed', function() {
          this.destroy();
        }.bind(this));
      },
      animateToOpen: function() {
        this.setTransition(this.$content,
                           'opacity', 'cubic-bezier(0.0, 0.0, 0.2, 1) ' +
                               this.TRANSITION_DURATION + 's');
        this.$content.style.opacity = '1';

        this.setTransition(this.$blocker,
                           'opacity', 'cubic-bezier(0.0, 0.0, 0.2, 1) ' +
                               this.TRANSITION_DURATION + 's', '0.4');
        this.setLatch('open');
      },
    },

    // Appear from bottom: Supports -> open     <-> expanded,
    //                                 open      -> close,
    //                                 expanded  -> close.
    BOTTOM: {
      animateToHidden: function(opt_transitionTime) {
        var transitionTime = opt_transitionTime || this.TRANSITION_DURATION;
        if ( this.$content ) {
          this.setTransition(this.$content,
                             'top', 'cubic-bezier(0.4, 0.0, 1, 1) ' +
                                 transitionTime + 's', '100%');
          this.$content.style.pointerEvents = 'none';
        }
        if ( this.$blocker ) {
          this.setTransition(this.$blocker,
                             'opacity', 'cubic-bezier(0.4, 0.0, 1, 1) ' +
                                 transitionTime + 's', '0');
          this.$blocker.style.pointerEvents = 'none';
        }
        this.setLatch('closed', function() {
          this.destroy();
        }.bind(this));
      },
      animateToOpen: function(opt_transitionTime) {
        var transitionTime = opt_transitionTime || this.TRANSITION_DURATION;
        this.$content.style.position = 'absolute';
        this.$content.style.top = '100%';
        this.$content.style.left = '0';
        this.$content.style.width = '100%';
        this.$content.style.height = '50%';
        this.$content.style.opacity = '1';
        this.setTransition(this.$content,
                           'top', 'cubic-bezier(0.4, 0.0, 1, 1) ' +
                               transitionTime + 's', '50%');

        this.setTransition(this.$blocker,
                           'opacity', 'cubic-bezier(0.0, 0.0, 0.2, 1) ' +
                               transitionTime + 's', '0.4');
        this.setLatch('open');
      },
      animateToExpanded: function(opt_transitionTime) {
        var transitionTime = opt_transitionTime || this.TRANSITION_DURATION;
        this.$content.style.height = '100%';
        this.setTransition(this.$content,
                           'top', 'cubic-bezier(0.4, 0.0, 1, 1) ' +
                               transitionTime + 's', '0');
        this.setLatch('expanded');
      },
      animateToCollapsed: function(opt_transitionTime) {
        var transitionTime = opt_transitionTime || this.TRANSITION_DURATION;
        this.setTransition(this.$content,
                           'top', 'cubic-bezier(0.4, 0.0, 1, 1) ' +
                               transitionTime + 's', '50%');
        this.setLatch('open', function() {
          this.$content.style.height = '50%';
        }.bind(this));
      },
      dragStart: function(point) {
        var self = this.animationStrategy;
        if ( self.dragging_ ) return;
        var contentRect = this.$content.getBoundingClientRect();
        if ( point.y0 < contentRect.top ||
            point.y0 > (contentRect.top + this.dragHandleHeight) ) return;

        var parentRect = this.$.getBoundingClientRect();
        var delta = parentRect.top + point.y0 - contentRect.top;
        this.setTransition(this.$content, 'top');
        this.$content.style.height = '100%';
        self.onDrag = function() {
          this.$content.style.top = point.y - delta;
        }.bind(this);
        point.y$.addListener(self.onDrag);
        self.onDrag();
        self.dragging_ = true;
      },
      dragEnd: function(point) {
        var self = this.animationStrategy;
        if ( ! self.dragging_ ) return;

        point.y$.removeListener(self.onDrag);
        self.onDrag = nop;
        var parentRect = this.$.getBoundingClientRect();
        var contentRect = this.$content.getBoundingClientRect();
        var bounds = self.bounds[this.state];
        if ( ! bounds ) return;

        // Using drag bounds for current state, calculate linear interpolation
        // of remaining transition time and call appropriate transition fn.
        var transitionTime;
        if ( bounds[0](contentRect, parentRect) ) {
          transitionTime = this.TRANSITION_DURTION *
              ((contentRect.top - parentRect.top) / parentRect.height);
          this.expand(transitionTime);
        } else if ( bounds[1](contentRect, parentRect) ) {
          var halfSize = parentRect.height / 2;
          transitionTime = this.TRANSITION_DURTION *
              (Math.abs(contentRect.top - parentRect.top - halfSize) /
              halfSize);
          this.collapse(transitionTime);
        } else {
          transitionTime = this.TRANSITION_DURTION *
              (1 - ((contentRect.top - parentRect.top) / parentRect.height));
          this.close(transitionTime);
        }
        self.dragging_ = false;
      },
      onDrag: nop,
      dragging_: false,
      bounds: {
        open: [
          function(contentRect, parentRect) {
            return contentRect.top <= parentRect.top +
                (2 * parentRect.height / 5);
          },
          function(contentRect, parentRect) {
            return contentRect.top <= parentRect.top +
            (3 * parentRect.height / 5);
          }
        ],
        expanded: [
          function(contentRect, parentRect) {

            return contentRect.top <= parentRect.top +
                (parentRect.height / 10);
          },
          function(contentRect, parentRect) {
            return contentRect.top <= parentRect.top +
            (2 * parentRect.height / 10);
          }
        ]
      }
    }
  },

  properties: [
    {
      type: 'ViewFactory',
      name: 'delegate',
      documentation: function() {/* The inner view to pop up.
        This should be created in the context of this popup,
        so that X.popup is available to the inner
        view to control the popup.</p>
        <p>The ViewContainerController interface includes methods to control
        your containing view, including .accept() and .reject()
        for standard dialogs. */},
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
      name: 'latch_'
    },
    {
      name: 'latchState_'
    },
    {
      name: 'width',
      help: 'If set, specifies the CSS width of the content container.'
    },
    {
      name: 'height',
      help: 'If set, specifies the CSS height of the content container.'
    },
    {
      type: 'Int',
      name: 'dragHandleHeight',
      help: function() {/* If set, specifies the CSS height of the handle at
          the top of the popup that can be used for dragging the popup. */},
      defaultValue: 0
    },
    {
      name: 'animationStrategy',
      help: 'A strategy that implements animateToHidden() and animateToOpen()',
      lazyFactory: function() { return this.FADE; },
      adapt: function(old, nu) {
        if ( old === nu ) return nu;
        if ( typeof nu === 'string' && this[nu.toUpperCase()] )
          nu = this[nu.toUpperCase()];
        if ( ! nu || ! nu.animateToHidden || ! nu.animateToOpen )
          return this.FADE;
        return nu;
      }
    },
    {
      type: 'Boolean',
      name: 'gestureTargetsInstalled_',
      help: 'Track whether gesture targets are installed to avoid duplication.',
      defaultValue: false
    }
  ],

  methods: {
    open: function(sourceElement) {
      this.latch();
      if ( this.state == 'closed' ) {
        this.delegateView = this.delegate({ data$: this.data$ }, this.Y);

        this.layoutMode = sourceElement ? 'relative' : 'fixed';

        // Clean up old copy, in case of rapid re-activation.
        if ( this.$ ) this.$.outerHTML = '';

        var parentElement = sourceElement || this.document.body;
        parentElement.insertAdjacentHTML('beforeend', this.toHTML());
        this.initializePosition();
        this.setTimeout(function() {  this.animateToOpen(); }.bind(this), 100);
        this.initHTML();
        this.state = 'opening';
      }
    },
    expandOrCollapse: function(opt_transitionTime) {
      if ( this.state === 'open' ) this.expand(opt_transitionTime);
      else if ( this.state === 'expanded' ) this.collapse(opt_transitionTime);
    },
    expand: function(opt_transitionTime) {
      this.latch();
      this.setTimeout(function() {
        this.animateToExpanded(opt_transitionTime);
      }.bind(this), 100);
      this.state = 'expanding';
    },
    collapse: function(opt_transitionTime) {
      this.latch();
      this.setTimeout(function() {
        this.animateToCollapsed(opt_transitionTime);
      }.bind(this), 100);
      this.state = 'collapsing';
    },
    initializePosition: function() {
      this.$content.style.zIndex = "1010";
      this.$content.style.opacity = this.$blocker.style.opacity = '0';
      if ( this.width ) this.$content.style.width = this.width;
      if ( this.height ) {
        this.$content.style.height = this.height;
      }
    },
    animateToOpen: function(opt_transitionTime) {
      this.animationStrategy.animateToOpen.call(this, opt_transitionTime);
      this.isHidden = false;
    },
    animateToExpanded: function(opt_transitionTime) {
      this.animationStrategy.animateToExpanded &&
          this.animationStrategy.animateToExpanded.call(
              this, opt_transitionTime);
    },
    animateToCollapsed: function(opt_transitionTime) {
      this.animationStrategy.animateToCollapsed &&
          this.animationStrategy.animateToCollapsed.call(
              this, opt_transitionTime);
    },
    animateToHidden: function(opt_transitionTime) {
      this.isHidden = true;
      this.animationStrategy.animateToHidden.call(this, opt_transitionTime);
    },
    close: function(opt_transitionTime) {
      this.latch();
      this.state = 'closing';

      this.animateToHidden(opt_transitionTime);
    },
    destroy: function(p) {
      if ( this.$ ) this.$.outerHTML = '';
      this.delegateView = null;
      this.state = 'closed';
      this.SUPER(p);
    },
    setTransition: function(e, prop, transition, value) {
      e.style.transition = transition ? prop + ' ' + transition : '';
      e.offsetLeft = e.offsetLeft;
      if ( value ) e.style[prop] = value;

      var listener = function(evt) {
        if ( evt.propertyName === prop ) {
          this.latch();
          e.removeEventListener('transitionend', listener);
        }
      }.bind(this);
      e.addEventListener('transitionend', listener);
    },
    setLatch: function(state, opt_f) {
      this.latch_ = opt_f || '';
      this.latchState_ = state;
    },
    latch: function() {
      if ( this.latch_ ) this.latch_();
      if ( this.latchState_ ) this.state = this.latchState_;
      this.latchState_ = this.latch_ = '';
    },
    initHTML: function() {
      this.SUPER();
      if ( this.gestureManager && ! this.gestureTargetsInstalled_ ) {
        this.gestureManager.install(this.GestureTarget.create({
          containerID: this.id,
          handler: this,
          gesture: 'drag'
        }));
        this.gestureTargetsInstalled_ = true;
      }
    }
  },

  listeners: [
    {
      name: 'dragStart',
      code: function(point) {
        this.animationStrategy.dragStart &&
            this.animationStrategy.dragStart.call(this, point);
      }
    },
    {
      name: 'dragEnd',
      code: function(point) {
        this.animationStrategy.dragEnd &&
            this.animationStrategy.dragEnd.call(this, point);
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*
      <% if ( this.delegateView ) { %>
        <div id="<%= this.id %>Blocker" class='popup-view-modal-blocker'></div>
        <% this.on('click', function() {
             if ( this.blockerMode === 'cancellable' ) {
               self.close();
               self.publish(self.CANCEL);
             }
           }, this.id + 'Blocker'); %>
        <div id="<%= this.id %>Content" class='md-popup-view-content <%= this.cardClass %>'>
          %%delegateView
        </div>
        <% this.setClass('center', function() {
             return this.layoutPosition === 'center';
           }, this.id);
           this.setClass('top', function() {
             return this.layoutPosition === 'top';
           }, this.id);
           this.setClass('bottom', function() {
             return this.layoutPosition === 'bottom';
           }, this.id);
           this.setClass('fixed', function() {
             return this.layoutMode === 'fixed';
           }, this.id);
           this.setClass('relative', function() {
             return this.layoutMode === 'relative';
           }, this.id);
         } %>
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
        margin-bottom: 5%;
        max-height: 90%;
      }
      .popup-view-container.top {
        align-items: flex-start;
        margin-top: 5%;
        max-height: 90%;
      }
    */}
  ]
});
