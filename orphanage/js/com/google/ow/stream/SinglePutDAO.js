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
  package: 'com.google.ow.stream',
  name: 'SinglePutDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [ 'com.google.ow.model.Envelope' ],

  properties: [
    {
      type: 'String',
      name: 'tag',
      lazyFactory: function() { return createGUID(); },
    },
    {
      name: 'model',
      lazyFactory: function() { return this.Envelope; },
    },
    {
      name: 'property',
      lazyFactory: function() { return this.model.ID; },
    },
    {
      type: 'Function',
      name: 'stringify',
      defaultValue: function(id) { return id.toString(); },
    },
    {
      name: 'cache_',
      lazyFactory: function() { return {}; },
    },
  ],

  methods: [
    function put(env, sink) {
      // Only put objects not yet seen.
      var key = this.stringify(this.property.f(env));
      if ( ! this.cache_[key] ) {
        this.cache_[key] = true;
        this.delegate.put(env, sink);
      } else {
        console.log('Multiple puts on', key);
        sink && sink.error && sink.error();
      }
    },
  ],
});
