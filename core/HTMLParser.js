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
CLASS({
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
      name: 'nodeName'/*,
      preSet: function(_, v) {
        return v.toLowerCase();
      }*/
    },
    {
      name: 'attributeMap_',
      transient: true,
      factory: function() { return {}; }
    },
    {
      name: 'attributes',
      factory: function() { return []; },
      postSet: function(_, attrs) {
        for ( var i = 0 ; i < attrs.length ; i++ )
          this.attributeMap_[attrs[i].name] = attrs[i];
      }
    },
    {
      name: 'childNodes',
      factory: function() { return []; }
    },
    {
      name: 'children',
      transient: true,
      getter: function() {
        return this.childNodes.filter(function(c) { return typeof c !== 'string'; });
      }
    },
    {
      name: 'outerHTML',
      transient: true,
      getter: function() {
        var out = '<' + this.nodeName;
        if ( this.id ) out += ' id="' + this.id + '"';
        for ( key in this.attributeMap_ ) {
          var value = this.attributeMap_[key].value;

          out += value == undefined ?
            ' ' + key :
            ' ' + key + '="' + this.attributeMap_[key].value + '"';
        }
        if ( ! this.ILLEGAL_CLOSE_TAGS[this.nodeName] &&
             ( ! this.OPTIONAL_CLOSE_TAGS[this.nodeName] || this.childNodes.length ) ) {
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
      transient: true,
      getter: function() {
        var out = '';
        for ( var i = 0 ; i < this.childNodes.length ; i++ )
          out += this.childNodes[i].toString();
        return out;
      }
    }
  ],

  methods: {
    setAttribute: function(name, value) {
      var attr = this.getAttributeNode(name);

      if ( attr ) {
        attr.value = value;
      } else {
        attr = {name: name, value: value};
        this.attributes.push(attr);
        this.attributeMap_[name] = attr;
      }
    },
    getAttributeNode: function(name) { return this.attributeMap_[name]; },
    getAttribute: function(name) {
      var attr = this.getAttributeNode(name);
      return attr && attr.value;
    },
    appendChild: function(c) { this.childNodes.push(c); },
    removeChild: function(c) {
      for ( var i = 0; i < this.childNodes.length; ++i ) {
        if ( this.childNodes[i] === c ) {
          this.childNodes.splice(i, 1);
          break;
        }
      }
    },
    toString: function() { return this.outerHTML; }
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

  // Use simpleAlt() because endTag() doesn't always look ahead and will
  // break the regular alt().
  html: repeat0(sym('htmlPart')),

  htmlPart: simpleAlt(
    sym('cdata'),
    sym('comment'),
    sym('text'),
    sym('endTag'),
    sym('startTag')),

  tag: seq(
    sym('startTag'),
    repeat(seq1(1, sym('matchingHTML'), sym('htmlPart')))),

  matchingHTML: function(ps) {
    return this.stack.length > 1 ? ps : null;
  },

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

  cdata: seq1(1, '<![CDATA[', str(repeat(not(']]>', anyChar))), ']]>'),

  comment: seq('<!--', repeat0(not('-->', anyChar)), '-->'),

  attributes: repeat(sym('attribute'), sym('whitespace')),

  label: str(plus(notChars(' %=/\t\r\n<>\'"'))),

  tagName: sym('label'),

  text: str(plus(alt('<%', notChar('<')))),

  attribute: seq(sym('label'), optional(seq1(1, '=', sym('value')))),

  value: str(alt(
    plus(alt(range('a','z'), range('A', 'Z'), range('0', '9'))),
    seq1(1, '"', repeat(notChar('"')), '"')
  )),

  whitespace: repeat0(alt(' ', '\t', '\r', '\n'))
}.addActions({
  START: function(xs) {
    // TODO(kgr): I think that this might be a bug if we get a failed compile then
    // we might not reset state properly.
    var ret = this.stack[0];
    this.stack = [ X.foam.html.Element.create({nodeName: 'html'}) ];
    return ret;
  },
  tag: function(xs) {
    var ret = this.stack[0];
    this.stack = [ X.foam.html.Element.create({nodeName: 'html'}) ];
    return ret.childNodes[0];
  },
  attribute: function(xs) { return { name: xs[0], value: xs[1] }; },
  cdata: function(xs) { this.peek() && this.peek().appendChild(xs); },
  text: function(xs) { this.peek() && this.peek().appendChild(xs); },
  startTag: function(xs) {
    var tag = xs[1];
    // < tagName ws attributes ws / >
    // 0 1       2  3          4  5 6
    var obj = X.foam.html.Element.create({nodeName: tag, attributes: xs[3]});
    this.peek() && this.peek().appendChild(obj);
    if ( xs[5] != '/' ) this.stack.push(obj);
    return obj;
  },
  endTag: function(tag) {
    var stack = this.stack;

    while ( stack.length > 1 ) {
      if ( this.peek().nodeName === tag ) {
        stack.pop();
        return;
      }
      var top = stack.pop();
      this.peek().childNodes = this.peek().childNodes.concat(top.childNodes);
      top.childNodes = [];
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

(function() {
  var registry = { };

  X.registerElement = function(name, model) {
//    console.log('registerElement: ', name);
    registry[name] = model;

    TemplateParser.foamTag_ = (function() {
      var start = seq(
        '<',
        simpleAlt.apply(null,
          Object.keys(registry).
            sort(function(o1, o2) { return o2.compareTo(o1); }).
            map(function(k) { return literal_ic(k); })),
        alt('/', ' ', '>'));

      var html = HTMLParser.create().export('tag');

      return function(ps) {
        var res = this.parse(start, ps) && this.parse(html, ps);
        if ( ! res ) return null;
        var elem  = res.value;
        var model = registry[elem.nodeName];
        if ( model ) elem.setAttribute('model', model);
        return res.setValue(elem);
      };
    })();
    invalidateParsers();
  };

  X.elementModel = function(name) {
    return registry[name];
  };
})();

X.registerElement('foam', null);
