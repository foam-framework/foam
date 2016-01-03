/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  package: 'foam.demos',
  name: 'Sudoku',

  models: [
    {
      name: 'Cell',
      properties: [
        {
          name: 'value',
          displayWidth: 3
        }
      ],
      templates: [
        function toE() {/*#U2
          <span class="$" x:data={{this}}>
            <:value/>
          </span>
        */}
      ]
    }
  ],

  properties: [
    {
      name: 'cells',
      adapt: function(_, cs) {
        cs = cs.deepClone();
        for ( var i = 0 ; i < 3 ; i++ )
          for ( var j = 0 ; j < 3 ; j++ )
            cs[i][j] = this.Cell.create({value: cs[i][j]});
        return cs;
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.cells = [[1,2,3],[4,0,6],[0,0,0]];
    },
    function toE(X) {
      X = X.sub({data: this});
      var e = X.E();
      for ( var i = 0 ; i < 3 ; i++ ) {
        var r = X.E('div');
        e.add(r);
        for ( var j = 0 ; j < 3 ; j++ ) {
          r.add(this.cells[i][j].toE(X.sub()));
        }
      }
      e.add(this.DO_SOLVE.toE(X));
      return e;
    },
    function get(i, j) {
      return this.cells[i][j].value;
    },
    function set(i, j, n) {
      for ( var x = 0 ; x < 3 ; x++ )
        for ( var y = 0 ; y < 3 ; y++ )
          if ( this.get(x, y) == n ) return false;
      this.cells[i][j].value = n;
      return true;
    },
    function solve(i, j) {
      if ( i == 3 ) return true;
      if ( j == 3 ) return this.solve(i+1, 0); 
      if ( this.get(i,j) ) return this.solve(i, j+1);
      for ( var n = 1 ; n <= 9 ; n++ )
        if ( this.set(i,j, n) && this.solve(i, j+1) ) return true;
      this.cells[i][j].value = 0;
      return false;
    }
  ],
  actions: [
    {
      name: 'doSolve',
      label: 'Solve',
      code: function() { this.solve(0,0); }
    }
  ]
});
