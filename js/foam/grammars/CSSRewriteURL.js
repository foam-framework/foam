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
  name: 'CSSRewriteURL',

  requires: [
    'XHR',
    'foam.grammars.CSSDecl',
    'foam.util.Base64Encoder',
  ],

  documentation: function() {/* A slightly modified
    $$DOC{ref:'foam.grammars.CSSDecl'} prefix-rewrite parser that also knows how
    to expand remote URLs to dataURLs after fetching the data.
  */},

  properties: [
    {
      name: 'urls',
      lazyFactory: function() { return {}; },
    },
    {
      name: 'declParser',
      lazyFactory: function() { return this.CSSDecl.create(); },
    },
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
          __proto__: this.declParser.parser_,
          declRHS: plus(plus(alt(sym('fnArgs'),
                                 sym('declRHSIdent'))),
                        sym('wsp_')),
        }.addActions({
          declRHS: function(parts) {
            var rtn = [];
            for ( var i = 0; i < parts.length; ++i ) {
              var fragment = parts[i];
              rtn.push(fragment.join(''));
              for ( var j = 0; j < fragment.length - 1; ++j ) {
                var name = fragment[j];
                var args = fragment[j + 1];
                if ( ! (name === 'url' && args.charAt(0) === '(') ) continue;
                var url = (args.charAt(1) === '"' || args.charAt(1) === "'") ?
                    args.slice(2, -2) : // Drop parens and quotes.
                    args.slice(1, -1);  // Drop parens.
                if ( url.slice(0, 5) === 'data:' ) continue;
                css.urls[url] = url;
              }
            }
            return rtn.join(' ');
          },
        });
      },
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
