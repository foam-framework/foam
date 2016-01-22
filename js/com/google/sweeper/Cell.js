/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'com.google.sweeper',
  name: 'Cell',
  extends: 'foam.u2.Element',

  imports: [ 'board', 'dynamic' ],

  constants: {
    COLOURS: [ '', 'green', 'blue', 'orange', 'red', 'red', 'red', 'red' ],
  },

  properties: [
    'x',
    'y',
    {
      type: 'Int',
      name: 'mineCount',
      lazyFactory: function() { return this.board.getMineCount(this); }
    },
    {
      type: 'Boolean',
      name: 'covered',
      defaultValue: true
    },
    {
      type: 'Boolean',
      name: 'marked'
    },
    {
      type: 'Boolean',
      name: 'mined',
      factory: function() { return Math.random() < 0.18; }
    }
  ],

  methods: [
    function stateClass() {
      return this.dynamic(
        function(covered, marked) { return marked ? 'marked' : covered ? 'covered' : ''; },
        this.covered$, this.marked$);
    }
  ],

  templates: [
    function CSS() {/*
      body { -webkit-user-select: none; }
      ^ {
        border: 1px solid gray;
        display: table-cell;
        font-size: 18px;
        font-weight: bold;
        height: 26px;
        text-align: center;
        vertical-align: middle;
        width: 26px;
      }
      ^.covered {
        background: #ccc;
        box-shadow: -2px -2px 10px rgba(0,0,0,.25) inset, 2px 2px 10px white inset;
      }
      ^.marked ^flag {
        display: block;
        color: #BD1616;
      }
      ^.covered font { visibility: hidden; }
      ^.marked font { display: none; }
      ^flag { display: none; }
      ^.marked { background-color: #ccc; }
    */},
    function initE() {/*#U2
      <span class="^" class={{this.stateClass()}} onclick="sweep" oncontextmenu="mark">
        <span class="^flag">&#x2691;</span>
        <font if={{this.mined}}>&#x2699;</font>
        <font if={{!this.mined && this.mineCount}} color={{this.COLOURS[this.mineCount]}}>{{this.mineCount}}</font>
      </span>
    */}
  ],

  listeners: [
    function mark(e) { this.marked = ! this.marked; e.preventDefault(); },
    function sweep(e) { this.covered = false; }
  ]
});
