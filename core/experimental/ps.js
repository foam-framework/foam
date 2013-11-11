/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
var p = {};
var s = {};
var size = 0;
var saved = 0;

var qcount = 0;
var lcount = 0;

function incr(m, s) {
  if ( ! s.length ) return;
  var count = m[s] || 0;
  m[s] = count+10;
}

function cleanup(m) {
  for ( var key in m ) if ( m[key] == 1 ) delete m[key];
}
var k = 0;

dao.select({put:function(e) {
//  var lines = e.subject.split('\n');
  var lines = e.body.split('\n');
if ( k++ % 100 == 0 ) console.log(k);
  for ( var i = 0 ; i < lines.length ; i++ ) {
    var line = lines[i];
    size += line.length;
    lcount++;
    if ( size && Math.random() < 0.1 /* && ( line[0] == '>' || line[0] == 'F' || line[0] == 'h' || line[0] == 'Y' )*/ ) { qcount++;
    for ( var j = 0 ; j < line.length ; j++ ) {
      incr(p, line.substring(0,j));
      incr(s, line.substring(j));
    } }
  }
}})(function() {
  console.log('bytes:',size);

console.log('cleanup prefixes');
cleanup(p);
console.log('cleanup suffixes');
cleanup(s);

console.log('dedup prefixes');
for ( var key in p ) {
  var count = p[key];

  for ( var i = key.length-1 ; i > 1 ; i-- ) {
    var key2 = key.substring(0,i);
    var count2 = p[key2];

    if ( count2 == count ) {
//      console.log('Deleteing Prefix: ', key2, key);
      delete p[key2];
    } else break;
  }
}

console.log('dedup suffixes');
for ( var key in s ) {
  var count = s[key];

  for ( var i = key.length-1 ; i > 1 ; i-- ) {
    var key2 = key.substring(key.length,key.length-i);
    var count2 = s[key2];

    if ( count2 == count ) {
//      console.log('Deleteing Suffix: ', key2, key);
      delete s[key2];
    } else break;
  }
}

function display(m) {
  var a = [];
  for ( var key in m ) a.push([key,m[key]]);
  a.sort(function(o1,o2) { return o2[1]*o2[0].length - o1[1]*o1[0].length; });
  for ( var i = 0 ; i < a.length && i < 100 ; i++ ) console.log(i, a[i]);
}

console.log('Prefixes');
display(p);

console.log('Suffixes');
display(s);

});
