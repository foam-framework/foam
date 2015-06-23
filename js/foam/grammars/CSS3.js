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

  properties: [
    {
      name: 'parser',
      lazyFactory: function() {
        return {
          __proto__: grammar,

          START: sym('componentValue'),

          // CSS 3 "tokens" (see http://www.w3.org/TR/css-syntax-3/#tokenization).
          cmt: seq1(1, '/*', not('*/', anyChar), '*/'),
          nl: alt('\n', '\r\n', '\r', '\f'),
          ws: alt(' ', '\t', sym('nl')),
          digit: range('0', '9'),
          hd: alt(range('0', '9'), range('a', 'f'), range('A-F')),
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
          esc: str(seq('\\', alt(
              not(alt(sym('nl'), sym('hd'))),
              seq(sym('hd16'), sym('ws'))))),
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
          identTok: seq(optional('-'),
                        alt(sym('azAZ_nonASCII'), sym('esc')),
                        repeat(alt(sym('azAZ09__nonASCII'), sym('esc')))),
          funcTok: seq1(0, sym('identTok'), '('),
          atkwTok: seq1(1, '@', sym('identTok')),
          hashTok: seq1(1, '#', str(repeat(alt('azAZ09__nonASCII'), alt('esc')))),
          innerDblStr: str(repeat(alt(not('"', '\\', sym('nl')),
                                  sym('esc'),
                                  seq('\\', sym('nl'))))),
          innerSglStr: str(repeat(alt(not('\'', '\\', sym('nl')),
                                  sym('esc'),
                                  seq('\\', sym('nl'))))),
          dblStr: seq1(1, '"', sym('innerDblStr'), '"'),
          sglStr: seq1(1, '\'', sym('innerSglStr'), '\''),
          strTok: alt(sym('dblStr'), sym('sglStr')),
          urlTok: seq1(2, 'url(',
                      sym('wsStar'),
                      optional(seq1(0, alt(sym('urlUnquoted'), sym('esc')),
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
                      alt(seq(plus(sym('digit')), '.', plus(sym('digit'))),
                          plus(sym('digit')),
                          seq('.', plus(sym('digit')))),
                      optional(alt('e', 'E'),
                               optional(alt('+', '-')),
                               plus(sym('digit'))))),
          dimTok: str(seq(sym('numTok'), sym('identTok'))),
          perTok: str(seq(sym('numTok'), '%')),
          uniRangeTok: str(seq(alt('U', 'u'),
                           '+',
                           alt(sym('hd16'),
                               sym('hd16QM'),
                               seq(sym('hd16'), '-', sym('hd16'))))),
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
          preservedTok: alt(sym('identTok'),
                            sym('atkwTok'),
                            sym('hashTok'),
                            sym('strTok'),
                            sym('urlTok'),
                            sym('numTok'),
                            sym('perTok'),
                            sym('dimTok'),
                            sym('uniRangeTok'),
                            sym('incMatchTok'),
                            sym('dashMatchTok'),
                            sym('prefMatchTok'),
                            sym('sufMatchTok'),
                            sym('subStrMatchTok'),
                            sym('colTok'),
                            sym('wsTok'),
                            sym('cdoTok'),
                            sym('cdcTok'),
                            sym('colonTok'),
                            sym('semicolonTok'),
                            sym('commaTok'),
                            // delimTok comes last: <delim-token> is emitted by
                            // standard lexer when parsing tokens such as "~=",
                            // "<!--", etc. fails and we wish to simply emit
                            // one delimiter.
                            sym('delimTok')),
          delimTok: alt('#', '$', '*', '+', '-', '.', '/', '<', '@', '^', '|', '~'),

          // CSS 3 "parsing" productions (see http://www.w3.org/TR/css-syntax-3/#parsing).
          stylesheet: repeat(alt(sym('cdoTok'),
                                 sym('cdcTok'),
                                 sym('wsTok'),
                                 sym('qualifiedRule'),
                                 sym('atRule'))),

          // TODO(markdittmer): This is included in http://www.w3.org/TR/css-syntax-3/#parsing,
          // but does not appear to be used by any productions.
          ruleList: repeat(alt(sym('wsTok'),
                               sym('qualifiedRule'),
                               sym('atRule'))),

          atRule: seq(sym('atkwTok'),
                      repeat(sym('componentValue')),
                      alt(sym('braceBlock'), ';')),
          qualifiedRule: seq(repeat(sym('componentValue')),
                             sym('braceBlock')),
          declList: seq(sym('wsStar'),
                        alt(seq(optional(sym('decl')),
                                optional(seq(';', sym('declList')))),
                            seq(sym('atRule'), sym('declList')))),
          decl: seq(sym('identTok'),
                    sym('wsStar'),
                    ':',
                    repeat(sym('componentValue')),
                    optional(sym('important'))),
          important: seq('!', sym('wsStar'), 'important', sym('wsStar')),
          componentValue: alt(sym('preservedTok'),
                              sym('braceBlock'),
                              sym('parenBlock'),
                              sym('brackBlock'),
                              sym('funcBlock')),

          braceBlock: seq('{', repeat(sym('componentValue')), '}'),
          parenBlock: seq('(', repeat(sym('componentValue')), ')'),
          brackBlock: seq('[', repeat(sym('componentValue')), ']'),

          // TODO(markdittmer): Should functions this support rule and decl lists?
          funcBlock: seq(sym('funcTok'), repeat(sym('componentValue')), ')')
        };
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      // TODO(markdittmer): Debugging only.
      GLOBAL.CSS3 = this;
    }
  ]
});
