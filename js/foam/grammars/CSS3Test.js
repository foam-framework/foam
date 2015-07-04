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
    function getAtkws() {
      var idents = this.getIdents();
      return idents.map(function(i) { return '@' + i; });
    },
    function getHashes() {
      var nonASCII = this.getNonASCII();
      return [
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
        '#-\\F'
      ];
    },
    function getStrs() {
      return [
        '""',
        '\'\'',
        '"aB_+\'?><:{}|)\\ABCDEF01(*&^%$#@!~`\\\n"',
        '\'aB_+"?><:{}|)\\ABCDEF01(*&^%$#@!~`\\\n\''
      ];
    },
    function getUrls() {
      return [
        'url(unquoted.url.com)',
        'url(  unquoted.url.com)',
        'url(unquoted.url.com  )',
        'url(  unquoted.url.com  )',
        'url(\'single.quoted/url\')',
        'url("double.quoted/url")',
        'url("url.needs.quoting/foo \'()\\"' + String.fromCharCode(0x0000) + '")'
      ];
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
    function getFuncs() {
      var idents = this.getIdents();
      return idents.map(function(i) { return i + '('; });
    },
    function getNonASCII() {
      return [String.fromCharCode(128),
              String.fromCharCode(0xFFFFFFFF | 0)];
    },
    function getNums() {
      return [
        '+0',
        '-1',
        '.2',
        '+.3',
        '-.4',
        '+5e0',
        '-6e+1',
        '.7e-2',
        '+5E0',
        '-6E+1',
        '.7E-2'
      ];
    },
    function getDims() {
      var nums = this.getNums();
      var idents = this.getIdents();
      var ret = new Array(nums.length * idents.length);
      var k = 0;
      for ( var i = 0; i < nums.length; ++i ) {
        for ( var j = 0; j < idents.length; ++j ) {
          ret[k++] = nums[i] + idents[j];
        }
      }
      return ret;
    },
    function getPercents() {
      return this.getNums().map(function(n) { return n + '%'; });
    },
    function getUniRanges() {
      return [
        'U+012345',
        'u+aBcDeF',
        'u+aBcDe',
        'u+aBcD',
        'u+aBc',
        'u+aB',
        'u+a',
        'U+aBcDeF',
        'U+aBcDe?',
        'U+aBcD??',
        'U+aBc???',
        'U+aB????',
        'U+a?????',
        'U+0-1',
        'u+012345-aBcDeF'
      ];
    },
    function getDecls() {
      return [
        'foo:bar',
        'foo : bar',
        'foo: 0',
        'foo: 0px',
        'foo: 0em',
        'foo: 0%',
        'foo: 0 1px 2% 3em!important',
        'foo: 0 1px 2% 3em !important',
        'foo: 0 1px 2% 3em ! important',
        'foo: 0 1px 2% 3em ! important '
      ];
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
        var posEgs = this.getFuncs();
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
        var posEgs = this.getAtkws();
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
        var posEgs = this.getHashes();
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
        var posEgs = this.getStrs();
        var negEgs = [
          '"',
          ' ""',
          '"" ',
          '\'',
          ' \'\'',
          '\'\' ',
          'noquotes'
        ];
        this.testProduction('strTok', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'URL Token',
      description: 'Test the urlTok production',
      code: function() {
        var posEgs = this.getUrls();
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
    },
    {
      model_: 'UnitTest',
      name: 'Num Token',
      description: 'Test the numTok production',
      code: function() {
        var posEgs = this.getNums();
        var negEgs = [
          '0.',
          '+1.',
          '-2.',
          '3e',
          '4e+',
          '5e-',
          '6e-7.8',
          '6e-9.',
          '6e-.0'
        ];
        this.testProduction('numTok', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'Dim Token',
      description: 'Test the dimTok production',
      code: function() {
        var posEgs = this.getDims();
        var negEgs = [
          ' 0em',
          '0 em',
          '0em '
        ];
        this.testProduction('dimTok', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'Percent Token',
      description: 'Test the perTok production',
      code: function() {
        var posEgs = this.getPercents();
        var negEgs = [
          ' 0',
          '0 ',
          '0% ',
          '0~'
        ];
        this.testProduction('perTok', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'Unicode Range Token',
      description: 'Test the uniRangeTok production',
      code: function() {
        var posEgs = this.getUniRanges();
        var negEgs = [
          'U+?',
          'U+??',
          'U+???',
          'U+????',
          'U+?????',
          'u+1.',
          'u+1 ',
          ' u+1',
          'u+012345_aBcDeF',
          'u+01234?-aBcDeF',
          'u+012345-aBcDe?',
          'u+012345-',
          'u+-012345',
          'u+0123456'
        ];
        this.testProduction('uniRangeTok', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'Small Literal Tokens',
      description: 'Test productions that contain small literals',
      code: function() {
        this.testProduction('incMatchTok', ['~='], ['~', '=', ' ~=', '~= ']);
        this.testProduction('dashMatchTok', ['|='], ['|', '=', ' |=', '|= ']);
        this.testProduction('prefMatchTok', ['^='], ['^', '=', ' ^=', '^= ']);
        this.testProduction('sufMatchTok', ['$='], ['$', '=', ' $=', '$= ']);
        this.testProduction('subStrMatchTok', ['*='], ['*', '=', ' *=', '*= ']);
        this.testProduction('colTok', ['||'], ['|', ' ||', '|| ']);
        this.testProduction('cdoTok', ['<!--'], ['<!-', '!--', '<!---', '-->']);
        this.testProduction('cdcTok', ['-->'], ['->', '--', '--->', '<!--']);
        this.testProduction('colonTok', [':'], [': ', ' :', '::']);
        this.testProduction('semicolonTok', [';'], ['; ', ' ;', ';;']);
        this.testProduction('commaTok', [','], [', ', ' ,', ',,']);
      }
    },
    {
      model_: 'UnitTest',
      name: 'Delimiter Tokens',
      description: 'Test delimTok production',
      code: function() {
        var posEgs = [
          '#',
          '$',
          '*',
          '+',
          '-',
          '.',
          '/',
          '<',
          '@',
          '^',
          '|',
          '~',
          '='
        ];
        var negEgs = this.getIdents()
            .concat(this.getNums())
            .concat(this.getAtkws())
            .concat(this.getHashes())
            .concat(this.getStrs())
            .concat(this.getUrls())
            .concat(this.getDims())
            .concat(this.getPercents())
            .concat(this.getUniRanges())
            .concat(this.getFuncs())
            .concat([
              '~=',
              '|=',
              '^=',
              '$=',
              '*=',
              '||',
              '<!--',
              '-->',
              '-->',
              ':',
              ';',
              ',',
              '{',
              '(',
              '[',
              '}',
              ')',
              ']',
              ' ',
              '\t',
              '\n',
              '\r\n',
              '\r',
              '\f',
              ' \t',
              ' \n',
              ' \r\n',
              ' \r',
              ' \f'
            ])
        ;
        this.testProduction('delimTok', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'Preserved Tokens',
      description: 'Test preservedTok production',
      code: function() {
        var posEgs = this.getIdents()
            .concat(this.getNums())
            .concat(this.getAtkws())
            .concat(this.getHashes())
            .concat(this.getStrs())
            .concat(this.getUrls())
            .concat(this.getDims())
            .concat(this.getPercents())
            .concat(this.getUniRanges())
            .concat([
              '~=',
              '|=',
              '^=',
              '$=',
              '*=',
              '||',
              '<!--',
              '-->',
              '-->',
              ':',
              ';',
              ',',
              ' ',
              '\t',
              '\n',
              '\r\n',
              '\r',
              '\f',
              ' \t',
              ' \n',
              ' \r\n',
              ' \r',
              ' \f'
            ])
        ;
        var negEgs = this.getFuncs().concat([
          '{',
          '(',
          '[',
          '}',
          ')',
          ']'
        ]);
        this.testProduction('preservedTok', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'Decl',
      description: 'Test decl production',
      code: function() {
        var posEgs = this.getDecls();
        var negEgs = [
          ' ',
          'foo: 0 1px 2% 3em !',
          'foo: 0 1px ! 2% 3em',
          'foo: 0 1px 2% 3em ! unimportant ',
          ':'
        ];
        this.testProduction('decl', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'Decl List',
      description: 'Test declList production',
      code: function() {
        var decls = this.getDecls();
        var divs = [';', ' ;', '; ', ';\n  '];
        var atkws = this.getAtkws();
        var posEgs = [];
        for ( var i = 0; i < decls.length; ++i ) {
          posEgs.push(decls[i]);
          for ( var j = 0; j < decls.length; ++j ) {
            for ( var k = 0; k < divs.length; ++k ) {
              var declList = decls[i] + divs[k] + decls[j];
              posEgs.push(declList);
              posEgs.push(atkws[0] + ';' + declList);
          //     for ( var l = 0; l < atkws.length; ++l ) {
          //       // TODO(markdittmer): replace atkws with a bunch of at-rules.
          //       posEgs.push(atkws[l] + ';' + declList);
          //     }
            }
          }
        }
        var negEgs = [
        ];
        this.testProduction('declList', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'Brace Block',
      description: 'Test braceBlock production',
      code: function() {
        var posEgs = [
          '{ foo: bar }',
          '{ foo: }',
          '{ foo: bar; }',
          '{}',
          '{ }',
          '{ foo:; }',
          '{ foo bar baz 0123 }',
          '{ foo: bar; baz: 0123 }',
          '{ foo: bar; baz: 0123; }',
          '{ color: rgba(1, 2, 3, 0.2); }'
        ];
        var negEgs = [
          '}{'
        ];
        this.testProduction('braceBlock', posEgs, negEgs);

        var blockText = multiline(function() {/*{
  border: 1px solid black;
  border-radius: 5px;
  line-height: 150%;
  margin: 2px;
  padding: 6px;
}*/});
        var names = ['border', 'border-radius', 'line-height', 'margin', 'padding'];
        var blockRes = this.parseString(blockText, 'braceBlock');
        var check = blockRes && blockRes.value && blockRes.toString() === '';
        this.assert(check, 'Expected parse of "' + blockText +
            '" to yield complete parse of "braceBlock"');
        if ( check ) {
          var block = blockRes.value;
          var declList = block.contents;
          var decls = declList.list;
          this.assert(decls.length === 5, 'Expected parse of "' + blockText +
              '" to yield list of 5 declarations in block');
          for ( var i = 0; i < names.length; ++i ) {
            this.assert(names[i] === decls[i].key, 'Expected declaration key ' +
                'to be "' + names[i] + '" and is "' + decls[i].key + '"');
          }
        }
      }
    },
    {
      model_: 'UnitTest',
      name: 'At Rule',
      description: 'Test atRule production',
      code: function() {
        var posEgs = [
          '@a;',
          '@a ;',
          '@b{}',
          '@c {}',
          '@d { }',
          '@e .f #g { }',
          '@h .i #j ;',
        ];
        var negEgs = [
          '@unterminated',
          '@wrong block type ()',
          '@wrong block type []',
          '@1n\\/alid at keyword {}'
        ];
        this.testProduction('atRule', posEgs, negEgs);

        var atText = multiline(function() {/*@media print not(print)

{
  foo: bar;
  baz: quz;
}*/});
        var atRes = this.parseString(atText, 'atRule');
        var check = atRes && atRes.value && atRes.toString() === '';
        var atRule;
        this.assert(check, 'Expected parse of "' + atText +
            '" to yield complete parse of "atRule"');
        if ( check ) {
          atRule = atRes.value;
          this.assert(atRule.atName && atRule.atName.value === 'media',
                      'Expected "' + atText + '" to have at keyword "media"');
          this.assert(atRule.contents && atRule.contents.prelude &&
              atRule.contents.prelude[1] === 'print', 'Expected "' + atText +
              '" to have prelude[1] of "print"');
          this.assert(atRule.contents && atRule.contents.prelude &&
              atRule.contents.prelude[3] &&
              atRule.contents.prelude[3].model_ === 'FuncBlock' &&
              atRule.contents.prelude[3].name === 'not' &&
              atRule.contents.prelude[3].contents === 'print', 'Expected "' +
              atText + '" to have prelude[3] of function: "not(print)"');
          this.assert(atRule.contents && atRule.contents.body &&
              atRule.contents.body.model_ === 'BraceBlock', 'Expected "' +
              atText + '" to have body containing brace block');
        }

        atText = multiline(function() {/*@media not print {
  .md-card-shell, .md-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
    margin: 10px;
    border-radius: 3px;
  }
}*/});
        var names = ['box-shadow', 'margin', 'border-radius'];
        var values = ['0 1px 3px rgba(0, 0, 0, 0.38)', '10px', '3px'];
        atRes = this.parseString(atText, 'atRule');
        check = atRes && atRes.value && atRes.toString() === '';
        this.assert(check, 'Expected parse of "' + atText +
            '" to yield complete parse of "atRule"');
        if ( check ) {
          atRule = atRes.value;
          this.assert(atRule.atName && atRule.atName.value === 'media',
                      'Expected "' + atText + '" to have at keyword "media"');
          check = atRule.contents && atRule.contents.body &&
              atRule.contents.body.model_ === 'BraceBlock' &&
              atRule.contents.body.contents &&
              atRule.contents.body.contents.model_ === 'RuleList' &&
              atRule.contents.body.contents.list &&
              atRule.contents.body.contents.list[0] &&
              atRule.contents.body.contents.list[0].model_ === 'QualifiedRule' &&
              atRule.contents.body.contents.list[0].body &&
              atRule.contents.body.contents.list[0].body.model_ === 'BraceBlock' &&
              atRule.contents.body.contents.list[0].body.contents &&
              atRule.contents.body.contents.list[0].body.contents.model_ === 'DeclList' &&
              atRule.contents.body.contents.list[0].body.contents.list;
          this.assert(check, 'Expected "' + atText + '" to contain the ' +
              'structure: AtRule.BraceBlock.RuleList.QualifiedRule.BraceBlock.DeclList');
          if ( check ) {
            var decls = atRule.contents.body.contents.list[0].body.contents.list;
            for ( var i = 0; i < names.length; ++i ) {
              this.assert(names[i] === decls[i].key, 'Expected declaration key ' +
                  'to be "' + names[i] + '" and is "' + decls[i].key + '"');
              this.assert(values[i] === decls[i].value, 'Expected declaration ' +
                  'value to be "' + values[i] + '" and is "' + decls[i].value + '"');
            }
          }
        }
      }
    },
    {
      model_: 'UnitTest',
      name: 'Qualified Rule',
      description: 'Test qualifiedRule production',
      code: function() {
        var posEgs = [
          '{}',
          'a{}',
          'a {}',
          'a .b {}',
          'a .b #c {}',
          'a .b #c[foo=bar] {}',
          'a .b #c[foo*=bar] {}',
          'a .b #c[foo $= bar] {  }'
        ];
        var negEgs = [
          'wrong .block #type ()',
          'wrong .block #type []'
        ];
        this.testProduction('qualifiedRule', posEgs, negEgs);

        var qText = multiline(function() {/*alpha .beta #gamma[ epsilon ^= omega ]

{
  foo: bar;
  baz: quz;
}*/});
        var qRes = this.parseString(qText, 'qualifiedRule');
        var check = qRes && qRes.value && qRes.toString() === '';
        this.assert(check, 'Expected parse of "' + qText +
            '" to yield complete parse of "qualifiedRule"');
        if ( check ) {
          var qRule = qRes.value;
          // TODO(markdittmer): Add assertions here.
        }
      }
    },
    {
      model_: 'UnitTest',
      name: 'Bracket Block',
      description: 'Test brackBlock production',
      code: function() {
        var posEgs = [
          '[]',
          '[foo=bar]',
        ];
        var negEgs = [
          '()',
          '{}'
        ];
        this.testProduction('brackBlock', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'Stylesheet',
      description: 'Test stylesheet production',
      code: function() {
        var posEgs = [
          '',
          ' ',
          ' /* comment */ ',
          multiline(function() {/*html, body {
  margin: 0px;
  padding: 0px;
}

body {
  font-family: Roboto, "Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif;
  font-size: 12px;
}
p, h1, form, button {
  border: 0;
  margin: 0;
  padding: 0;
}

.spacer {
  clear: both;
  height: 1px;
}

.foamform {
  margin: 0 auto;
  width: 450px;
  padding: 14px;
}

.stackview {
  width: 100%;
}

.stackview-viewarea {
  width: 100%;
}

.stackview-previewarea {
  height: 100%;
}

.stackview-previewarea .actionToolbar {
  display: none;
}

.stackview-slidearea {
  background: white;
  box-shadow: 0px 0px 30px black;
  height: 100%;
  position: fixed;
  z-index: 4;
}

.stackview-dimmer {
  background: black;
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s;
}


.detailView {
  display: table;
  border: solid 2px #dddddd;
  background: #fafafa;
  width: 99%;
}

.detailView .heading {
  float: left;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
}

.detailView .propertyLabel {
  font-size: 14px;
  display: block;
  font-weight: bold;
  text-align: right;
  float: left;
}

.detailView input {
  font-size: 12px;
  padding: 4px 2px;
  border: solid 1px #aacfe4;
  margin: 2px 0 0px 10px;
}

.detailView textarea {
  float: left;
  font-size: 12px;
  padding: 4px 2px;
  border: solid 1px #aacfe4;
  margin: 2px 0 0px 10px;
  width: 98%;
  overflow: auto;
}

.detailView select {
  font-size: 12px;
  padding: 4px 2px;
  border: solid 1px #aacfe4;
  margin: 2px 0 0px 10px;
}

.detailView .label {
  vertical-align: top;
}

.detailArrayLabel {
  font-size: medium;
}

.detailArrayLabel .foamTable {
  margin: 1px;
  width: 99%;
}


.summaryView {
  background: white;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.summaryView .table {
  table-layout: fixed;
}

.summaryView td: first-child { width: 50px; }

.summaryView .label{
  font-size: 14px;
  display: block;
  font-weight: bold;
  text-align: right;
  width: 120px;
  float: left;
}

.summaryView .value{
  float: left;
  font-size: 12px;
  padding-left: 8px;
  margin: 2px 15px 2px 0px;
}


.foamSearchView select{
  font-family: 'Courier New', Courier, monospace;
}

.helpView {
  width: 100%;
}

.helpView .intro{
  padding-top: 10px;
  font-size: 16px;
  font-weight: bold;
}

.helpView .label{
  padding-top: 10px;
  font-size: 14px;
  font-weight: bold;
}

.helpView .text{
  width: 100%;
  font-size: 14px;
  padding-left: 8px;
  margin: 2px 15px 2px 0px;
}

.actionBorder {
  width: 95%;
}

.actionToolbar {
  float: right;
}

.actionBorderActions {
  padding-right: 15px;
  text-align: right;
}

.ActionMenuPopup {
  position: absolute;
  width: 150px;
  border: 2px solid grey;
  background: white;
}

.ActionMenu .actionButton {
  background: white;
  border: none;
  border-radius: 0;
  text-align: left;
  width: 100%;
}

.imageView {
  display: inline-block;
}

#stylized {
  border: solid 2px #b7ddf2;
  background: #ebf4fb;
}
#stylized h1 {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
}
#stylized p{
  font-size: 11px;
  color: #666666;
  margin-bottom: 20px;
  border-bottom: solid 1px #b7ddf2;
  padding-bottom: 10px;
}
#stylized label{
  display: block;
  font-weight: bold;
  text-align: right;
  width: 140px;
  float: left;
}
#stylized .small{
  color: #666666;
  display: block;
  font-size: 11px;
  font-weight: normal;
  text-align: right;
  width: 140px;
}
#stylized input{
  float: left;
  font-size: 12px;
  padding: 4px 2px;
  border: solid 1px #aacfe4;
  margin: 2px 0 20px 10px;
  width: 200px;
}
#stylized button{
  background: #666666;
  clear: both;
  color: #FFFFFF;
  font-size: 11px;
  font-weight: bold;
  height: 31px;
  line-height: 31px;
  margin-left: 150px;
  text-align: center;
  width: 125px;
}


.foamTable {
  background: #fff;
  border-collapse: collapse;
  font-family: Roboto, "Lucida Sans Unicode", "Lucida Grande", Sans-Serif;
  font-size: 12px;
  margin: 10px;
  table-layout:fixed;
  text-align: left;
  width: 98%;
}
.BookmarkTable {
  width: 800px;
}
.foamTable caption {
  font-size: 16px;
  font-weight: bold;
  color: #039;
  padding: 10px 8px;
  text-align: left;
}
.foamTable th {
  font-size: 14px;
  font-weight: normal;
  color: #039;
  padding: 10px 8px;
  border-bottom: 2px solid #6678b1;
}
.foamTable td {
  color: #669;
  padding: 4px 8px 4px 8px;
}
.foamTable tbody tr:hover td {
  color: #009;
  background: #eee;
}
.foamTable tbody tr.rowSoftSelected td {
  color: #009;
  background: #eee;
}
.foamTable tr.rowSelected {
  color: #900;
  background: #eee;
  border: 2px solid #f00;
}
.foamTable .numeric {
  text-align: right;
}

button.actionButton {
  -webkit-box-shadow: inset 0 1px 0 0 #ffffff;
  box-shadow: inset 0 1px 0 0 #ffffff;
  background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #ededed), color-stop(1, #dfdfdf) );
  background: -moz-linear-gradient( center top, #ededed 5%, #dfdfdf 100% );
  background-color: #ededed;
  -moz-border-radius: 3px;
  -webkit-border-radius: 3px;
  border-radius: 3px;
  border: 1px solid #dcdcdc;
  display: inline-block;
  color: #777777;
  font-family: arial;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 16px;
  text-decoration: none;
  visibility: hidden;
}

button.actionButton.available {
  visibility: visible;
}

button.actionButton:hover {
  background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #dfdfdf), color-stop(1, #ededed) );
  background: -moz-linear-gradient( center top, #dfdfdf 5%, #ededed 100% );
  background-color: #dfdfdf;
}

.actionButton img {
  vertical-align: middle;
}

.scrollSpacer {
  height: 52;
}

.foamTable td,
.foamTable th,
.summaryView td,
.summaryView th,
.detailView td,
.detailView th {
  white-space: nowrap;
  overflow: hidden;
  text-overflow:ellipsis;
}

select {
  background-color:rgb(240,240,240);
  margin-bottom: 15px;
}

.foamSearchViewLabel {
  margin-top: 5px;
  padding-left: 4px;
}

.searchTitle {
  color:#039;
  font-size: 16px;
  padding-left: 5px;
}

.messageBody {
  white-space: normal;
}

.summaryView table {
  width: 100%;
}

.summaryView .label[colspan="2"] {
  width: 100%;
}

.summaryView .label {
  width: 30%;
}

div.gridtile td div a {
  color: #000;
  text-decoration: none;
  white-space: normal;
}

div.gridtile {
  width: 10em;
  float: left;
  margin: 2px;
}

div.gridtile {
  border: 2px solid #c3d9ff;
  border-radius: 6px;
  padding: 1px;
}

div.gridtile td.id {
  width: 5em;
  text-align: left;
  margin-left: 4px;
}

div.gridtile td.id a {
  margin-left: 4px;
}

div.gridtile td.status {
  font-size: 11px;
  text-align: right;
  width: 70%;
}

div.gridtile table, div.projecttile table {
  width: 100%;
  table-layout: fixed;
}

div.gridtile td, div.projecttile td {
  border: 0;
  padding: 2px;
  overflow: hidden;
  font-family: arial, sans-serif;
  font-size: 13px;
  font-style: normal;
}

div.gridtile td div {
  height: 5.5ex;
  font-size: 90%;
  line-height: 100%;
}

div.gridViewControl {
  padding: 5px;
  background: rgb(235, 239, 249);
  border-color: rgb(187, 187, 187);
  border-style: solid;
  border-width: 1px;
}

div.gridViewControl select {
  margin-bottom: 6px;
  font-family: arial, sans-serif;
  font-size: 10px;
  font-style: normal;
  font-variant: normal;
  font-weight: normal;
  color: rgb(0, 0, 0);
  outline-color: rgb(223, 215, 207);
  background-color: rgb(221, 221, 221);
}

.gridBy th {
  background: #eeeeee;
  border: 1px solid #ccc;
  border-spacing: 2px;
  font-family: arial, sans-serif;
  font-size: 13px;
  font-style: normal;
  font-variant: normal;
  font-weight: bold;
  padding: 2px;
  text-align: left;
}

.gridBy td {
  vertical-align: top;
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  padding: 4px;
}

.idcount {
  color: #0000cc;
  text-decoration: underline;
  font: 82% arial,sans-serif;
}

.idlist {
  color: #0000cc;
  text-decoration: underline;
  font: 82% arial,sans-serif;
}


.buttonify {
  font-size: 100%;
  background: url("//ssl.gstatic.com/codesite/ph/images/button-bg.gif") repeat-x scroll left top #e3e3e3;
  background: -webkit-gradient(linear,0% 40%,0% 70%,from(#f9f9f9),to(#e3e3e3));
  background: -moz-linear-gradient(top,#fff,#ddd);
  vertical-align: baseline;
  padding: 1px 3px 1px 3px;
  border: 1px solid #aaa;
  border-top-color: #ccc;
  border-bottom-color: #888;
  border-radius: 3px;
  cursor: pointer;
  text-decoration: none;
}

.mode_button_active
{
  background: url("//ssl.gstatic.com/codesite/ph/images/button-bg.gif") repeat-x scroll left bottom #bbb;
  background: -webkit-gradient(linear,0% 40%,0% 70%,from(#e3e3e3),to(#f9f9f9));
  background: -moz-linear-gradient(top,#e3e3e3,#f9f9f9);
  border-color: #aaa;
}

.capsule_right {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.capsule_left {
  border-right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.altViewButtons {
  margin-right: 17px;
  float: right;
}

.arrayTileView {
  margin: 0;
  width: 100%;
  padding: 0px;
  display: inline-block;
  border-bottom: 2px inset;
}

.arrayTileItem {
  display: inline-block;
  list-style-type: none;
  margin: 2px 2px;
}

.arrayTileLastView {
  display: inline-block;
  margin: 0;
  list-style-type: none;
  vertical-align: 7px;
}

.listInputView {
  width: 100%;
  border: none;
  padding: 1px 0 1px 8px;
  outline: none;
  height: 36px;
}

.autocompleteListView {
  position: absolute;
  padding: 8px;
  margin: 0px;
  width: 300px;
  background: white;
  border-radius: 5px;
  border: 1px solid lightgrey;
  z-index: 10;
}

.autocompleteListItem {
  border: 1px solid transparent;
  border-radius: 3px;
  list-style-type: none;
  overflow: hidden;
}

.autocompleteSelectedItem {
  border: 1px solid #99e;
}

.richtext {
  overflow: hidden;
  position: relative;
}

.richtext iframe {
  background: white;
  height: 100%;
  position: absolute;
}

.dropzone {
  -webkit-box-orient: vertical;
  border: 4px dashed #ddd;
  box-sizing: border-box;
  color: #ddd;
  display: -webkit-box;
  font: 270% arial,sans-serif;
  height: 94%;
  margin: 7px;
  position: absolute;
  text-align: center;
  width: 95%;
  z-index: -1;
}

.dropzone .spacer {
  -webkit-box-flex: 1;
}

::-webkit-input-placeholder {
  color: #999;
  font-family: Arial;
  font-size: 13px;
  font-weight: normal;
}

.richtext .placeholder {
  color: #999;
  font-family: Arial;
  font-size: 13px;
  padding: 6px;
  position: absolute;
  z-index: 2;
}

.linkDialog {
  border: 1px solid;
  border-color: #bbb #bbb #a8a8a8;
  padding: 8px;
  z-index: 2;
  background: white;
}


.linkDialog .actionButton-insert {
  background: #4d90fe;
  border-radius: 3px;
  box-shadow: none;
  color: white;
  margin-left: 7px;
  padding: 10px 16px;
  text-shadow: none;
}

.linkDialog input  {
  height: 32px;
  padding-left: 8px;
  margin: 2px;
  border: 1px solid #d9d9d9 !important;
}

.linkDialog input[name="label"] {
  width: 99%;
}

.linkDialog th {
  font: normal 15px arial,sans-serif;
  padding-right: 10px;
}

.actionButton:disabled { color: #bbb; -webkit-filter: grayscale(0.8); }

.editColumnView {
  font-size: 80%;
  font-weight: normal;
  z-index: 2;
}
.editColumnView td {
  color: #0000cc;
  font-size: 80%;
  font-weight: normal;
  padding: 1px;
  text-align2: left;
}

.multiLineStringRemove {
  float: right;
}


.column {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
}

.expand {
  flex: 1 1 auto;
}

.rigid {
  flex: none;
}

.waiting * {
  cursor: wait;
  x-unused: white;
}

input.clickToEnableEdit:not(:focus) {
  border: none;
  background-color: inherit;
}

.galleryView {
  text-align: center;
}

.galleryView .swipeAltInner {
  overflow: hidden;
}

.galleryCirclesOuter {
  float: left;
  text-align: center;
  position: relative;
  width: 100%;
  bottom: 20px;
}

.galleryCircle {
  display: inline-block;
  margin: 5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #aaa;
}

.galleryCircle.selected {
  background-color: #333;
}

.galleryImage {
  width: 100%;
}

.foamTest {
  border: 1px solid black;
  border-radius: 5px;
  line-height: 150%;
  margin: 2px;
  padding: 6px;
}

.foamTestPassed {
  background-color: #cfc;
}

.foamTestFailed {
  background-color: #fcc;
}

.foamInnerTests {
  padding-left: 10px;
}

.foamTestOutput {
  background-color: #e3e3e3;
  margin: 4px;
  padding: 5px;
}

*/})
        ];
        var negEgs = [
        ];
        this.testProduction('stylesheet', posEgs, negEgs);
      }
    }
  ]
});
