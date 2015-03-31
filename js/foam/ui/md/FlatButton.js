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
      name: 'halo',
  
      documentation: function() {/*
        onRadio/offRadio's 'pointer-events: none' is critical for halo touches
      */},
      factory: function() {
        return this.HaloView.create({ className: 'halo', recentering: false });
      }
    },
    {
      model_: 'StringProperty',
      name: 'fontColor',
      defaultValue: '#85d3f7'
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
      name: 'construct',
      code: function() {
        if ( this.halo ) this.addChild(this.halo);
      }
    },
    {
      name: 'initHTML',
      code: function() {
        Events.dynamic(function() {
          this.fontColor;
          if ( ! this.$ ) return;
          this.$.style.color = this.fontColor;
        }.bind(this));
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
      
      .halo  {
        position: absolute;
        left: 0;
        top: 0;
      }
      
      
    */}
  ]
});
