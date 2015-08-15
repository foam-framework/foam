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
  extendsModel: 'foam.flow.Element',

  requires: [
    'foam.ui.Icon',
    'foam.ui.md.HaloView'
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'flatbutton'
    },
    {
      name: 'action',
      postSet: function() { this.bindData(); }
    },
    {
      name: 'data',
      postSet: function() { this.bindData(); }
    },
    {
      name: 'escapeHtml',
      defaultValue: true,
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'displayMode',
      defaultValue: 'ICON_AND_LABEL',
      choices: [
        ['ICON_AND_LABEL', 'Icon and Label'],
        ['ICON_ONLY', 'Icon Only'],
        ['LABEL_ONLY', 'Label Only']
      ]
    },
    {
      name: 'iconUrl',
      defaultValueFn: function() {
        return this.action ? this.action.iconUrl : '';
      }
    },
    {
      name: 'ligature',
      defaultValueFn: function() {
        return this.action ? this.action.ligature : '';
      }
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
          color$: this.currentColor_$,
          pressedAlpha: 0.2,
          startAlpha: 0.2,
          finishAlpha: 0
        }, this.Y);
      }
    },
    {
      model_: 'StringProperty',
      name: 'currentColor_',
      hidden: true,
      defaultValueFn: function() { return this.color; }
    },
    {
      name: 'color',
      help: 'The text and background color to use for the active state',
      defaultValue: '#02A8F3'
    },
    {
      model_: 'BooleanProperty',
      name: 'isHidden',
      defaultValue: false
    }
  ],

  methods: [
    function initHTML() {
      var self = this;
      this.SUPER();

      this.currentColor_$.addListener(function() {
        if ( self.$ ) self.$.style.color = self.currentColor_;
      });
      if ( self.$ ) self.$.style.color = this.currentColor_;
    },
    function bindData() {
      if ( ! this.action || ! this.data ) return;

      var self = this;

      if ( this.action.labelFn ) this.X.dynamic(
        function() {
          self.action.label = self.action.labelFn.call(self.data, self.action);
        },
        function() {
          if ( self.$ ) self.X.document.getElementById(self.id+'CONTENT').innerHTML = self.labelHTML();
        });

      // available enabled etc.
      this.X.dynamic(
        function() { self.action.isEnabled.call(self.data, self.action); },
        function() {
          if ( self.action.isEnabled.call(self.data, self.action) ) {
            self.currentColor_ = self.color;
          } else {
            self.currentColor_ = "#5a5a5a";
          }
        }
      );

      this.X.dynamic(
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
        padding: 16px 16px;
        margin: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        border-radius: 2px;
        cursor: pointer;
      }

      flat-button.md-style-trait-inline {
        padding: 16px 16px;
        margin: -16px -16px;
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
      }

      flat-button.hidden,
      flat-button.label-only .flat-button-icon-container,
      flat-button.icon-only .flat-button-label-container {
        display: none;
      }

      flat-button .halo {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
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
        <span id="<%= this.id + "CONTENT" %>" class="flat-button-label-container"><% this.labelHTML(out) %></span>
      </%%tagName>
      <% this.on('click', function(e) {
           e.preventDefault();
           e.stopPropagation();
           self.action.maybeCall(self.X, self.data);
         }, this.id);
         this.setClass(
             'icon-only',
             function() {
               return this.displayMode === 'ICON_ONLY';
             }, this.id);
         this.setClass(
             'label-only',
             function() {
               return this.displayMode === 'LABEL_ONLY' ||
                   ! ( this.iconUrl || this.ligature );
             }, this.id);
        this.setClass('hidden', function() { return self.isHidden; }, this.id); %>
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
