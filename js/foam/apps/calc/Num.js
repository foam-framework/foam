/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  package: 'foam.apps.calc',
  name: 'Num',
  documentation: 'Make a 0-9 Number Action.',
  extends: 'Action',
  properties: [
    'n',
    { name: 'name', defaultValueFn: function() { return this.n.toString(); } },
    { name: 'keyboardShortcuts', factory: null, defaultValueFn: function() { return [ this.n + '' ]; } },
    [ 'code', function(_, action) {
      var n = action.n;
      if ( ! this.editable ) {
        this.push(n);
        this.editable = true;
      } else {
        if ( this.a2 == '0' && ! n ) return;
        if ( this.a2.length >= 18 ) return;
        this.a2 = this.a2 == '0' ? n : this.a2.toString() + n;
      }
    }]
  ]
});
