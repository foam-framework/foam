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
  package: 'foam.ui',
  name: 'CSSFunction',

  constants: {
    NUM_REG_EX_STR: '[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([e][+-?][0-9]+)?',
    INT_REG_EX_STR: '[0-9]+',
  },

  properties: [
    {
      type: 'String',
      name: 'name',
    },
    {
      type: 'Array',
      name: 'args',
      lazyFactory: function() { return []; },
    },
    {
      name: 'regExStr',
      lazyFactory: function() {
        var n = this.NUM_REG_EX_STR;
        var i = this.INT_REG_EX_STR;
        var wsn = '\\s*(' + n + ')\\s*';
        var wsi = '\\s*(' + i + ')\\s*';
        var nargs = function(x, str) {
          var ret = '';
          for ( var j = 0; j < x; ++j ) {
            ret += str;
            if ( j + 1 < x ) ret += ',';
          }
          return ret;
        };
        return '(cubic-bezier[(]' + nargs(4, wsn) + '[)]|' +
            'steps[(]' + wsi + ',\\s*(start|end)\\s*[)]|' +
            'linear|' +
            'ease|' +
            'ease-in|' +
            'ease-in-out|' +
            'ease-out|' +
            'step-start|' +
            'step-end)';
      },
    },
  ],

  methods: [
    function fromString(s) {
      if ( ! s ) return null;
      var match = this.fromString_(s);
      if ( ! match ) return null;
      var full = match[0];
      var args;
      if ( full.indexOf('cubic-bezier') === 0 ) {
        args = [
          parseFloat(match[2]),
          parseFloat(match[6]),
          parseFloat(match[10]),
          parseFloat(match[14]),
        ];
        if ( args.some(function(a) { return Number.isNaN(a); }) ) return null;
        this.name = 'cubic-bezier';
        this.args = args;
      } else if ( full.indexOf('steps') === 0 ) {
        args = [
          parseInt(match[18]),
          match[19],
        ];
        if ( Number.isNaN(args[0]) ) return null;
        this.name = 'steps';
        this.args = args;
      } else {
        this.name = full;
      }
      return this;
    },
    function fromString_(s) {
      var re = new RegExp('^' + this.regExStr + '$', 'g');
      return re.exec(s);
    },
    function toString() {
      return this.args.length > 0 ?
          this.name + '(' +
          this.args.map(function(a) { return a.toString(); }).join(',') +
          ')' : this.name;
    },
  ],
});
