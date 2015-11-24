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
  package: 'foam.u2',
  name: 'ElementParser',

  onLoad: function() {
    this.parser__ = {
      __proto__: grammar,

      create: function() { return { __proto__: this }.reset(); },

      // TODO: don't strip whitespace for <pre>
      //this.out(".a('", t.replace(/\s+/g, ' '), "')");

      reset: function() {
        this.stack  = [ { children: [] } ];
        return this;
      },

      peek: function() { return this.stack[this.stack.length-1]; },

      finishTag: function() {
        var e = this.stack.pop();
        var p = this.peek();
        if ( e.ifexpr ) this.addCode('if(' + e.ifexpr + '){');
        p.children.push(e);
        if ( e.ifexpr ) this.addCode('}');
      },

      addCode: function(c) {
        this.peek().children.push({code: c.trim()});
      },

      START: sym('html'),

      html: repeat0(sym('htmlPart')),

      // Use simpleAlt() because endTag() doesn't always look ahead and will
      // break the regular alt().
      htmlPart: simpleAlt(
        plus(alt(' ', '\t', '\r', '\n')),
        sym('code'),
        sym('child'),
        sym('comment'),
        sym('text'),
        sym('endTag'),
        sym('startTag')),

      code: seq1(1, '((', str(repeat(not('))', anyChar))), '))'),

      child: sym('braces'),

      braces: seq1(1, '{{', str(repeat(not('}}', anyChar))), '}}'),

      startTag: seq(
        '<',
        sym('startTagName'),
        sym('whitespace'),
        repeat(sym('tagPart'), sym('whitespace')),
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

      tagPart: alt(
        sym('id'),
        sym('as'),
        sym('class'),
        sym('style'),
        sym('on'),
        sym('if'),
        sym('xattribute'),
        sym('attribute')
      ),

      on: seq('on', sym('topic'), '=', sym('listener')),

      topic: sym('label'),

      listener: alt(
        sym('namedListener')/*,
        sym('codeListener')*/),

      namedListener: seq1(1, '"', sym('label'), '"'),
      codeListener:  seq1(1, '{', sym('label'), '}'),

      comment: seq('<!--', repeat0(not('-->', anyChar)), '-->'),

      label: str(plus(notChars(' %=/\t\r\n<>\'"{}()'))),

      tagName: sym('label'),

      startTagName: sym('tagName'),

      id: seq1(1, 'id=', sym('valueOrLiteral')),

      as: seq1(1, 'as="', sym('varName'), '"'),

      varName: str(seq(
        alt(range('a','z'), range('A','Z'), '$', '_'),
        str(repeat(alt(range('a','z'), range('A', 'Z'), '$', '_', range('0', '9')))))),

      text: str(plus(not(alt('<', '{{'), anyChar))),

      if: seq1(1, 'if=', sym('ifExpr')),

      ifExpr: alt(sym('braces'), sym('value')),

      attribute: seq(sym('label'), optional(seq1(1, '=', sym('valueOrLiteral')))),

      xattribute: seq('x:', sym('label'), optional(seq1(1, '=', sym('valueOrLiteral')))),

      valueOrLiteral: alt(sym('braces'), sym('value')),

      class: seq1(1, 'class=', alt(sym('classList'), sym('classValue'))),

        classList: seq1(1, '"', repeat(sym('className'), ' '), '"'),

          className: str(seq(
            alt('$', range('a','z'), range('A','Z')),
            str(repeat(alt(range('a','z'), range('A', 'Z'), '$', '-', range('0', '9')))))),

        classValue: sym('braces'),

      style: seq1(2, 'style="', sym('whitespace'), sym('styleMap'), optional(sym('styleDelim')), sym('whitespace'), '"'),

      styleMap: repeat(sym('stylePair'), sym('styleDelim'), 1),

      styleDelim: seq(sym('whitespace'), ';', sym('whitespace')),

      stylePair: seq(sym('styleKey'), sym('whitespace'), ':', sym('whitespace'), sym('styleValue')),

      styleKey: sym('symbol'),

      symbol: str(seq(
        alt(range('a','z'), range('A','Z')),
        str(repeat(alt(range('a','z'), range('A', 'Z'), '$', '-', range('0', '9')))))),

      styleValue: alt(
        sym('literalStyleValue'),
        sym('braces')),

      literalStyleValue: str(plus(alt(
        range('a','z'),
        range('A', 'Z'),
        range('0', '9'),
        '-',
        '#'))),

      value: str(alt(
        plus(alt(range('a','z'), range('A', 'Z'), range('0', '9'))),
        seq('"', str(repeat(notChar('"'))), '"')
      )),

      whitespace: repeat0(alt(' ', '\t', '\r', '\n'))
    }.addActions({
      START: function(xs) {
        var output = [];
        var out = output.push.bind(output);
        var e = this.peek().children[0];
        e.as = e.as || '$e';
        e.output(out, true);
        this.reset();
        return 'function(opt_e){var s=[];' + output.join('') + ';return ' + e.as + ';}';
      },
      id: function(id) { this.peek().id = id; },
      as: function(as) { this.peek().as = as; },
      classList: function(cs) {
        for ( var i = 0 ; i < cs.length ; i++ ) {
          if (cs[i].indexOf('$') >= 0) cs[i] = cs[i].replace(/\$/g, this.modelName_);
          this.peek().classes.push('"' + cs[i] + '"');
        }
      },
      classValue: function(c) { this.peek().classes.push(c); },
      style: function(ss) {
        for ( var i = 0 ; i < ss.length ; i++ )
          this.peek().style[ss[i][0]] = ss[i][4];
      },
      tagName: function(n) { return n; },
      if: function(v) {
        var e = this.peek();
        if ( e.ifexpr ) {
          console.warn('Warning: Duplicate if expression');
        }
        e.ifexpr = v;
      },
      attribute: function(xs) { this.peek().attributes[xs[0]] = xs[1]; },
      xattribute: function(xs) { this.peek().xattributes[xs[1]] = xs[2]; },
      text: function(t) {
        if ( ! this.peek() ) return; // TODO: Or add an implicit Element
        this.peek().children.push('"' + t.trim() + '"');
      },
      code: function (c) { this.addCode(c); },
      literalStyleValue: function(v) { return '"' + v + '"'; },
      child: function (c) { this.peek().children.push(c.trim()); },
      on: function(v) { this.peek().listeners[v[1]] = v[3]; },
      topic: function(t) { return t.toLowerCase(); },
      namedListener: function(l) { return 'this.' + l; },
      startTag: function(a) {
        if ( a[5] /* optional('/') */ || foam.u2.Element.ILLEGAL_CLOSE_TAGS[a[1]] )
          this.finishTag();
      },
      startTagName: function(n) {
        this.stack.push({
          nodeName:    n,
          id:          null,
          classes:     [], // TODO: support for dynamic classes
          xattributes: {},
          attributes:  {},
          style:       {},
          listeners:   {},
          children:    [],
          outputMap: function(out, f, m) {
            var first = true;
            for ( var key in m ) {
              if ( first ) {
                out('.', f, '({');
                first = false;
              } else {
                out(',');
              }
              out(key, ':', m[key]);
            }
            if ( ! first ) out('})');
          },
          output: function(out, firstE) {
            var nn = this.nodeName === 'div' ? null : '"' + this.nodeName + '"';
            var longForm = false;
            if ( firstE ) {
              if ( this.as ) out('var ', this.as, '=');
              out('(opt_e || this.X.E(', nn, '))');
            } else {
              longForm = this.as ||
                this.id ||
                this.children.length ||
                this.classes.length ||
                Object.keys(this.attributes).length ||
                Object.keys(this.xattributes).length ||
                Object.keys(this.style).length ||
                Object.keys(this.listeners).length ;

              // If this tag is in any way interesting, it needs to use .s()
              if ( longForm ) {
                out('.s(', nn, ')');
                if ( this.as ) out('.p(s);var ', this.as, '=s[0];s[0]');
              } else {
                out('.g(', this.nodeName === 'br' ? null : '"' + this.nodeName + '"', ')');
              }
            }
            if ( this.id ) out('.i(', this.id, ')');

            for ( var i = 0 ; i < this.classes.length ; i++ ) {
              out('.c(', this.classes[i], ')');
            }

            this.outputMap(out, 'y', this.style);
            this.outputMap(out, 't', this.attributes);
            this.outputMap(out, 'x', this.xattributes);
            this.outputMap(out, 'o', this.listeners);

            var outputting = false;
            for ( var i = 0 ; i < this.children.length ; i++ ) {
              var c = this.children[i];
              if ( c.output ) {
                if ( outputting ) out(')');
                c.output(out);
                outputting = false;
              } else if ( c.code ) {
                if ( outputting ) out(')');
                out('.p(s);', c.code, 's[0]');
                outputting = false;
              } else {
                out(outputting ? ',' : '.a(');
                out(c);
                outputting = true;
              }
            }
            if ( outputting ) out(')');
            if ( longForm ) out('.e()');
          }
        });
        return n;
      },
      endTag: function(tag) {
        while ( this.stack.length > 1 ) {
          if ( this.peek().nodeName === tag ) {
            this.finishTag();
            return;
          }
          debugger;
          /*
          var top = stack.pop();
          this.peek().childNodes = this.peek().childNodes.concat(top.childNodes);
          top.childNodes = [];
          */
        }
      }
    });
  }
});
