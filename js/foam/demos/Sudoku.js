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
      var e = X.E();
      for ( var i = 0 ; i < 3 ; i++ ) {
        var r = X.E('div');
        e.add(r);
        for ( var j = 0 ; j < 3 ; j++ ) {
          r.add(this.cells[i][j].toE(X));
        }
      }
      return e;
    }
  ]
});