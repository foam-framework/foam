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
  name: 'EasyStreamListener',
  extendsModel: 'foam.dao.ProxyDAO',

  requires: [
    'com.google.ow.stream.MultiplexDAO',
    'com.google.ow.stream.SinglePutDAO',
    'com.google.ow.stream.StreamFilterDAO',
    'foam.dao.ProxyDAO',
  ],
  imports: [ 'streamDAO' ],

  models: [
    {
      name: 'PutDAO',
      extends: 'foam.dao.ProxyDAO',

      properties: [
        {
          type: 'Function',
          name: 'onPut',
          defaultValue: null,
        },
      ],

      methods: [
        function put(o, sink) {
          this.onPut && this.onPut(o);
          this.delegate.put(o, sink);
        },
      ],
    },
    {
      name: 'TaggingDAO',
      extends: 'foam.dao.ProxyDAO',

      properties: [
        {
          type: 'String',
          name: 'tag',
          lazyFactory: function() { return createGUID(); },
        },
      ],

      methods: [
        function put(env, sink) {
          env.tags = env.tags.slice();
          env.tags.push(this.tag);
          this.delegate.put(env, sink);
        },
      ],
    },
  ],

  properties: [
    {
      type: 'String',
      name: 'tag',
      lazyFactory: function() { return createGUID(); },
    },
    {
      name: 'streamDAO',
      required: true,
    },
    {
      type: 'StringArray',
      name: 'substreams',
      required: true,
    },
    {
      type: 'Boolean',
      name: 'singlePut',
      defaultValue: false,
    },
    {
      type: 'Function',
      name: 'onPut',
      defaultValue: null,
    },
    {
      type: 'StringArray',
      name: 'people',
    },
    {
      type: 'Function',
      name: 'envelopeFactory',
      defaultValueFn: function() {
        return this.MultiplexDAO.ENVELOPE_FACTORY.defaultValue;
      },
    },
    {
      type: 'Function',
      name: 'dataFactory',
      defaultValueFn: function() {
        return this.MultiplexDAO.DATA_FACTORY.defaultValue;
      },
    },
    {
      name: 'streamFilter',
      lazyFactory: function() {
        return this.StreamFilterDAO.xbind({
          substreams: this.substreams,
        })
      },
    },
    {
      name: 'singlePutDAO',
      lazyFactory: function() {
        return this.SinglePutDAO;
      },
    },
    {
      name: 'multiplexer',
      lazyFactory: function() {
        return this.MultiplexDAO.xbind({
          people: this.people,
          envelopeFactory: this.envelopeFactory,
          dataFactory: this.dataFactory,
        });
      },
    },
    {
      name: 'delegate',
      lazyFactory: function() {
        if ( ! ( this.people.length || this.substreams.length ) )
          throw new Error('Stream listener with infinite loop');

        var dao = this.streamDAO;
        // Bind "tag" last; it MUST be the same for decorators that know about it!
        dao = this.TaggingDAO.create({ tag: this.tag, delegate: dao });
        if ( this.people.length ) dao = this.multiplexer.create({ delegate: dao });
        if ( this.onPut ) dao = this.PutDAO.create({ onPut: this.onPut, delegate: dao });
        if ( this.singlePut ) dao = this.singlePutDAO.create({ delegate: dao });
        if ( this.substreams.length ) dao = this.streamFilter.create({ tag: this.tag, delegate: dao });
        return dao;
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.streamDAO.listen(this);
    },
  ],
});
