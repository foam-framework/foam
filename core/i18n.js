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

var LANGUAGE = "en";

if ( navigator && navigator.language ) LANGUAGE = navigator.language;

(function() {
  var m = /[?&]hl=([^&]*)/.exec(window.location.search);
  if ( m ) { 
    LANGUAGE = m[1];
  }

  var a = LANGUAGE.split('-');
  LANGUAGE = [];
  var ls = [];
  for ( var i = a.length-1 ; i >= 0 ; i-- ) {
    LANGUAGE.push(a.slice(0, i+1).join('-'));
  }
  if ( LANGUAGE[LANGUAGE.length-1] !== 'en' )
    LANGUAGE.push('en');
})();

/*
console.log('Navigator.language: ', navigator.language);
console.log('Location: ', window.location.search);
console.log('LANGUAGE: ', LANGUAGE);
*/

function lm(m) {
  for ( var i = 0 ; i < LANGUAGE.length ; i++ )
    if ( m.hasOwnProperty(LANGUAGE[i]) )
      return m[LANGUAGE[i]];

  console.log('No language match for: ', m);
}
