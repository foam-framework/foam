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
  name: 'CSSDecl',

  imports: [ 'assert' ],

  documentation: function() {/* A <b>very permissive</b> ASCII CSS parser that
    rewrites a handful of declarations (decls) to add browser compatability
    prefixed versions. Non-whitespace characters are assumed to be plain-old
    ASCII characters.
  */},

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
    },
  },

  properties: [
    {
      name: 'parser',
      lazyFactory: function() {
        return SkipGrammar.create(this.parser_, seq('/*', repeat(not('*/', anyChar)), '*/'));
      },
    },
    {
      name: 'parser_',
      lazyFactory: function() {
        var css = this;
        return {
          __proto__: grammar,

          START: sym('stylesheet'),

          ws: alt(' ', '\t', '\n', '\r', '\f'),
          wsc: alt(sym('ws'), ','),
          ws_: repeat0(sym('ws')),
          wsp_: plus0(sym('ws')),

          alphaNum: alt(
              '-',
              range('a', 'z'),
              range('A', 'Z'),
              range('0', '9')),
          // Excludes: ":", ";", "{", "}", "(", ")", ",".
          punct: alt(
              range('!', "'"),
              range('*', '+'),
              range('-', '/'),
              range('<', '@'),
              range('[', '`'),
              '|',
              '~'),
          // Alpha-num-punct (excludes: ":", ";", "{", "}", "(", ")", ",").
          anp: alt(sym('alphaNum'), sym('punct')),

          stylesheet: str(seq(
              sym('ws_'),
              str(repeat(alt(
                  sym('stmtRule'),
                  sym('blockRule')),
                sym('ws_'))))),

          rulePrefix: plus(
              // Alpha-num-punct, but not ";" "{", or "}".
              str(plus(alt(sym('anp'), ',', '(', ')', ':'))),
              sym('wsp_')),
          stmtRule: str(seq(sym('rulePrefix'), ';')),
          blockRule: str(seq(sym('rulePrefix'), sym('block'))),
          blockList: str(plus(sym('blockRule'), sym('ws_'))),

          fnArgs: seq('(',
                      sym('ws_'),
                      str(repeat(sym('fnArg'))),
                      ')'),
          // Cannot use repeat(content, separator) because we need to retain
          // separator value.
          fnArg: seq(str(plus(alt(sym('fnArgs'),
                                  sym('fnArgIdent')))),
                     repeat(sym('wsc'))),
          fnArgIdent: str(plus(alt(sym('anp'), '{', '}', ';', ':'))),

          // Alpha-num-punct, but not "{", "}" or ":".
          declLHS: str(plus(alt(sym('anp'), ',', '(', ')', ';'))),
          declRHS: plus(str(plus(alt(sym('fnArgs'),
                                     sym('declRHSIdent')))),
                        sym('wsp_')),
          // Alpha-num-punct, but not "{", "}", "(", ")", or ";".
          declRHSIdent: str(plus(alt(sym('anp'), ',', ':'))),
          decl: seq(
              sym('declLHS'),
              sym('ws_'),
              ':',
              sym('ws_'),
              sym('declRHS')),
          declList: plus(sym('decl'), seq(';', sym('ws_'))),

          block: seq(
              '{',
              sym('ws_'),
              optional(alt(
                  sym('blockList'),
                  sym('declList'))),
              '}'),
        }.addActions({
          rulePrefix: function(parts) {
            // Look for ^ signs, and turn them into the model name.
            parts = parts.map(function(p) {
              return p.indexOf('^') >= 0 ? p.replace(/\^/g, css.modelName_ + '-') : p;
            });
            return parts.join(' ');
          },
          block: function(parts) {
            return '{' + (parts[2] ? parts[2] : '') + '}';
          },
          declList: function(parts) {
            return parts.join(';');
          },
          declRHS: function(parts) {
            return parts.join(' ');
          },
          decl: function(parts) {
            var key = parts[0];
            var value = parts[4];
            var data = css.PREFIXED_KEYS[key];
            if ( ! data || css.PREFIXES.length === 0 ) return key + ':' + value;

            var rtn = '';
            if ( data === true || data === value ) {
              for ( var i = 0; i < css.PREFIXES.length; ++i ) {
                var prefix = css.PREFIXES[i];
                if ( data === true ) rtn += prefix + key + ':' + value + ';';
                else                 rtn += key + ':' + prefix + value + ';';
              }
            }
            rtn += key + ':' + value;
            return rtn;
          },
          fnArg: function(parts) {
            return parts[0] + (parts[1].indexOf(',') >= 0 ? ', ' : ' ');
          },
          fnArgs: function(parts) {
            return '(' + parts[2].trim() + ')';
          },
        });
      },
    },
    {
      name: 'model',
      documentation: 'Optional model which contains this CSS template. Used ' +
          'to expand ^ signs in CSS selectors to the model name.',
      postSet: function(old, nu) {
        if (nu) {
          // Need to buildPrototype to make sure things like constants get
          // properly populated. Otherwise the CSS_CLASS constant is not
          // honoured.
          nu.buildPrototype();
          this.modelName_ = nu.CSS_CLASS || cssClassize(nu.id);
        }
      },
    },
    {
      name: 'modelName_',
      documentation: 'The converted model name itself.',
      adapt: function(old, nu) {
        // Turns 'foo-bar quux' into '.foo-bar.quux'
        return '.' + nu.split(/ +/).join('.');
      }
    },
  ],
});
