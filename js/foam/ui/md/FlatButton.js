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
        margin: 0px 0px;
        display: inline-flex;
        align-items: baseline;
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

      .flat-button-icon-container {
        padding-right: 12px;
        width: 36px;
        height: 0px;
      }
      .flat-button-icon {
        position: absolute;
        left: 16px;
        top: 12px;
      }

      .hidden {
        display: none;
      }

      .halo {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
      }
    */},
    function toHTML() {/*
      <<%= self.tagName %> id="%%id" <%= this.cssClassAttr() %> >
        %%halo
        <% if ( this.iconUrl || this.ligature ) { %>
          <div class="flat-button-icon-container">
            <div class="flat-button-icon">
              %%icon
            </div>
          </div>
        <% } %>
        <span id="<%= this.id + "CONTENT" %>"><% this.labelHTML(out) %></span>
      </%%tagName>
      <% this.on('click', function(e) {
           e.preventDefault();
           e.stopPropagation();
           self.action.maybeCall(self.X, self.data);
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
