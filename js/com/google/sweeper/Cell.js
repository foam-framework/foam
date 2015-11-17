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
  extends: 'foam.ui.View',

  imports: [ 'board' ],

  constants: {
    COUNT_COLOURS: [ '', 'green', 'blue', 'orange', 'red', 'red', 'red', 'red' ],
  },

  properties: [
    'x', 'y', 'mineCount',
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
    },
    {
      name: 'className',
      defaultValue: 'sweeper-cell'
    }
  ],

  templates: [
    function CSS() {/*
      .sweeper-cell {
        border: 1px solid gray;
        display: table-cell;
        font-size: 18px;
        font-weight: bold;
        height: 26px;
        text-align: center;
        vertical-align: middle;
        width: 26px;
      }
      .sweeper-cell.covered {
        background: #ccc;
        box-shadow: -2px -2px 10px rgba(0,0,0,.25) inset, 2px 2px 10px white inset;        
      }
      .sweeper-cell.covered font { display: none; }
      .sweeper-cell.marked font { display: none; }
      .sweeper-cell .flag { display: none; }
      .sweeper-cell.marked .flag {
        display: block;
        color: #BD1616;
      }
      .sweeper-cell.marked { background-color: #ccc; }
    */}
  ],

  methods: {
    toInnerHTML: function() {
      this.mineCount = this.board.getMineCount(this);
      return '<span class="flag">&#x2691</span>' + (
        this.mined     ? '<font color="#E04D2B"><span class="material-icons-extended">chrome_product</span></font>' :
        this.mineCount ? '<font color="' + this.COUNT_COLOURS[this.mineCount] + '">' + this.mineCount + '</font>' : '');
    },
    initHTML: function() {
      this.setClass(
        'covered',
        function () {
          var covered = this.covered;
          var marked  = this.marked;
          return covered && ! marked; },
        this.id);
      this.setClass('marked', function () { return this.marked; }, this.id);
      this.$.addEventListener('click', this.sweep);
      this.$.addEventListener('contextmenu', this.mark, true);
      this.SUPER();
    }
  },

  listeners: [
    function mark(e) {
      this.marked = ! this.marked;
      e.preventDefault();
      e.stopPropagation();
      return false;
    },
    function sweep(e) {
      this.covered = false;
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  ]
});
