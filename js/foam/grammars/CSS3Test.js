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
  name: 'CSS3Test',

  requires: [ 'foam.grammars.CSS3' ],
  imports: [ 'assert' ],

  properties: [
    {
      type: 'foam.grammars.CSS3',
      name: 'css3',
      defaultValue: ''
    }
  ],

  methods: [
    function testSetUp() {
      this.css3 = this.CSS3.create();
    },
    function testTearDown() {
      this.css3 = '';
    },
    function parseString(str, opt_production) {
      var production = opt_production || 'START';
      var p = this.css3.parser;
      var ps = p.stringPS;
      ps.str = str;
      var res = p.parse(p[production], ps);

      return res;
    },
    function testProduction(production, posEg, opt_negEg) {
      var negEg = opt_negEg || [];
      var res, i;
      for ( i = 0; i < posEg.length; ++i ) {
        res = this.parseString(posEg[i], production);
        this.assert(res && res.value && res.toString() === '',
                    'Expected parse from "' + posEg[i] + '" on production "' +
                        production + '"');
      }
      for ( i = 0; i < negEg.length; ++i ) {
        try {
          res = this.parseString(negEg[i], production);
          this.assert(!(res && res.value) || res.toString() !== '',
                      'Expected parse failure from "' + negEg[i] +
                          '" on production "' + production + '"');
        } catch (e) {}
      }
    },
    function getIdents() {
      var nonASCII = this.getNonASCII();
      return [
        'a',
        '-a',
        '-a-',
        '-_',
        '-_0',
        '_0',
        '\\0',
        '\\0\\1',
        nonASCII[0],
        '-' + nonASCII[0],
        nonASCII[0] + nonASCII[1],
        '-' + nonASCII[0] + nonASCII[1],
        'Z',
        '-Z',
        '-Z-'
      ];
    },
    function getNonASCII() {
      return [String.fromCharCode(128),
              String.fromCharCode(0xFFFFFFFF | 0)];
    }
  ],

  tests: [
    {
      model_: 'UnitTest',
      name: 'Esc Token',
      description: 'Test the esc production',
      code: function() {
        var posEgs = [
          '\\000001',
          '\\000001 ',
          '\\000001\n',
          '\\000001\r\n',
          '\\000001\t',
          '\\012345',
          '\\01234',
          '\\0123',
          '\\012',
          '\\01',
          '\\0',
          '\\abcdef',
          '\\ABCDEF',
          '\\aBcDeF',
          '\\AbCdEf',
          '\\g',
          '\\G',
          '\\~',
          '\\\\',
          '\\|'
        ];
        var negEgs = [
          ' ',
          '000001',
          '\\\n',
          '\\0123456',
          '\\abcdef0'
        ];
        this.testProduction('esc', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'Ident Token',
      description: 'Test the identTok production',
      code: function() {
        var posEgs = this.getIdents();
        var negEgs = [
          '-',
          '--',
          '--_',
          '--a',
          '0',
          '-0',
          'a ',
          ' a',
          'a+',
          '+a',
          'a:',
          ':a',
          'a$',
          '$a',
          'a.',
          '.a'
        ];
        this.testProduction('identTok', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'Function Token',
      description: 'Test the funcTok production',
      code: function() {
        var idents = this.getIdents();
        var posEgs = idents.map(function(i) { return i + '('; });
        var negEgs = idents.concat([
          '-(',
          ':(',
          '$(',
          '.(',
          ')(',
          'a( ',
          'a()',
          'a(b)'
        ]);
        this.testProduction('funcTok', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'At-Keyword Token',
      description: 'Test the atkwTok production',
      code: function() {
        var idents = this.getIdents();
        var posEgs = idents.map(function(i) { return '@' + i; });
        var negEgs = idents.concat([
          '@-',
          '@:',
          '@$',
          '.',
          '@',
          '@a ',
          '@a@',
          '@a('
        ]);
        this.testProduction('atkwTok', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'Hash Token',
      description: 'Test the hashTok production',
      code: function() {
        var nonASCII = this.getNonASCII();
        var posEgs = [
          '#a',
          '#Z',
          '#9',
          '#_',
          '#-',
          '#\\0',
          '#' + nonASCII[0],
          '#' + nonASCII[0] + nonASCII[1],
          '#zA',
          '#A0',
          '#0_',
          '#_-',
          '#-\\F',
        ];
        var negEgs = [
          '#',
          '##',
          '#$',
          '#;',
          '#:',
          '#+',
          ' #a',
          '#a ',
          '#a#',
          '#a+'
        ];
        this.testProduction('hashTok', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'String Token',
      description: 'Test the strTok production',
      code: function() {
        var nonASCII = this.getNonASCII();
        var posEgs = [
          '""',
          '\'\'',
          '"aB_+\'?><:{}|)\\ABCDEF01(*&^%$#@!~`\\\n"',
          '\'aB_+"?><:{}|)\\ABCDEF01(*&^%$#@!~`\\\n\''
        ];
        var negEgs = [
          '"',
          ' ""',
          '"" ',
          '\'',
          ' \'\'',
          '\'\' ',
          'noquotes'
        ];
        posEgs =
        this.testProduction('strTok', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'URL Token',
      description: 'Test the urlTok production',
      code: function() {
        var nonASCII = this.getNonASCII();
        var posEgs = [
          'url(unquoted.url.com)',
          'url(  unquoted.url.com)',
          'url(unquoted.url.com  )',
          'url(  unquoted.url.com  )',
          'url(\'single.quoted/url\')',
          'url("double.quoted/url")',
          'url("url.needs.quoting/foo \'()\\"' + String.fromCharCode(0x0000) + '")'
        ];
        var negEgs = [
          'url("poorly quoted)',
          'url(url.needs.quoting/foo bar)',
          'url(url.needs.quoting/foo\')',
          'url(url.needs.quoting/foo()',
          'url(url.needs.quoting/foo))',
          'url(url.needs.quoting/foo\\)',
          'url(url.needs.quoting/foo")',
          'url(url.needs.quoting/foo' + String.fromCharCode(0x0000) + ')'
        ];
        this.testProduction('urlTok', posEgs, negEgs);
      }
    }
  ]
});
