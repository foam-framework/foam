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
  extends: 'foam.u2.Element',

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
    }
  ],

  methods: {
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
      $ {
        border: 1px solid gray;
        display: inline-block;
        margin: 24px;
      }
    */},
    function initE() {/*#U2
      <div>
      <div class="$-row" repeat="row in 0..this.height-1">
        (( for ( var col = 0 ; col < this.width ; col++ ) { ))
          {{this.cells[row][col]}}
        (( } ))
      </div>
      </div>
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
