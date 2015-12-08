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
  package: 'foam.apps.builder.model.regex',
  name: 'RegexTests',

  requires: [
    'foam.apps.builder.model.regex.EasyRegex',
    'foam.apps.builder.model.regex.ContainsRegex',
    'foam.apps.builder.model.regex.NotContainsRegex',
    'foam.apps.builder.model.regex.MatchesRegex',
    'foam.apps.builder.model.regex.NotMatchesRegex',
  ],
  imports: [
    'assert',
    'log',
  ],

  models: [
    {
      name: 'StringModel',
      properties: [
        {
          type: 'String',
          name: 'defaulty',
        },
        {
          type: 'String',
          name: 'regexContains',
          pattern: {
            model_: 'foam.apps.builder.model.regex.ContainsRegex',
            parameter: 'abc',
          },
        },
        {
          type: 'String',
          name: 'regexContainsDirty',
          pattern: {
            model_: 'foam.apps.builder.model.regex.ContainsRegex',
            parameter: '[def]',
          },
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
      name: 'RegexContains',
      description: 'ContainsRegex validator test',
      code: function() {
        var m = this.StringModel.create();

        var matchesPattern = [
          "kjhlkjhlkabckjlrkjh43l",
          "abs;lkdfjdjnc alkjlkjfabc",
        ];
        var notMatchesPattern = [
          "abdc",
          "dsflksjaflkjbc",
          "ssdk",
        ];

        matchesPattern.forEach(function(val) {
          m.regexContains = val;
          this.assert( ! m.REGEX_CONTAINS.validate.call(m), "Contains "+val );
        }.bind(this));
        notMatchesPattern.forEach(function(val) {
          m.regexContains = val;
          this.assert( m.REGEX_CONTAINS.validate.call(m), "Does not contain "+val );
        }.bind(this));

      }
    },
    {
      model_: 'UnitTest',
      name: 'RegexContainsDirty',
      description: 'ContainsRegex validator test with a pattern that needs to be sanitized',
      code: function() {
        var m = this.StringModel.create();

        var matchesPattern = [
          "[def]",
          "xcv,mnxc,mnv[def]svcxmnc",
        ];
        var notMatchesPattern = [
          "d",
          "edf",
          "def",
        ];

        matchesPattern.forEach(function(val) {
          m.regexContainsDirty = val;
          this.assert( ! m.REGEX_CONTAINS_DIRTY.validate.call(m), "Contains literal string "+val );
        }.bind(this));
        notMatchesPattern.forEach(function(val) {
          m.regexContainsDirty = val;
          this.assert( m.REGEX_CONTAINS_DIRTY.validate.call(m), "Does not contain matches to the unsanitized regex "+val );
        }.bind(this));

      }
    },
  ],
});
