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
            var cell = cells[row][col] = this.Cell.create({x: col, y: row});
            cell.covered$.addListener(this.cellUncovered);
          }
        }
        return cells;
      }
    }
  ],

  methods: [
    function forEachNeighbour(cell, f) {
      for ( var row = Math.max(0, cell.y-1) ; row < Math.min(this.height, cell.y+2) ; row++ )
        for ( var col = Math.max(0, cell.x-1) ; col < Math.min(this.width, cell.x+2) ; col++ )
          f(this.cells[row][col]);
    },
    function getMineCount(cell) {
      var count = 0;
      this.forEachNeighbour(cell, function(c) { if ( c.mined ) count++; });
      return count;
    }
  ],

  templates: [
    function CSS() {/*
      ^ {
        border: 1px solid gray;
        display: inline-block;
      }
    */},
    function initE() {/*#U2
      <div class="^">
        <div class="^row" repeat="row in 0..this.height-1">
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
      this.X.setTimeout(this.forEachNeighbour.bind(this, cell, function(c) { if ( ! c.mined ) c.covered = false; }), 32);
    }
  ]
});
