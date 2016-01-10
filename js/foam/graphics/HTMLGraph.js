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
  name: 'HTMLGraph',
  package: 'foam.graphics',
  extends: 'foam.ui.SimpleView',

  properties: [
    {
      type: 'Color',
      name: 'graphColor',
      defaultValue: 'green'
    },
    {
      type: 'Color',
      name: 'backgroundColor',
      defaultValue: 'transparent'
    },
    {
      type: 'Array',
      name:  'data',
      preSet: function(old, nu) {
        if ( old === nu ) return nu;
        if ( nu.length > this.width ) return nu.slice(-this.width);
        return nu;
      },
      lazyFactory: function() { return []; }
    },
    {
      type: 'Int',
      name: 'width',
      defaultValue: 40
    },
    {
      type: 'Int',
      name: 'height',
      defaultValue: 15
    },
    {
      type: 'Float',
      name: 'min',
      defaultValueFn: function() {
        if ( this.data.length === 0 ) return 0;
        var min = Number.INFINITY;
        for ( var i = 0; i < this.data.length; ++i ) {
          min = Math.min(min, this.data[i]);
        }
        return Number.isNaN(min) ? 0 : min;
      }
    },
    {
      type: 'Float',
      name: 'max',
      defaultValueFn: function() {
        if ( this.data.length === 0 ) return 100;
        var max = Number.NEGATIVE_INFINITY;
        for ( var i = 0; i < this.data.length; ++i ) {
          max = Math.max(max, this.data[i]);
        }
        return Number.isNaN(max) ? 100 : max;
      }
    }
  ],

  methods: [
    function addData(value, opt_maxNumValues) {
      var maxNumValues = opt_maxNumValues || this.width;

      if ( this.data.length === maxNumValues ) this.data.shift();
      this.data.push(value);
    }
  ],

  templates: [
    function toHTML() {/*
      <graph id="%%id">
        <% for ( var i = 0; i < this.data.length; ++i ) {
             var rowWidth = Math.round(10000 / this.data.length) / 100;
             var dataHeight = Math.min(100,
               Math.round(10000 * (this.data[i] - this.min) / this.max) / 100);
             var bgHeight = 100 - dataHeight; %>
          <graph-row style="width: {{rowWidth}}%">
            <graph-row-bg style="background: {{this.backgroundColor}}; flex-grow: {{bgHeight}}; -webkit-flex-grow: {{bgHeight}}"></graph-row-bg>
            <graph-row-data style="background: {{this.graphColor}}; flex-grow: {{dataHeight}}; -webkit-flex-grow: {{dataHeight}}"></graph-row-data>
          </graph-row>
        <% } %>
      </graph>
    */},
    function CSS() {/*
      graph {
        flex-grow: 1;
        display: flex;
        align-items: stretch;
        align-content: stretch;
      }
      graph-row {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        align-content: stretch;
      }
      graph-row-bg {
        display: block;
        flex-grow: 1;
      }
      graph-row-data {
        display: block;
        min-height: 1px;
      }
    */}
  ]
});
