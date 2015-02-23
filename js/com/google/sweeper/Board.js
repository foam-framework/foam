CLASS({
  package: 'com.google.sweeper',
  name: 'Board',

  extendsModel: 'View',

  requires: [ 'com.google.sweeper.Cell' ],
  exports: [ 'as board' ],

  properties: [
    {
      name: 'width',
      defaultValue: 14
    },
    {
      name: 'height',
      defaultValue: 14
    },
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
    toHTML: function() {
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
        for ( var col = Math.max(0, cell.x-1)  ; col < Math.min(this.width, cell.x+2) ; col++ ) {
          if ( this.cells[row][col].mined ) c++;
        }
      }
      return c;
    }
  },

  listeners: [
    {
      name: 'cellUncovered',
      code: function(cell) {
        if ( cell.mineCount ) return;
        var d = [ [ 1, 0 ], [ -1, 0 ], [ 0, 1 ], [ 0, -1 ] ];
        for ( var i = 0 ; i < d.length ; i++ ) {
          try {
            var c = this.cells[cell.y+d[i][0]][cell.x+d[i][1]];
            if ( ! c.mined ) c.covered = false;
          } catch(x) {}
        }
      }
    }
  ]

});