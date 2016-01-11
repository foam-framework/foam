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
  name: 'FlatButton',
  extends: 'foam.flow.Element',

  requires: [
    'foam.ui.Color',
    'foam.ui.Icon',
    'foam.ui.md.HaloView'
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'md-button flatbutton noselect',
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.className = this.className.split(' ').concat(
            this.extraClassName.split(' ')).join(' ');
      }
    },
    {
      name: 'extraClassName',
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.className = this.className.split(' ').concat(
            this.extraClassName.split(' ')).join(' ');
      }
    },
    {
      type: 'Boolean',
      name: 'raised',
      defaultValue: false
    },
    {
      model_: 'foam.ui.ColorProperty',
      name: 'color',
      help: 'The text and background color to use for the active state',
      defaultValueFn: function() {
        return this.displayMode_ == 'ICON_ONLY' ? 'currentColor' : '#02A8F3';
      }
    },
    {
      type: 'String',
      name: 'font',
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.style.font = nu;
      }
    },
    {
      type: 'Float',
      name: 'alpha',
      defaultValue: null,
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.style.opacity = nu === null ? '' : nu;
      }
    },
    {
      type: 'String',
      name: 'background',
      postSet: function(old, nu) {
        if ( old === nu || ! this.$ ) return;
        this.$.style.background = nu;
      }
    },
    {
      model_: 'foam.ui.ColorProperty',
      name: 'haloColor',
      postSet: function(old, nu) {
        if ( ! old ) Events.unfollow(this.currentColor_$, this.haloColor_$);
        if ( ! nu )  Events.follow(this.currentColor_$, this.haloColor_$);
        else         this.haloColor_ = nu;
      }
    },
    {
      name: 'action',
      postSet: function(_, nu) { this.bindData(); }
    },
    {
      name: 'data',
      postSet: function() { this.bindData(); }
    },
    {
      name: 'escapeHtml',
      defaultValue: true
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'displayMode',
      defaultValue: 'ICON_AND_LABEL',
      choices: [
        ['ICON_AND_LABEL', 'Icon and Label'],
        ['ICON_ONLY', 'Icon Only'],
        ['LABEL_ONLY', 'Label Only']
      ],
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'displayMode_',
      getter: function() {
        if ( ! ( this.iconUrl || this.ligature ) ) return 'LABEL_ONLY';
        return this.displayMode;
      },
    },
    {
      type: 'String',
      name: 'iconUrl',
    },
    {
      type: 'String',
      name: 'ligature',
    },
    {
      name: 'icon',
      lazyFactory: function() {
        return this.Icon.create({
          url$: this.iconUrl$,
          ligature$: this.ligature$,
          color$: this.currentColor_$
        }, this.Y);
      }
    },
    {
      name: 'halo',
      lazyFactory: function() {
        return this.HaloView.create({
          className: 'halo',
          recentering: false,
          pressedAlpha: 0.2,
          startAlpha: 0.2,
          finishAlpha: 0
        }, this.Y);
      }
    },
    {
      name: 'tooltip',
      defaultValueFn: function() { return this.action && this.action.help; }
    },
    {
      model_: 'foam.ui.ColorProperty',
      name: 'currentColor_',
      hidden: true,
      defaultValueFn: function() { return this.color; },
      preSet: function(old, nu) {
        if ( old === nu || ! nu || ! this.Color.isInstance(nu) ) return nu;
        // Move alpha value to this.alpha (controls opacity). Display color as
        // same rgba(...) with a=1.
        this.alpha = nu.alpha;
        nu.alpha = 1;
        return nu;
      },
    },
    {
      model_: 'foam.ui.ColorProperty',
      name: 'haloColor_',
      hidden: true
    },
    {
      type: 'Boolean',
      name: 'isHidden',
      defaultValue: false
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      if ( ! this.haloColor ) Events.follow(this.currentColor_$, this.haloColor_$);
      // TODO(markdittmer): Halos (really, CViews in general) could probably
      // share the same modelled notion of color. (jacksonic) But make sure
      // CSS like 'color: currentColor' still works!
      Events.map(this.haloColor_$, this.halo.color$, function(color) {
        if ( color == 'currentColor' && this.$ ) {
          var s = this.X.window.getComputedStyle(this.$);
          if ( s && s.color ) return s.color;
        }
        return color.toString();
      }.bind(this));
    },
    function initHTML() {
      this.SUPER();

      this.currentColor_$.addListener(function() {
        if ( this.$ ) this.$.style.color = this.currentColor_.toString();
      }.bind(this));
      this.$.style.color = this.currentColor_.toString();
      this.$.style.font = this.font;
      this.$.style.opacity = this.alpha;
      this.$.style.background = this.background;
      var temp = this.haloColor_;
      this.haloColor_ = 'black';
      this.haloColor_ = temp; // do the 'currentColor' check again
    },
    function bindData() {
      if ( ( ! this.action ) || ( ! this.data ) ) return;

      if ( ! this.iconUrl ) this.iconUrl = this.action.iconUrl;
      if ( ! this.ligature ) this.ligature = this.action.ligature;

      var self = this;

      if ( this.action.labelFn ) this.X.dynamicFn(
        function() {
          self.action.label = self.action.labelFn.call(self.data, self.action);
        },
        function() {
          if ( self.$ ) self.X.document.getElementById(self.id+'CONTENT').innerHTML = self.labelHTML();
        });

      // available enabled etc.
      this.X.dynamicFn(
        function() { self.action.isEnabled.call(self.data, self.action); },
        function() {
          if ( self.action.isEnabled.call(self.data, self.action) ) {
            self.currentColor_ = self.color;
          } else {
            self.currentColor_ = "rgba(0,0,0,0.65)";
          }
        }
      );

      this.X.dynamicFn(
        function() { self.action.isAvailable.call(self.data, self.action); },
        function() {
          self.isHidden = ! self.action.isAvailable.call(self.data, self.action);
        }
      );
    }
  ],

  templates: [
    function CSS() {/*
      flat-button {
        display: inline-flex;
        align-items: baseline;
        justify-content: center;
        overflow: hidden;
        position: relative;
        border-radius: 2px;
        cursor: pointer;
      }

      flat-button.md-style-trait-inline {
        padding: 8px 8px;
        margin: -4px -4px;
      }

      flat-button .halo {
        border-radius: inherit;
      }

      flat-button spacer {
        display: block;
        width: 12px;
      }

      flat-button.icon-only spacer, flat-button.label-only spacer {
        width: 0px;
      }

      flat-button.icon-only {
        border-radius: 50%;
        transition: transform 250ms ease, width 249ms ease, margin 249ms ease, padding 249ms ease;
        transition-delay: 249ms, 0ms, 0ms, 0ms;
        transform: unset;
        width: 40px;
        flex-shrink: 0;
      }

      flat-button.floatingActionButton {
        padding: 10px;
      }

      flat-button.md-button .md-button-label {
        color: inherit;
      }

      flat-button.hidden,
      flat-button.label-only .flat-button-icon-container,
      flat-button.icon-only .md-button-label {
        display: none;
      }

      flat-button.icon-only.hidden {
        display: inherit!important;
        transform: rotateZ(180deg) scaleY(0);
        transition-delay: 0ms, 250ms, 250ms, 250ms;
        width: 0;
        margin: 0;
        padding: 0;
      }

      flat-button:not(.label-only) .md-button-label {
        text-transform: none;
      }

      flat-button .halo {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
      }

      flat-button:not(.icon-only) .flat-button-icon-container {
         width: 24px;
         height: 0px;
         position: relative;
      }

      flat-button:not(.icon-only) .flat-button-icon {
        position: absolute;
        left: 0px;
        bottom: -7px;
      }

      flat-button.icon-only.floatingActionButton {
        width: 44px;
        height: 44px;
      }

    */},
    function toHTML() {/*
      <<%= self.tagName %> id="%%id" <%= this.cssClassAttr() %> >
        %%halo
        <div class="flat-button-icon-container">
          <div class="flat-button-icon">
            %%icon
          </div>
        </div>
        <spacer>
        </spacer>
        <span id="<%= this.id + "CONTENT" %>" class="md-button-label"><% this.labelHTML(out) %></span>
      </%%tagName>
      <% this.on('click', function(e) {
           e.preventDefault();
           e.stopPropagation();
           self.action.maybeCall(self.X, self.data);
         }, this.id);
         this.setClass(
             'icon-only',
             function() {
               this.iconUrl; this.ligature; this.displayMode;
               return this.displayMode_ === 'ICON_ONLY';
             }, this.id);
         this.setClass(
             'label-only',
             function() {
               this.iconUrl; this.ligature; this.displayMode;
               return this.displayMode_ === 'LABEL_ONLY';
             }, this.id);
        this.setClass('hidden', function() { return self.isHidden; }, this.id);
        this.setClass('raised', function() { return self.raised; }, this.id); %>
    */},
    function labelHTML() {/*
      <% if ( this.action ) { %>
        <% if ( this.escapeHtml ) { %>
          {{this.action.label}}
        <% } else { %>
          {{{this.action.label}}}
        <% } %>
      <% } else if ( this.inner ) { %>
         <%= this.inner() %>
      <% } else { %>label<% } %>
    */}
  ]
});
