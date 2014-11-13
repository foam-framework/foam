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

/**
 * A sub-set of the DOM Element interface that we use for FOAM tag parsing.
 * This lets us transparently build FOAM objects and views from either real DOM
 * or from the output of FOAM's HTML parser.
 **/
MODEL({
  package: 'foam.html',
  name: 'Element',

  constants: {
    OPTIONAL_CLOSE_TAGS: {
      HTML: true,
      HEAD: true,
      BODY: true,
      P: true,
      DT: true,
      DD: true,
      LI: true,
      OPTION: true,
      THEAD: true,
      TH: true,
      TBODY: true,
      TR: true,
      TD: true,
      TFOOT: true,
      COLGROUP: true,
    },
    ILLEGAL_CLOSE_TAGS: {
      IMG: true,
      INPUT: true,
      BR: true,
      HR: true,
      FRAME: true,
      AREA: true,
      BASE: true,
      BASEFONT: true,
      COL: true,
      ISINDEX: true,
      LINK: true,
      META: true,
      PARAM: true
    }
  },

  properties: [
    {
      name: 'id'
    },
    {
      name: 'nodeName',
      preSet: function(_, v) {
        return v.toLowerCase();
      }
    },
    {
      name: 'attributes',
      factory: function() { return {}; }
    },
    {
      name: 'childNodes',
      factory: function() { return []; }
    },
    {
      name: 'children',
      getter: function() {
        return this.childNodes.filter(function(c) { return this.model_.isInstance(c); });
      }
    },
    {
      name: 'outerHTML',
      getter: function() {
        var out = '<' + this.nodeName;
        if ( this.id ) out += ' id="' + this.id + '"';
        for ( key in this.attributes ) {
          out += ' ' + key + '="' + this.attributes[key] + '"';
        }
        if ( ! this.ILLEGAL_CLOSE_TAGS[this.nodeName] &&
             ( this.OPTIONAL_CLOSE_TAGS[this.nodeName] && this.childNodes.length ) ) {
          out += '>';
          out += this.innerHTML;
          out += '</' + this.nodeName;
        }
        out += '>';
        return out;
      }
    },
    {
      name: 'innerHTML',
      getter: function() {
        var out = '';
        for ( var i = 0 ; i < this.childNodes.length ; i++ ) {
          var c = this.childNodes[i];
          out += c.toHTML ? c.toHTML() : c.toString();
        }
        return out;
      }
    }
  ],

  methods: {
    getAttribute: function(name) { return this.attributes[name]; },
    appendChild: function(c) { this.childNodes.push(c); },
    toHTML: function() { return this.outerHTML; }
  }
});

var HTMLParser = {
  __proto__: grammar,

  create: function() {
    return {
      __proto__: this,
      stack: [ X.foam.html.Element.create({nodeName: 'html'}) ]
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
    var obj = X.foam.html.Element.create({nameName: tag, attributes: xs[3]});
    this.peek().appendChild(obj);
    if ( xs[5] != '/' ) this.stack.push(obj);
    return obj;
  },
  text: function(xs) { this.peek().appendChild(xs); },
  endTag: function(xs) {
    var tag = xs;
    var stack = this.stack;
    while ( true ) {
      var top = stack.pop();
      if ( top.tag == tag ) return;
      var peek = this.peek();
      peek.childNodes = peek.childNodes.concat(top.childNodes);
      top.childNodex = [];
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

TemplateParser.foamTag = FOAMTagParser.create().export('START');