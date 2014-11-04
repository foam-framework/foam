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
  create: function(tagName, opt_attrs, opt_children) {
    return {
      __proto__: this,
      tag:      tagName,
      attrs:    opt_attrs || {},
      children: opt_children || []
    };
  },
  toString: function() { return this.toHTML(); },
  toHTML: function() {
    var out = '<' + this.tag;
    for ( key in this.attrs ) { out += ' ' + key + '="' + this.attrs[key] + '"'; }
    if ( this.children.length ) {
      out += '>';
      out += this.innerHTML();
      out += '</' + this.tag + '>';
    } else {
      out += '>';
    }
    return out;
  },
  innerHTML: function() {
    var out = '';
    for ( var i = 0 ; i < this.children.length ; i++ ) {
      var c = this.children[i];
      out += c.toHTML ? c.toHTML() : c.toString();
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

  START: sym('html'),

  html: repeat(alt(
    sym('text'),
    sym('endTag'),
    sym('startTag'))),

  startTag: seq(
      '<',
      sym('tagName'),
      sym('whitespace'),
      sym('attributes'),
      sym('whitespace'),
      optional('/'),
    '>'),

  endTag: (function() {
    var endTag_ = sym('endTag_');
    return function(ps) {
      return this.stack.length > 1 ? this.parse(endTag_, ps) : undefined;
    };
  })(),

  endTag_: seq1(1, '</', sym('tagName'), '>'),

  attributes: repeat(sym('attribute'), sym('whitespace')),

  label: str(plus(notChars(' =/\t\r\n<>\'"'))),

  tagName: sym('label'),

  text: str(plus(alt('<%', notChar('<')))),

  attribute: seq(sym('label'), '=', sym('value')),

  value: str(alt(
    plus(alt(range('a','z'), range('A', 'Z'), range('0', '9'))),
    seq1(1, '"', repeat(notChar('"')), '"')
  )),

  whitespace: repeat(alt(' ', '\t', '\r', '\n'))
}.addActions({
  START: function(xs) { return this.stack[0]; },
  attributes: function(xs) {
    var attrs = {};
    xs.forEach(function(attr) { attrs[attr[0]] = attr[2]; });
    return attrs;
  },
  startTag: function(xs) {
    var tag = xs[1];
    // < tagName ws attributes ws / >
    // 0 1       2  3          4  5 6
    var obj = Tag.create(tag, xs[3]);
    this.peek().children.push(obj);
    if ( xs[5] != '/' ) this.stack.push(obj);
    return obj;
  },
  text: function(xs) { this.peek().children.push(xs); },
  endTag: function(xs) {
    var tag = xs;
    var stack = this.stack;
    while ( true ) {
      var top = stack.pop();
      if ( top.tag == tag ) return;
      var peek = this.peek();
      peek.children = peek.children.concat(top.children);
      top.children = [];
    }
  }
});

/*
// TODO: move tests to UnitTests
function test(html) {
  console.log('\n\nparsing: ', html);
  var p = HTMLParser.create();
  var res = p.parseString(html);
  if ( res ) {
    console.log('Result: ', res.toString());
  } else {
    console.log('error');
  }
}

test('<ba>foo</ba>');
test('<p>');
test('foo');
test('foo bar');
test('foo</end>');
test('<b>foo</b></foam>');
test('<pA a="1">foo</pA>');
test('<pA a="1" b="2">foo<b>bold</b></pA>');
*/