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
  name: 'Board',
  extends: 'foam.ui.View',

  requires: [ 'com.google.sweeper.Cell' ],
  exports: [ 'as board' ],

  properties: [
    [ 'width', 14 ],
    [ 'height', 14 ],
    {
      name: 'cells',
      lazyFactory: function() {
        var cells = [];
        for ( var row = 0 ; row < this.height ; row++ ) {
          cells[row] = [];
          for ( var col = 0 ; col < this.width ; col++ ) {
            var cell = this.Cell.create({x: col, y: row});
            cells[row][col] = cell;
            cell.covered$.addListener(this.cellUncovered);
          }
        }
        return cells;
      }
    },
    [ 'className', 'sweeper-board' ]
  ],

  methods: {
    toInnerHTML: function() {
      var out = '';
      for ( var row = 0 ; row < this.height ; row++ ) {
        out += '<div class="board-row">';
        for ( var col = 0 ; col < this.width ; col++ ) {
          var cell = this.cells[row][col];
          out += cell.toHTML();
          this.addChild(cell);
        }
        out += '</div>';
      }
      return out;
    },

    getMineCount: function(cell) {
      var c = 0;
      for ( var row = Math.max(0, cell.y-1) ; row < Math.min(this.height, cell.y+2) ; row++ ) {
        for ( var col = Math.max(0, cell.x-1) ; col < Math.min(this.width, cell.x+2) ; col++ ) {
          if ( this.cells[row][col].mined ) c++;
        }
      }
      return c;
    }
  },

  templates: [
    function CSS() {/*
      .sweeper-board {
        border: 1px solid gray;
        display: inline-block;
        margin: 24px;
      }
   */}
  ],

  listeners: [
    function cellUncovered(cell) {
      if ( cell.mineCount ) return;
      this.X.setTimeout(function() {
        for ( var x = -1 ; x <= 1 ; x++ ) {
          for ( var y = -1 ; y <= 1 ; y++ ) {
            try {
              var c = this.cells[cell.y+y][cell.x+x];
              if ( ! c.mined ) c.covered = false;
            } catch(x) {}
          }
        }}.bind(this), 32);
    }
  ]
});
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
  name: 'Game',
  extends: 'foam.ui.View',

  requires: [ 'com.google.sweeper.Board' ],

  properties: [
    {
      type: 'Int',
      name: 'time'
    },
    {
      name: 'board',
      factory: function() { return this.Board.create(); }
    }
  ],

  methods: {
    init: function() { this.SUPER(); this.tick(); }
  },

  listeners: [
    {
      name: 'tick',
      isMerged: 1000,
      code: function() { this.time++; this.tick(); }
    }
  ],

  templates: [
    function CSS() {/*
      body { -webkit-user-select: none; }
      span[name="time"] { margin-left: 24px; }
    */},
    function toHTML() {/*
      $$time{mode: 'read-only'}
      <br>
      %%board
    */}
  ]
});
