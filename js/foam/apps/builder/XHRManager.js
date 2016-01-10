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
    'foam.apps.builder.XHRBinding',
  ],
  imports: [
    'xhrAuthBindings$ as inAuthBindings$',
    'xhrHeaderBindings$ as inHeaderBindings$',
  ],
  exports: [
    'authBindings as xhrAuthBindings',
    'headerBindings as xhrHeaderBindings',
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
      name: 'ManagedXHR',
      extends: 'XHR',

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
      type: 'Array',
      subType: 'foam.apps.builder.XHRBinding',
      name: 'inAuthBindings',
      lazyFactory: function() { return []; },
      postSet: function() { this.onAuthBindingsChange(); },
    },
    {
      type: 'Array',
      subType: 'foam.apps.builder.XHRBinding',
      name: 'inHeaderBindings',
      lazyFactory: function() { return []; },
      postSet: function() { this.onHeaderBindingsChange(); },
    },
    {
      type: 'Array',
      subType: 'foam.apps.builder.XHRBinding',
      name: 'authBindings',
      lazyFactory: function() {
        return this.inAuthBindings.concat(this.outAuthBindings);
      },
    },
    {
      type: 'Array',
      subType: 'foam.apps.builder.XHRBinding',
      name: 'headerBindings',
      lazyFactory: function() {
        return this.inHeaderBindings.concat(this.outHeaderBindings);
      },
    },
    {
      type: 'Array',
      subType: 'foam.apps.builder.XHRBinding',
      name: 'outAuthBindings',
      lazyFactory: function() { return []; },
      postSet: function() { this.onAuthBindingsChange(); },
    },
    {
      type: 'Array',
      subType: 'foam.apps.builder.XHRBinding',
      name: 'outHeaderBindings',
      lazyFactory: function() { return []; },
      postSet: function() { this.onHeaderBindingsChange(); },
    },
  ],

  methods: [
    function bindAuthAgent(pattern, authAgent) {
      var binding = this.XHRBinding.create({
        pattern: pattern,
        value: authAgent,
      }, this.Y);
      this.outAuthBindings = this.outAuthBindings.pushF(binding);
      return binding;
    },
    function unbindAuthAgent(binding) {
      this.outAuthBindings = this.outAuthBindings.deleteF(binding);
      return binding;
    },
    function bindHeaders(pattern, headers) {
      var binding = this.XHRBinding.create({
        pattern: pattern,
        value: headers,
      }, this.Y);
      this.outHeaderBindings = this.outHeaderBindings.pushF(binding);
      return binding;
    },
    function unbindHeaders(binding) {
      this.outHeaderBindings = this.outHeaderBindings.deleteF(binding);
      return binding;
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
        var match = url.match(/[.]([^.?]+)([?][^#]*)?([#].*)?$/);
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

  listeners: [
    {
      name: 'onAuthBindingsChange',
      code: function() {
        this.authBindings = this.inAuthBindings.concat(this.outAuthBindings);
      },
    },
    {
      name: 'onHeaderBindingsChange',
      code: function() {
        this.headerBindings =
            this.inHeaderBindings.concat(this.outHeaderBindings);
      },
    },
  ],
});
