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
  package: 'foam.apps.builder',
  name: 'XHRManager',

  requires: [
    'XHR',
  ],

  constants: {
    CONTENT_TYPES: {
      'null': 'text/plain',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
    },
    RESPONSE_TYPES: {
      'null': 'text',
      png: 'arraybuffer',
      jpg: 'arraybuffer',
      jpeg: 'arraybuffer',
      gif: 'arraybuffer',
    },
  },

  models: [
    {
      name: 'Binding',
      properties: ['pattern', 'value'],
    },
    {
      name: 'ManagedXHR',
      extendsModel: 'XHR',

      methods: [
        function asend(ret, url, data, method, headers) {
          var xhr = this.makeXhr();
          this.open(xhr, method || "GET", url);
          this.configure(xhr);
          this.bindListeners(xhr, ret);

          // Optionally inject headers before send.
          if ( headers ) {
            Object_forEach(headers, function(value, key) {
              this.setRequestHeader(xhr, key, value);
            }.bind(this));
          }

          this.send(xhr, (data && data.toJSON) ? data.toJSON() : data);
        },
      ],
    },
  ],

  properties: [
    {
      model_: 'ArrayProperty',
      name: 'authBindings',
      lazyFactory: function() { return []; },
    },
    {
      model_: 'ArrayProperty',
      name: 'headerBindings',
      lazyFactory: function() { return []; },
    },
  ],

  methods: [
    function bindAuthAgent(pattern, authAgent) {
      this.authBindings.push(this.Binding.create({
        pattern: pattern,
        value: authAgent,
      }, this.Y));
    },
    function bindHeaders(pattern, headers) {
      this.headerBindings.push(this.Binding.create({
        pattern: pattern,
        value: headers,
      }, this.Y));
    },
    function getAuthAgent(url) {
      var authAgent = '';
      for ( var i = 0; i < this.authBindings.length; ++i ) {
        if ( url.match(this.authBindings[i].pattern) )
          authAgent = this.authBindings[i].value;
      }
      return authAgent;
    },
    function getHeaders(url) {
      var headers = {};
      for ( var i = 0; i < this.headerBindings.length; ++i ) {
        if ( url.match(this.headerBindings[i].pattern) ) {
          Object_forEach(this.headerBindings[i].value, function(value, key) {
            headers[key] = value;
          });
        }
      }
      return headers;
    },
    function asend(ret, url, data, method) {
      // Getting files: Attempt to guess content and response types.
      if ( ( ! method ) || method.toUpperCase() === 'GET' ) {
        var match = url.match(/[.]([^.]+)$/);
        var xtn = ( match && match[1].toLowerCase() ) || null;
        var contentType = this.CONTENT_TYPES[xtn];
        var responseType = this.RESPONSE_TYPES[xtn];
      }

      // For FormData, do not override default content type.
      if ( data instanceof FormData ) {
        contentType = '';
      }

      var authAgent = this.getAuthAgent(url);

      // Assume authenticate exchanges return a well-formed JSON response.
      if ( authAgent ) {
        responseType = 'json';
      }

      var headers = this.getHeaders(url);

      this.ManagedXHR.create({
        contentType: contentType,
        responseType: responseType,
        authAgent: authAgent,
      }, this.Y).asend(ret, url, data, method, headers);
    },
  ],
});
