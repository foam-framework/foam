/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

MementoMgr.BACK.iconUrl = 'images/back.png';
MementoMgr.FORTH.iconUrl = 'images/forth.png';
MementoMgr.BACK.label = '';
MementoMgr.FORTH.label = '';
MementoMgr.BACK.help = '';
MementoMgr.FORTH.help = '';

var BrowserMemento = FOAM({
  model_: 'Model',

  name: 'BrowserMemento',

  extendsModel: 'CompoundMemento',

  properties: [
    {
      name: 'rules',
      defaultValue: [
        [
          'q',
          ['q'],
          function(q) {
            // Replace short-names will fullnames that crbug will understand
            return (QueryParser.parseString(q) || TRUE).partialEval().toMQL();
          },
          function(q) { return q; }
        ],
        [
          'can',
          ['searchChoice'],
          function(c) { return c.choice[2]; },
          function(c) {
            for ( var i = 1 ; i < this.searchChoice.choices.length ; i++ )
              if ( this.searchChoice.choices[i][2] == c )
                return this.searchChoice.choices[i];
            return this.searchChoice.choices[0];
          }
        ],
        [
          'mode',
          ['view', 'mode'],
          function(mode) { return mode.toLowerCase(); },
          function(mode) { return mode.capitalize(); }
        ],
        [
          'colspec',
          'view view properties'.split(' '),
          function(properties) { return properties.join(' '); },
          function(colspec) { return colspen.join(' '); }
        ],
        [
          'sort',
          'view view sortOrder'.split(' '),
          function(sortOrder) { return sortOrder.toMQL(); },
          function(sort) {
            var ps = sort.split(' ');
            for ( var i = 0 ; i < ps.length ; i++ ) {
              var p = ps[i];
              if ( p.charAt('0') == '-' ) {
                ps[i] = DESC(this.model.getProperty(p.substring(1)));
              } else {
                ps[i] = this.model.getProperty(p);
              }
            }
            return ( ps.length == 1 ) ? ps[0] : CompoundComparator.apply(null, ps) ;
          }
        ],
        [
          'tile',
          'view view acc choice'.split(' '),
          function(choice) { return choice[1].toLowerCase(); },
          function(title) {debugger;}
        ],
        [
          'y',
          'view view row choice'.split(' '),
          function(choice) { return choice[1].toLowerCase(); },
          function(y) {debugger;}
        ],
        [
          'x',
          'view view col choice'.split(' '),
          function(choice) { return choice[1].toLowerCase(); },
          function(x) {debugger;}
        ]
      ]
    }
  ]
});