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
    {
      name: 'x'
    },
    {
      name: 'y'
    },
    {
      name: 'mineCount'
    },
    {
      model_: 'BooleanProperty',
      name: 'covered',
      defaultValue: true
    },
    {
      model_: 'BooleanProperty',
      name: 'marked',
      defaultValue: false
    },
    {
      model_: 'BooleanProperty',
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
      .sweeper-cell.covered font {
        display: none;
      }
      .sweeper-cell.marked font {
        display: none;
      }
      .sweeper-cell.marked {
        background-color: #ccc;
        background-image: url('js/com/google/sweeper/flag.png');
        background-repeat: no-repeat;
      }
    */}
  ],

  methods: {
    toInnerHTML: function() {
      this.mineCount = this.board.getMineCount(this);
      return this.mined ? '<font color="black"><img src="js/com/google/sweeper/mine.jpg"></font>' :
        this.mineCount ? '<font color="' + this.COUNT_COLOURS[this.mineCount] + '">' + this.mineCount + '</font>' : '';
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
    {
      name: 'mark',
      code: function(e) {
        this.marked = ! this.marked;
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    {
      name: 'sweep',
      code: function(e) {
        this.covered = false;
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
  ]
});
