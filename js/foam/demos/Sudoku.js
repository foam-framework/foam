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
        for ( var a = 0 ; a < 3 ; a++ )
          for ( var b = 0 ; b < 3 ; b++ )
            for ( var c = 0 ; c < 3 ; c++ )
              for ( var d = 0 ; d < 3 ; d++ )
                cs[a][b][c][d] = this.Cell.create({value: cs[a][b][c][d]});
        return cs;
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.cells = [
        [[[0,0,0],[0,7,1],[0,0,5]], [[5,0,0],[0,6,9],[0,7,1]], [[0,7,1],[8,5,3],[4,2,0]]],
        [[[0,1,0],[0,0,2],[0,0,0]], [[7,8,0],[1,5,4],[0,9,2]], [[0,4,0],[3,6,0],[1,8,0]]],
        [[[0,6,4],[0,2,3],[0,5,0]], [[9,0,5],[0,1,0],[0,0,0]], [[7,0,0],[5,9,0],[0,0,0]]]
      ];
    },
    function toE(X) {
      X = X.sub({data: this});
      var e = X.E();
      for ( var a = 0 ; a < 3 ; a++ ) {
        var r1 = X.E('span');
        e.add(r1);
        for ( var b = 0 ; b < 3 ; b++ ) {
          var r2 = X.E('span');
          r1.add(r2);
          for ( var c = 0 ; c < 3 ; c++ ) {
            var r = X.E('div');
            r2.add(r);
            for ( var d = 0 ; d < 3 ; d++ ) {
              r.add(this.cells[a][b][c][d].toE(X.sub()));
            }
          }
        }
      }
      e.add(this.DO_SOLVE.toE(X));
      return e;
    },
    function get(a, b, c, d) {
      return this.cells[a][b][c][d].value;
    },
    function set(a, b, c, d, n) {
      for ( var x = 0 ; x < 3 ; x++ )
        for ( var y = 0 ; y < 3 ; y++ )
          if ( this.get(a, b, x, y) == n || this.get(a, x, c, y) == n || this.get(x, b, y, d) == n ) return false;
      this.cells[a][b][c][d].value = n;
      return true;
    },
    function solve(a, b, c, d) {
      if ( a == 3 ) return true;
      if ( b == 3 ) return this.solve(a+1, 0, 0, 0);
      if ( c == 3 ) return this.solve(a, b+1, 0, 0);
      if ( d == 3 ) return this.solve(a, b, c+1, 0);
      if ( this.get(a,b,c,d) ) return this.solve(a, b, c, d+1);
      for ( var n = 1 ; n <= 9 ; n++ )
        if ( this.set(a, b, c, d, n) && this.solve(a, b, c, d+1) ) return true;
      this.cells[a][b][c][d].value = 0;
      return false;
    }
  ],
  actions: [
    {
      name: 'doSolve',
      label: 'Solve',
      code: function() { this.solve(0,0,0,0); }
    }
  ]
});
