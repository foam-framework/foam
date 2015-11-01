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

      create: function() {
        return { __proto__: this }.reset();
      },

      outputElement: function (e) {
        /*
        var t = this.stack.length ? '.s' : '.start';
        if ( n === 'SPAN' )
          this.out(t, "()");
        else
          this.out(t, "('", n, "')");

        this.out(".x('", xs[1], "',", xs[2],')');

        this.out('.t({', xs[0], ':', xs[1] || 1, '})');

        this.out(".y({");
        for ( var i = 0 ; i < ss.length ; i++ ) {
          if ( i > 0 ) this.out(',');
          this.out(ss[i][0], ':"', ss[i][4], '"');
        }
        this.out("})");

        for ( var i = 0 ; i < ids.length ; i++ )
          this.out(".c('", ids[i], "')");

      xxxid: function(id) { this.out(".id('", id, "')"); },

        // TODO: don't strip whitespace for <pre>
        this.out(".a('", t.replace(/\s+/g, ' '), "')");

        this.out(".p(s);", c.trim(), "s[0]");

      child: function (c) { this.out(".a(", c.trim(), ")"); },

      addListener: function(v) { this.out(".on('", v[1], "',", v[3], ')'); },

          */
        out('.start("', e.nodeName, '")');
        out('.end()');
      },

      reset: function() {
        this.stack  = [ { children: [] } ];
        return this;
      },

      peek: function() { return this.stack[this.stack.length-1]; },

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
        sym('class'),
        sym('style'),
        sym('addListener'),
        sym('xattribute'),
        sym('attribute')
      ),

      addListener: seq('on', sym('topic'), '=', sym('listener')),

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

      text: str(plus(not(alt('<', '{{'), anyChar))),

      attribute: seq(sym('label'), optional(seq1(1, '=', sym('valueOrLiteral')))),

      xattribute: seq('x:', sym('label'), optional(seq1(1, '=', sym('valueOrLiteral')))),

      valueOrLiteral: alt(
        str(seq('"', sym('value'), '"')),
        sym('braces')),

      id: seq1(1, 'id="', sym('value'), '"'),

      class: seq1(1, 'class="', repeat(sym('value'), ' '), '"'),

      style: seq1(2, 'style="', sym('whitespace'), sym('styleMap'), optional(sym('styleDelim')), sym('whitespace'), '"'),

      styleMap: repeat(sym('stylePair'), sym('styleDelim'), 1),

      styleDelim: seq(sym('whitespace'), ';', sym('whitespace')),

      stylePair: seq(sym('value'), sym('whitespace'), ':', sym('whitespace'), sym('styleValue')),

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
        seq1(1, '"', repeat(notChar('"')), '"')
      )),

      whitespace: repeat0(alt(' ', '\t', '\r', '\n'))
    }.addActions({
      START: function(xs) {
        var output = [];
        var out = output.push.bind(output);
        this.peek().children[0].output(out, true);
        this.reset();
        return 'function(){var s=[],e=this.X' + output.join('') + ';return e;}';
      },
      id: function(id) { this.peek().id = id; },
      class: function(ids) {
        this.peek().classes = this.peek().classes.concat(ids);
      },
      style: function(ss) {
        for ( var i = 0 ; i < ss.length ; i++ )
          this.peek().style[ss[i][0]] = ss[i][4];
      },
      tagName: function(n) { return n; },
      attribute: function(xs) {
        this.peek().attributes[xs[0]] = xs[1];
      },
      xattribute: function(xs) {
        this.peek().xattributes[xs[1]] = xs[2];
      },
      text: function(t) {
        if ( ! this.peek() ) return; // TODO: Or add an implicit Element
        this.peek().children.push('"' + t.trim() + '"');
      },
      code: function (c) {
        this.peek().children.push({code: c.trim()});
      },
      literalStyleValue: function(v) { return '"' + v + '"'; },
      child: function (c) { this.peek().children.push(c.trim()); },
      addListener: function(v) {
        this.peek().listeners[v[1]] = v[3];
      },
      namedListener: function(l) { return 'this.' + l; },
      startTag: function(a) {
        if ( a[5] /* optional('/') */ || foam.u2.Element.ILLEGAL_CLOSE_TAGS[a[1]] ) {
          var e = this.stack.pop();
          this.peek().children.push(e);
        }
      },
      startTagName: function(n) {
        this.stack.push({
          nodeName:    n,
          id:          null,
          classes:     [], // TODO
          xattributes: {},
          attributes:  {},
          style:       {},
          listeners:   [], // TODO
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
            if ( firstE ) {
              out('.E(', nn, ')');
            } else {
              if ( this.children.length ) {
                out('.s(', nn, ')');
              } else {
                out('.g(', this.nodeName === 'br' ? null : '"' + this.nodeName + '"', ')');
              }
            }
            if ( this.id ) out('.id(', this.id, ')');

            this.outputMap(out, 'y', this.style);
            this.outputMap(out, 't', this.attributes);
            this.outputMap(out, 'x', this.xattributes);

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

            if ( ! firstE && this.children.length )
              out('.e()');
          }
        });
        return n;
      },
      endTag: function(tag) {
        while ( this.stack.length > 1 ) {
          if ( this.peek().nodeName === tag ) {
            var e = this.stack.pop();
            this.peek().children.push(e);
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
