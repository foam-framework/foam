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
  package: 'foam.test',
  name: 'Types',

  requires: [
    'IntProperty',
    'FloatProperty',
    'StringProperty',
  ],
  imports: [
    'assert',
    'log',
  ],

  models: [
    {
      name: 'IntModel',
      properties: [
        {
          type: 'Int',
          name: 'defaulty',
        },
        {
          type: 'Int',
          name: 'bounded',
          minValue: -4,
          maxValue: 12,
        },
        {
          type: 'Int',
          name: 'invertedBounds',
          minValue: 200,
          maxValue: 34,
        },
      ],
    },
    {
      name: 'FloatModel',
      properties: [
        {
          type: 'Float',
          name: 'defaulty',
        },
        {
          type: 'Float',
          name: 'bounded',
          minValue: -1.4,
          maxValue: 12.999,
        },
        {
          type: 'Float',
          name: 'invertedBounds',
          minValue: 300.4,
          maxValue: 1.0001,
        },
      ],
    },
    {
      name: 'StringModel',
      properties: [
        {
          type: 'String',
          name: 'defaulty',
        },
        {
          type: 'String',
          name: 'bounded',
          minChars: 10,
          maxChars: 60,
        },
        {
          type: 'String',
          name: 'invertedBounds',
          minValue: 200,
          maxValue: 34,
        },
        {
          type: 'String',
          name: 'invalidLowerBound',
          minValue: -300,
        },
        {
          type: 'String',
          name: 'infiniteBounds',
          maxValue: Infinity,
        },
        {
          type: 'String',
          name: 'regexPatternBasic',
          pattern: '^[abc].*[xyz]$',
        },
      ],
    },
  ],

  methods: [
    function testSetUp() {
    },
    function testTearDown() {
    },
    function loremIpsum(chars) {
      var str = "";
      for (var i=0; i<chars; ++i) {
        str += Math.random() > 0.8 ? " " :
          String.fromCharCode(Math.floor(Math.random() * ((65+(26*2+10)) - 65)) + 65);
      }
      //this.log("String:",str);
      return str;
    },
  ],

  tests: [
    {
      model_: 'UnitTest',
      name: 'IntBounds',
      description: 'IntProperty min/max validation',
      code: function() {
        var m = this.IntModel.create();

        m.defaulty = 0;
        this.assert( ! m.DEFAULTY.validate.call(m), "Unbounded int sets (zero)" );
        m.defaulty = -2000;
        this.assert( ! m.DEFAULTY.validate.call(m), "Unbounded int sets (negative)" );
        m.defaulty = Infinity;
        this.assert( ! m.DEFAULTY.validate.call(m), "Unbounded int sets (infinity)" );

        m.bounded = 4;
        this.assert( ! m.BOUNDED.validate.call(m), "Bounded int allows valid" );

        m.bounded = -6;
        this.assert( m.BOUNDED.validate.call(m), "Bounded int rejects invalid small" );

        m.bounded = 13;
        this.assert( m.BOUNDED.validate.call(m), "Bounded int rejects invalid large" );

        m.bounded = 0;
        this.assert( ! m.BOUNDED.validate.call(m), "Bounded int allows reset back to valid" );

        m.invertedBounds = 10;
        this.assert( m.INVERTED_BOUNDS.validate.call(m), "Inverted bounds rejects all values (small)" );

        m.invertedBounds = 40;
        this.assert( m.INVERTED_BOUNDS.validate.call(m), "Inverted bounds rejects all values (middle)" );

        m.invertedBounds = 250;
        this.assert( m.INVERTED_BOUNDS.validate.call(m), "Inverted bounds rejects all values (large)" );
      }
    },
    {
      model_: 'UnitTest',
      name: 'FloatBounds',
      description: 'FloatProperty min/max validation',
      code: function() {
        var m = this.FloatModel.create();

        m.bounded = -1.4;
        this.assert( ! m.BOUNDED.validate.call(m), "Bounded float allows valid (lower bound)" );
        m.bounded = 12.999;
        this.assert( ! m.BOUNDED.validate.call(m), "Bounded float allows valid (upper bound)" );
        m.bounded = 0;
        this.assert( ! m.BOUNDED.validate.call(m), "Bounded float allows valid (zero)" );

        m.bounded = 12.9999;
        this.assert( m.BOUNDED.validate.call(m), "Bounded float rejects invalid (close to lower bound)" );

        m.bounded = -1.4001;
        this.assert( m.BOUNDED.validate.call(m), "Bounded float rejects invalid (close to upper bound)" );

        m.bounded = 0;
        this.assert( ! m.BOUNDED.validate.call(m), "Bounded float allows reset back to valid" );

        m.invertedBounds = -10;
        this.assert( m.INVERTED_BOUNDS.validate.call(m), "Inverted bounds rejects all values (small)" );

        m.invertedBounds = 40;
        this.assert( m.INVERTED_BOUNDS.validate.call(m), "Inverted bounds rejects all values (middle)" );

        m.invertedBounds = 250;
        this.assert( m.INVERTED_BOUNDS.validate.call(m), "Inverted bounds rejects all values (large)" );
      }
    },
    {
      model_: 'UnitTest',
      name: 'StringBounds',
      description: 'StringProperty min/max character limit validation',
      code: function() {
        var m = this.StringModel.create();

        m.defaulty = this.loremIpsum(0);
        this.assert( ! m.DEFAULTY.validate.call(m), "Unbounded string sets (empty)" );
        m.defaulty = this.loremIpsum(20);
        this.assert( ! m.DEFAULTY.validate.call(m), "Unbounded string sets (medium)" );
        m.defaulty = this.loremIpsum(2000);
        this.assert( ! m.DEFAULTY.validate.call(m), "Unbounded string sets (large)" );

        m.bounded = this.loremIpsum(0);
        this.assert( m.BOUNDED.validate.call(m), "Bounded string rejects empty" );
        m.bounded = this.loremIpsum(8);
        this.assert( m.BOUNDED.validate.call(m), "Bounded string rejects small" );
        m.bounded = this.loremIpsum(30);
        this.assert( ! m.BOUNDED.validate.call(m), "Bounded string accepts valid" );
        m.bounded = this.loremIpsum(77);
        this.assert( m.BOUNDED.validate.call(m), "Bounded string rejects large" );

        m.invertedBounds = this.loremIpsum(1);
        this.assert( ! m.INVERTED_BOUNDS.validate.call(m), "Inverted bounds rejects (small)" );
        m.invertedBounds = this.loremIpsum(34);
        this.assert( ! m.INVERTED_BOUNDS.validate.call(m), "Inverted bounds rejects (medium)" );
        m.invertedBounds = this.loremIpsum(9400);
        this.assert( ! m.INVERTED_BOUNDS.validate.call(m), "Inverted bounds rejects (large)" );

        m.invalidLowerBound = this.loremIpsum(0);
        this.assert( ! m.INVALID_LOWER_BOUND.validate.call(m), "Invalid lower bound string accepts empty (as if lower bound was zero)" );
        m.invalidLowerBound = this.loremIpsum(10);
        this.assert( ! m.INVALID_LOWER_BOUND.validate.call(m), "Invalid lower bound string accepts small (as if lower bound was zero)" );

        m.infiniteBounds = this.loremIpsum(100);
        this.assert( ! m.INFINITE_BOUNDS.validate.call(m), "Infinite upper bound string accepts medium" );
        m.infiniteBounds = this.loremIpsum(9999);
        this.assert( ! m.INFINITE_BOUNDS.validate.call(m), "Infinite upper bound string accepts large" );

      }
    },
    {
      model_: 'UnitTest',
      name: 'StringPattern',
      description: 'StringProperty.pattern basic regex validation',
      code: function() {
        var m = this.StringModel.create();

        var matchesBasicPattern = [
          "aFDHRIVNKJENx",
          "baaxx435i54980uj39j 980j   980 ij 0aaa 0-9ja 9j0z",
        ];
        var notMatchesBasicPattern = [
          "54lkj5lkj kjlkrg",
          "x43534oinkj dlfaaz",
          "daakjj89nnhu98nhz7", // there's a substring that would match, but we want the whole string to match
        ];

        matchesBasicPattern.forEach(function(val) {
          m.defaulty = val;
          this.assert( ! m.DEFAULTY.validate.call(m), "No pattern, anything ok "+val );
        }.bind(this));
        notMatchesBasicPattern.forEach(function(val) {
          m.defaulty = val;
          this.assert( ! m.DEFAULTY.validate.call(m), "No pattern, anything ok "+val );
        }.bind(this));

        matchesBasicPattern.forEach(function(val) {
          m.regexPatternBasic = val;
          this.assert( ! m.REGEX_PATTERN_BASIC.validate.call(m), "Matches pattern "+val );
        }.bind(this));

        notMatchesBasicPattern.forEach(function(val) {
          m.regexPatternBasic = val;
          this.assert( m.REGEX_PATTERN_BASIC.validate.call(m), "Not match pattern "+val );
        }.bind(this));
      }
    },
    {
      model_: 'UnitTest',
      name: 'DynamicDependencies',
      description: 'IntProperty check that the validate() generated has proper .dependencies listed',
      code: function() {
        var m = this.IntModel.create();
        this.assert( ! m.DEFAULTY.validate.dependencies.length, "No deps on unbounded int" );
        this.assert( m.BOUNDED.validate.dependencies[0] == 'bounded', "Bounded int has 'bounded' dep" );

        var m = this.StringModel.create();
        this.assert( ! m.DEFAULTY.validate.dependencies.length, "No deps on unbounded string" );
        this.assert( m.BOUNDED.validate.dependencies[0] == 'bounded', "Bounded string has 'bounded' dep" );

      }
    },
  ],
});
