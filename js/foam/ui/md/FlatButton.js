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
  name: 'FlatButton',
  package: 'foam.ui.md',
  extendsModel: 'foam.flow.Element',

  requires: [
    'foam.input.touch.TouchManager',
    'foam.input.touch.GestureManager',

    'foam.ui.md.HaloView'
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'flatbutton'
    },
    {
      name: 'action',
      postSet: function() {
        this.bindIsAvailable();
      }
    },
    {
      name: 'data',
      postSet: function() {
        this.bindIsAvailable();
      }
    },
    {
      name: 'halo',

      documentation: function() {/*
        onRadio/offRadio's 'pointer-events: none' is critical for halo touches
      */},
      factory: function() {
        return this.HaloView.create({
          className: 'halo',
          recentering: false,
          color$: this.currentColor_$,
          pressedAlpha: 0.2,
          startAlpha: 0.2,
          finishAlpha: 0
        });
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
      name: 'isHidden',
     // model_: 'BooleanProperty',
      defaultValue: false
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER.apply(this, arguments);
        if ( ! this.X.touchManager ) {
          this.X.touchManager = this.TouchManager.create();
        }
        if ( ! this.X.gestureManager ) {
          this.X.gestureManager = this.GestureManager.create();
        }
      }
    },
    {
      name: 'initHTML',
      code: function() {
        Events.dynamic(function() {
          this.currentColor_;
          if ( ! this.$ ) return;
          this.$.style.color = this.currentColor_;
        }.bind(this));
      }
    },
    {
      name: 'bindIsAvailable',
      code: function() {
        if ( ! this.action || ! this.data ) return;
// available enabled etc.
        var self = this;
        Events.dynamic(
          function() { self.action.isEnabled.call(self.data, self.action); },
          function() {
            if ( self.action.isEnabled.call(self.data, self.action) ) {
              self.currentColor_ = self.color;
            } else {
              self.currentColor_ = "#5a5a5a";
            }
          }
        );
        Events.dynamic(
          function() { self.action.isAvailable.call(self.data, self.action); },
          function() {
            self.isHidden = ! self.action.isAvailable.call(self.data, self.action);
          }
        );
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*
        <%= this.halo %>
        <span>
        <% if ( this.data ) { %>
          {{this.data}}
        <% } else if ( this.inner ) { %>
          <%= this.inner() %>
        <% } else { %>label<% } %>
        </span>
<%
        this.on('click', function() {
            this.action.callIfEnabled(this.X, this.data);
        }.bind(this), this.id);
        this.setClass('weee', function() { console.log(this.isHidden, this); return !!this.isHidden; }.bind(this), this.id);
%>
    */},
    function CSS() {/*
      flat-button {
        padding: 10px 20px;
        text-transform: uppercase;
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

      .halo  {
        position: absolute;
        left: 0;
        top: 0;
      }


    */}
  ]
});
