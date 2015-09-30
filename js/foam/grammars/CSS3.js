/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.grammars',
  name: 'CSS3',

  imports: [ 'assert' ],

  constants: {
    PREFIXES: [
      '-webkit-'
    ],
    PREFIXED_KEYS: {
      'align-content': true,
      'align-items': true,
      'align-self': true,
      'animation': true,
      'box-shadow': true,
      'column-count': true,
      'column-gap': true,
      'column-rule': true,
      'display': 'flex',
      'filter': true,
      'flex': true,
      'flex-basis': true,
      'flex-direction': true,
      'flex-flow': true,
      'flex-grow': true,
      'flex-shrink': true,
      'flex-wrap': true,
      'font-feature-settings': true,
      'hyphens': true,
      'justify-content': true,
      'keyframes': true,
      'order': true,
      'transform': true,
      'transform-origin': true,
      'user-select': true
    }
  },

  properties: [
    {
      name: 'parser',
      lazyFactory: function() {
        var css = this;
        return SkipGrammar.create({
          __proto__: grammar,

          START: sym('stylesheet'),

          // CSS 3 "tokens" (see http://www.w3.org/TR/css-syntax-3/#tokenization).
          nl: alt('\n', literal('\r\n'), '\r', '\f'),
          ws: alt(' ', '\t', sym('nl')),
          digit: range('0', '9'),
          hd: alt(range('0', '9'), range('a', 'f'), range('A', 'F')),
          hdQM: alt(sym('hd'), '?'),
          hd16: str(seq(sym('hd'),
                    optional(sym('hd')),
                    optional(sym('hd')),
                    optional(sym('hd')),
                    optional(sym('hd')),
                    optional(sym('hd')))),
          hd16QM: str(seq(sym('hd'),
                      optional(sym('hdQM')),
                      optional(sym('hdQM')),
                      optional(sym('hdQM')),
                      optional(sym('hdQM')),
                      optional(sym('hdQM')))),
          esc: str(seq('\\', alt(not(alt(sym('nl'), sym('hd')), anyChar),
                             str(seq(sym('hd16'), optional(sym('ws'))))))),
          wsTok: str(plus(sym('ws'))),
          wsStar: str(repeat(sym('ws'))),
          azAZ_nonASCII: alt(range('a', 'z'),
                             range('A', 'Z'),
                             '_',
                             range(String.fromCharCode(128),
                                   String.fromCharCode(0xFFFFFFFF | 0))),
          azAZ09__nonASCII: alt(range('a', 'z'),
                                range('A', 'Z'),
                                range('0', '9'),
                                '_',
                                '-',
                                range(String.fromCharCode(128),
                                      String.fromCharCode(0xFFFFFFFF | 0))),
          identTok: str(seq(optional('-'),
                        alt(sym('azAZ_nonASCII'), sym('esc')),
                        str(repeat(alt(sym('azAZ09__nonASCII'), sym('esc')))))),
          funcTok: seq1(0, sym('identTok'), '('),
          atkwTok: seq1(1, '@', sym('identTok')),
          hashTok: seq1(1, '#', str(plus(alt(sym('azAZ09__nonASCII'), sym('esc'))))),
          innerDblStr: str(repeat(alt(not(alt('"', '\\', sym('nl')), anyChar),
                                  sym('esc'),
                                  str(seq('\\', sym('nl')))))),
          innerSglStr: str(repeat(alt(not(alt('\'', '\\', sym('nl')), anyChar),
                                  sym('esc'),
                                  str(seq('\\', sym('nl')))))),
          dblStr: seq1(1, '"', sym('innerDblStr'), '"'),
          sglStr: seq1(1, '\'', sym('innerSglStr'), '\''),
          strTok: alt(sym('dblStr'), sym('sglStr')),
          urlTok: seq1(2, 'url(',
                       sym('wsStar'),
                       optional(seq1(0, alt(sym('urlUnquoted'),
                                            sym('strTok')),
                                     sym('wsStar'))),
                       ')'),
          urlUnquoted: str(plus(alt(not(alt('"', '\'', '(', ')', '\\',
                                        sym('ws'), sym('nonPrintable')),
                                    anyChar),
                                sym('esc')))),
          nonPrintable: alt(range(String.fromCharCode(0x0000), String.fromCharCode(0x0008)),
                            String.fromCharCode(0x000B),
                            range(String.fromCharCode(0x000E), String.fromCharCode(0x001F)),
                            String.fromCharCode(0x007F)),
          numTok: str(seq(optional(alt('+', '-')),
                      alt(str(seq(str(plus(sym('digit'))), '.', str(plus(sym('digit'))))),
                          str(plus(sym('digit'))),
                          str(seq('.', str(plus(sym('digit')))))),
                      optional(str(seq(alt('e', 'E'),
                                   optional(alt('+', '-')),
                                   str(plus(sym('digit')))))))),
          dimTok: str(seq(sym('numTok'), sym('identTok'))),
          perTok: str(seq(sym('numTok'), '%')),
          uniRangeTok: str(seq(alt('U', 'u'),
                               '+',
                               alt(str(seq(sym('hd16'), '-', sym('hd16'))),
                                   sym('hd16QM'),
                                   sym('hd16')))),
          incMatchTok: literal('~='),
          dashMatchTok: literal('|='),
          prefMatchTok: literal('^='),
          sufMatchTok: literal('$='),
          subStrMatchTok: literal('*='),
          colTok: literal('||'),
          cdoTok: literal('<!--'),
          cdcTok: literal('-->'),
          colonTok: literal(':'),
          semicolonTok: literal(';'),
          commaTok: literal(','),

          // "Preserved token" from http://www.w3.org/TR/css-syntax-3/#parsing
          // is "Any token produced by the tokenizer except for
          // <function-token>s, <{-token>s, <(-token>s, and <[-token>s.".
          // We approximate this with the list of tokens below. Note that
          // '}', ')', and ']' are usually included in "preserved tokens",
          // but cause parse errors. According to the standard, this is to
          // allow for better error recovery in contexts such as media queries.
          preserved1: alt(sym('cdoTok'),
                          sym('cdcTok'),
                          sym('urlTok'),
                          sym('strTok'),
                          sym('perTok'),
                          sym('dimTok'),
                          sym('numTok'),
                          sym('uniRangeTok'),
                          sym('atkwTok'),
                          sym('hashTok'),
                          sym('identTok'),
                          sym('incMatchTok'),
                          sym('dashMatchTok'),
                          sym('prefMatchTok'),
                          sym('sufMatchTok'),
                          sym('subStrMatchTok'),
                          sym('colTok'),
                          sym('wsTok'),
                          sym('colonTok'),
                          sym('commaTok')),
          // NoSemicolon cases: There are a few places where the "informal"
          // railroad diagrams in the spec specify a sequence of component
          // values (each maybe-is-a preserved token) terminated by a semicolon.
          // The trouble is, a semicolon token is a preserved token. It is for
          // such cases that we introduce the "NoSemicolon" variant of several
          // productions.
          // delimTok comes last: <delim-token> is emitted by standard lexer
          // when parsing tokens such as "~=", "<!--", etc. fails and we wish
          // to simply emit one delimiter. It is probably emitted even more
          // often (i.e., as a catch-all when every other token match has
          // failed). That is why some additions that are common in CSS (such as
          // '>') have been added.
          preservedTokNoSemicolon: alt(sym('preserved1'),
                                       sym('delimTok')),
          preservedTok: alt(sym('preserved1'),
                            sym('semicolonTok'),
                            sym('delimTok')),
          delimTok: alt('#', '$', '*', '+', '-', '.', '/', '<', '>', '@', '^', '|', '~', '='),

          // CSS 3 "parsing" productions (see http://www.w3.org/TR/css-syntax-3/#parsing).
          stylesheet: repeat(alt(sym('cdoTok'),
                                 sym('cdcTok'),
                                 sym('wsTok'),
                                 sym('atRule'),
                                 sym('qualifiedRule'))),

          atRule: seq(sym('atkwTok'),
                      sym('atRuleContents')),
          atRuleContents: alt(sym('atRuleBody'), sym('atRuleContentsContinued')),
          atRuleBody: alt(sym('braceBlock'), ';'),
          atRuleContentsContinued: seq(sym('componentValueNoSemicolon'), sym('atRuleContents')),

          qualifiedRule: alt(sym('qualifiedRuleBlock'),
                             sym('qualifiedRuleContinued')),
          qualifiedRuleBlock: sym('braceBlock'),
          qualifiedRuleContinued: seq(sym('componentValue'), sym('qualifiedRule')),

          rule: alt(sym('atRule'), sym('qualifiedRule')),
          ruleList: seq1(1, sym('wsStar'),
                        alt(seq(sym('rule'), sym('ruleList')),
                            sym('rule'))),

          declList: seq1(1, sym('wsStar'),
                         alt(sym('declListOptDeclList'),
                             sym('declListAtList'))),
          declListOptDeclList: seq(sym('declListOptDecl'),
                                   sym('declListOptList')),
          declListOptDecl: optional(sym('decl')),
          declListOptList: optional(seq(';', sym('declList'))),
          declListAtList: seq(sym('atRule'), sym('declList')),
          decl: seq(sym('identTok'),
                    sym('wsStar'),
                    ':',
                    str(repeat(sym('componentValueNoSemicolon'))),
                    optional(sym('important'))),
          important: str(seq('!', sym('wsStar'), 'important', sym('wsStar'))),

          componentValue: alt(sym('braceBlock'),
                              sym('parenBlock'),
                              sym('brackBlock'),
                              sym('funcBlock'),
                              sym('preservedTok')),
          componentValueNoSemicolon: alt(sym('braceBlock'),
                                         sym('parenBlock'),
                                         sym('brackBlock'),
                                         sym('funcBlock'),
                                         sym('preservedTokNoSemicolon')),

          // So far, we only really care about the structure of declarations
          // inside brace blocks.
          braceBlock: seq1(1, '{', sym('braceBlockContents'), '}'),
          braceBlockContents: seq(sym('wsStar'),
                                  optional(alt(sym('ruleList'),
                                               sym('declList'))),
                                  str(repeat(sym('componentValue')))),

          parenBlock: seq1(1, '(', str(repeat(sym('componentValue'))), ')'),
          brackBlock: seq1(1, '[', str(repeat(sym('componentValue'))), ']'),
          funcBlock: seq(sym('funcTok'), str(repeat(sym('componentValue'))), ')')
        }.addActions({
          // TODO(markdittmer): We should probably "properly model" non-string
          // nodes rather than using { model_: 'NodeType', ... }.
          atkwTok: function(tok) {
            return {
              model_: 'AtKeyword',
              value: tok,
              toString: function() { return '@' + this.value.toString(); }
            };
          },
          hashTok: function(tok) {
            return {
              model_: 'HashIdent',
              value: tok,
              toString: function() { return '#' + this.value.toString(); }
            };
          },
          qualifiedRuleBlock: function(block) {
            return {
              model_: 'QualifiedRule',
              prelude: [],
              body: block,
              toString: function() {
                return this.prelude.map(function(p) {
                  return p.toString();
                }).join('') + this.body.toString(); }
            };
          },
          qualifiedRuleContinued: function(parts) {
            // TODO(markdittmer): Performance issue: Array.prototype.unshift
            // considered harmful.
            if ( css.isWhitespace(parts[0]) ) parts[1].prelude.unshift(' ');
            else                              parts[1].prelude.unshift(parts[0]);
            return parts[1];
          },
          atRule: function(parts) {
            return {
              model_: 'AtRule',
              atName: parts[0],
              contents: parts[1],
              toString: function() {
                return this.atName.toString() + ' ' + this.contents.toString();
              }
            };
          },
          atRuleBody: function(body) {
            return {
              model_: 'AtRuleContents',
              prelude: [],
              body: body,
              toString: function() { return this.prelude.join('') + this.body.toString(); }
            };
          },
          atRuleContentsContinued: function(parts) {
            // TODO(markdittmer): Performance issue: Array.prototype.unshift
            // considered harmful.
            if ( css.isWhitespace(parts[0]) ) parts[1].prelude.unshift(' ');
            else                              parts[1].prelude.unshift(parts[0]);
            return parts[1];
          },
          braceBlockContents: function(parts) {
            var block = {
              model_: 'BraceBlock',
              contents: parts[1] ? parts[1] : '',
              tail: parts[2] ? css.stripWhitespace(parts[2]) : '',
              toString: function() {
                return '{' + this.contents.toString() + this.tail.toString() + '}';
              }
            };
            return block;
          },
          brackBlock: function(body) {
            var block = {
              model_: 'BracketBlock',
              body: body,
              toString: function() {
                return '[' + css.stripWhitespace(this.body.toString()) + ']';
              }
            };
            return block;
          },
          parenBlock: function(body) {
            var block = {
              model_: 'ParenBlock',
              body: body,
              toString: function() {
                return '(' + css.stripWhitespace(this.body.toString()) + ')';
              }
            };
            return block;
          },
          dblStr: function(contents) {
            var block = {
              model_: 'DoubleStr',
              contents: contents,
              toString: function() {
                return '"' + this.contents.toString() + '"';
              }
            };
            return block;
          },
          sglStr: function(contents) {
            var block = {
              model_: 'SingleStr',
              contents: contents,
              toString: function() {
                return '\'' + this.contents.toString() + '\'';
              }
            };
            return block;
          },
          urlTok: function(optUrl) {
            return {
              model_: 'Url',
              url: optUrl ? optUrl : '',
              toString: function() {
                return 'url(' + this.url.toString() + ')';
              }
            };
          },
          funcBlock: function(parts) {
            var block = {
              model_: 'FuncBlock',
              name: parts[0],
              contents: parts[1].trim(),
              toString: function() {
                return this.name.toString() + '(' + this.contents.toString() + ')';
              }
            };
            return block;
          },
          decl: function(parts) {
            var decl = {
              model_: 'Decl',
              key: parts[0],
              value: parts[3].trim(),
              important: !!parts[4],
              toString: function() {
                var key = this.key.toString();
                var important = this.important ? '!important' : '';
                var prefixData = css.PREFIXED_KEYS[key];
                var value = this.value.toString();
                var values = css.PREFIXES.length > 0 && prefixData === value ?
                    css.PREFIXES.map(function(p) { return p + value; }).concat(value) :
                    [value];
                var rtn = values.map(function(v) {
                  return key + ':' + v + important;
                });
                if ( prefixData === true /*|| prefixData === value*/ ) {
                  for ( var i = 0; i < css.PREFIXES.length; ++i ) {
                    rtn = rtn.concat(values.map(function(v) {
                      return css.PREFIXES[i] + key + ':' + v + important;
                    }));
                  }
                }
                return rtn.join(';');
              }
            };
            return decl;
          },
          ruleList: function(parts) {
            if ( parts.length === 2 ) {
              // TODO(markdittmer): Performance issue: Array.prototype.unshift
              // considered harmful.
              parts[1].list.unshift(parts[0]);
              return parts[1];
            } else {
              return {
                model_: 'RuleList',
                list: [parts],
                toString: function() { return this.list.join(''); }
              };
            }
          },
          declListOptDecl: function(decl) {
            return {
              model_: 'DeclList',
              list: decl ? [decl] : [],
              toString: function() {
                return this.list.map(function(decl) {
                  return decl.toString();
                }).join(';');
              }
            };
          },
          declListOptList: function(parts) {
            return parts && parts[1] ? parts[1] : '';
          },
          declListAtList: function(atList) {
            atList[1].list = [atList[0]].concat(atList[1].list);
            return atList[1];
          },
          declListOptDeclList: function(declAndList) {
            if ( declAndList[1] )
                declAndList[0].list = declAndList[0].list.concat(declAndList[1].list);
            return declAndList[0];
          },
          stylesheet: function(parts) {
            var stylesheet = {
              model_: 'Stylesheet',
              contents: parts.filter(function(p) {
                // Strip whitespace.
                return !css.isWhitespace(p);
              }),
              toString: function() {
                return this.contents.map(function(c) {
                  return c.toString();
                }).join('');
              }
            };
            return stylesheet;
          }
        }), seq('/*', str(repeat(not('*/', anyChar))), '*/'));
      }
    }
  ],

  methods: [
    function isWhitespace(str) {
      return str.model_ ? false : !!str.match(/^[ \t\r\n\f]*$/g);
    },
    function stripWhitespace(str) {
      return str.model_ ? str : str.replace(/[ \t\r\n\f]/g, '');
    }
  ]
});
