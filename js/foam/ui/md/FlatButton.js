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
    'foam.ui.ImageView',
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
      },
      view: 'foam.ui.ImageView'
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

      this.setClass('hidden', function() { return self.isHidden; }, this.id);
    },
    function bindData() {
      if ( ! this.action || ! this.data ) return;

      var self = this;

      if ( this.action.labelFn ) this.X.dynamic(
        function() {
          self.action.label = self.action.labelFn.call(self.data, self.action);
        },
        function() {
          if ( self.$ ) self.$.querySelector('span').innerHTML = self.labelHTML();
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
        padding: 10px 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        border-radius: 2px;
        cursor: pointer;
      }

      .hidden {
        display: none;
      }

      .halo {
        position: absolute;
        left: 0;
        top: 0;
      }
    */},
    function toHTML() {/*
      <<%= self.tagName %> id="%%id" <%= this.cssClassAttr() %> >
        %%halo
        <% if ( this.iconUrl ) { %>$$iconUrl<% } %>
        <span><% this.labelHTML(out) %></span>
      </%%tagName>
      <% this.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        self.action.maybeCall(self.X, self.data);
      }, this.id); %>
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
