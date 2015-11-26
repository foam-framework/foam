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
          declRHS: str(plus(
              alt(sym('url'),
              // Alpha-num-punct, but not "{", "}" or ";".
              str(plus(alt(sym('anp'), '(', ')', ':')))),
              sym('wsp_'))),
          url: seq('url(', str(repeat(alt(sym('anp'), ':', ';', '{', '}', '('))), ')'),
        }.addActions({
          url: function(parts) {
            // TODO(markdittmer): Skip over URLs that are already data URLs.
            css.urls[parts[1]] = parts[1];
            return parts.join('');
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
