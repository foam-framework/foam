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

/** Like XMLParser, but more forgiving of unmatched tags. **/
// TODO(kgr): have XMLParser use Tag also
var Tag = {
  create: function(tagName, opt_attrs) {
    return {
      __proto__: this,
      tag:      tagName,
      attrs:    opt_attrs || {},
      children: []
    };
  },
  toString: function() { return this.toHTML(); },
  toHTML: function() {
    var out = '<' + this.tag;
    for ( key in this.attrs ) { out += ' ' + key + '="' + this.attrs[key] + '"'; }
    if ( this.children.length ) {
      out += '>';
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var c = this.children[i];
        out += c.toHTML ? c.toHTML() : c.toString();
      }
      out += '</' + this.tag + '>';
    } else {
      out += '>';
    }
    return out;
  },
  toXML: function() {
    var out = '<' + this.tag;
    for ( key in this.attrs ) { out += ' ' + key + '="' + this.attrs[key] + '"'; }
    if ( this.children.length ) {
      out += '>';
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        out += this.children[i].toXML();
      }
      out += '</' + this.tag + '>';
    } else {
      out += '/>';
    }
    return out;
  }
};


var HTMLParser = {
  __proto__: grammar,

  create: function() {
    return {
      __proto__: this,
      stack: [ Tag.create('html') ]
    }
  },

  peek: function() { return this.stack[this.stack.length-1]; },

  START: repeat((function() {
    var html = sym('html');
    return function(ps) { return this.result ? undefined : this.parse(html, ps); };
  })()),

  html: alt(
    sym('text'),
    sym('startTag'),
    sym('endTag')),

  startTag: seq(
      '<',
      sym('tagName'),
      sym('whitespace'),
      sym('attributes'),
      sym('whitespace'),
      optional('/'),
      '>'),

  endTag: seq('</', sym('tagName'), '>'),

  attributes: repeat(sym('attribute'), sym('whitespace')),

  label: str(plus(notChars(' =/\t\r\n<>\'"'))),

  tagName: sym('label'),

  text: str(plus(alt('<%', notChar('<')))),

  attribute: seq(sym('label'), '=', sym('value')),

  value: str(alt(
    plus(alt(range('a','z'), range('A', 'Z'), range('0', '9'))),
    seq1(1, '"', repeat(notChar('"')), '"'),
    seq1(1, "'", repeat(notChar("'")), "'")
  )),

  whitespace: repeat(alt(' ', '\t', '\r', '\n'))
}.addActions({
  START: function(xs) {
    return this.result;
  },
  attributes: function(xs) {
    var attrs = {};
    xs.forEach(function(attr) { attrs[attr[0]] = attr[2]; });
    return attrs;
  },
  startTag: function(xs) {
    var tag = xs[1];
    console.log('startTag: ', tag);
    // < tagName ws attributes ws / >
    // 0 1       2  3          4  5 6
    var obj = Tag.create(tag, xs[3]);
    this.peek().children.push(obj);
    if ( xs[5] != '/' ) this.stack.push(obj);
    return obj;
  },
  text: function(xs) {
    if ( ! this.peek() ) return;
    this.peek().children.push(xs);
  },
  endTag: function(xs) {
    var tag = xs[1];
    console.log('endTag: ', tag);
    var stack = this.stack;
    while ( true ) {
      var top = stack.pop();
      if ( top.tag == tag ) return;
      var peek = this.peek();
      if ( ! peek ) {
        this.result = top;
        return;
      }
      peek.children = peek.children.concat(top.children);
      top.children = [];
    }
  }
});
