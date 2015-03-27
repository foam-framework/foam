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
  name: 'CardTitle',
  package: 'foam.ui.md',
  extendsModel: 'foam.flow.Element',

  properties: [
    {
      model_: 'StringProperty',
      name: 'iconUrl'
    },
    {
      model_: 'StringProperty',
      name: 'backgroundColor',
      defaultValue: '#8cc356'
    },
    {
      model_: 'StringProperty',
      name: 'fontColor',
      defaultValue: '#ffffff'
    }
  ],

  methods: [
    {
      name: 'initHTML',
      code: function() {
        Events.dynamic(function() {
          this.backgroundColor;
          this.fontColor;
          if ( ! this.$ ) return;
          this.$.style['background-color'] = this.backgroundColor;
          this.$.style.color = this.fontColor;
        }.bind(this));
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*
      <% if ( this.iconUrl ) { %><span><img src="{{this.iconUrl}}"></span><% } %>
      <span>
      <% if ( this.data ) { %>
        {{this.data}}
      <% } else { %>
        <%= this.inner() %>
      <% } %>
      </span>
    */},
    function CSS() {/*
      card-title {
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
        color: #ffffff;
        display: flex;
        align-items: stretch;
      }

      card-title span {
        display: flex;
        align-items: center;
        padding: 0px 4px;
      }

      @media not print {

        card-title {
          font-size: 25px;
          margin: 0px;
          padding: 20px 10px;
          z-index: 20;
        }

      }

      @media print {

        card-title {
          font-size: 14pt;
          margin: 6pt;
        }

      }
    */}
  ]
});
