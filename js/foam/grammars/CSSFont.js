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
  name: 'CSSFont',

  requires: [
    'XHR',
    'foam.util.Base64Encoder',
  ],
  imports: [
    'assert',
    'document',
  ],

  documentation: function() {/* A slightly modified
    $$DOC{ref:'foam.grammars.CSSDecl'} prefix-rewrite parser that also knows how
    to expand remote URLs to dataURLs after fetching the data.
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
      name: 'urls',
      lazyFactory: function() { return {}; },
    },
    {
      name: 'parser',
      lazyFactory: function() {
        var css = this;
        var s = function() { return str(seq.apply(this, arguments)); };
        var r = function() { return str(repeat.apply(this, arguments)); };
        var p = function() { return str(plus.apply(this, arguments)); };
        return SkipGrammar.create({
          __proto__: grammar,

          START: sym('stylesheet'),

          ws: alt(' ', '\t', '\n', '\r', '\f'),
          ws_: repeat0(sym('ws')),
          wsp_: plus0(sym('ws')),

          alphaNum: alt(
              '-',
              range('a', 'z'),
              range('A', 'Z'),
              range('0', '9')),
          // Excludes: ":", ";", "{", "}", "(", ")".
          punct: alt(
              range('!', "'"),
              range('*', '/'),
              range('<', '@'),
              range('[', '`'),
              '|',
              '~'),
          // Alpha-num-punct (excludes: ":", ";", "{", "}", "(", ")").
          anp: alt(sym('alphaNum'), sym('punct')),

          stylesheet: s(
              sym('ws_'),
              r(alt(
                  sym('stmtRule'),
                  sym('blockRule')),
                sym('ws_'))),

          rulePrefix: plus(
              // Alpha-num-punct, but not ";" "{", or "}".
              p(alt(sym('anp'), '(', ')', ':')),
              sym('wsp_')),
          stmtRule: s(sym('rulePrefix'), ';'),
          blockRule: s(sym('rulePrefix'), sym('block')),
          blockList: p(sym('blockRule'), sym('ws_')),

          // Alpha-num-punct, but not "{", "}" or ":".
          declLHS: p(alt(sym('anp'), '(', ')', ';')),
          declRHS: plus(
              alt(sym('url'),
              // Alpha-num-punct, but not "{", "}" or ";".
              p(alt(sym('anp'), '(', ')', ':'))),
              sym('wsp_')),
          decl: seq(
              sym('declLHS'),
              sym('ws_'),
              ':',
              sym('ws_'),
              sym('declRHS')),
          declList: plus(sym('decl'), seq(';', sym('ws_'))),

          url: seq('url(', r(alt(sym('anp'), ':', ';', '{', '}', '(')), ')'),

          block: seq(
              '{',
              sym('ws_'),
              optional(alt(
                  sym('blockList'),
                  sym('declList'))),
              '}'),
        }.addActions({
          rulePrefix: function(parts) {
            // Look for $ signs, and turn them into the model name.
            parts = parts.map(function(p) {
              return p.indexOf('$') >= 0 ? p.replace(/\$/g, css.modelName_) : p;
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
          url: function(parts) {
            css.urls[parts[1]] = parts[1];
            return parts.join('');
          },
        }), seq('/*', repeat(not('*/', anyChar)), '*/'));
      },
    },
    {
      name: 'model',
      documentation: 'Optional model which contains this CSS template. Used ' +
          'to expand $ signs in CSS selectors to the model name.',
      postSet: function(old, nu) {
        if (nu) this.modelName_ = nu.CSS_CLASS || cssClassize(nu.id);
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

  methods: [
    function afromUrl(ret, url) {
        this.XHR.create({
          responseType: 'text',
          contentType: '',
        }).asend(function(data, xhr, status) {
          if ( ! status ) { ret(''); return; }
          var css = data;
          this.aparseString(ret, css);
        }.bind(this), url);
    },
    function aparseString(ret, str) {
      var p = this.parser;
      var ps = p.stringPS;
      ps.str = str;
      var res = p.parse(p.START, ps);
      if ( ! (res && typeof res.value === 'string' && res.toString() === '') ) {
        ret(undefined);
        return;
      }
      var css = res.value;
      this.awithDataUrls(ret, css);
    },
    function awithDataUrls(ret, str) {
      var b64e = this.Base64Encoder.create();
      var par = [];

      Object_forEach(this.urls, function(url) {
        par.push(function(ret) {
          this.XHR.create({
            responseType: 'arraybuffer',
            contentType: '',
          }).asend(function(data, xhr, status) {
            if ( ! status ) {
              ret();
              return;
            }
            str = str.replace(
                new RegExp(
                    // RegExp-escape url string.
                    url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
                'data:' + xhr.getResponseHeader('Content-Type') + ';base64,' + b64e.encode(data));
            ret();
          }, url);
        }.bind(this));
      });
      apar.apply(null, par)(function() { ret(str); });
    },
  ],
});
