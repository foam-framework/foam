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
  name: 'NewConnectionListener',

  requires: [
    'com.google.ow.model.Envelope',
    'com.google.ow.stream.MultiplexDAO',
    'com.google.ow.stream.EasyStreamListener',
  ],

  properties: [
    {
      name: 'streamDAO',
      required: true,
    },
    {
      model_: 'StringArrayProperty',
      name: 'substreams',
      required: true,
    },
    {
      model_: 'FunctionProperty',
      name: 'getConnectionSubstreams',
      defaultValue: function(env) {
        return [ '/' + env.data.id ];
      },
    },
    {
      model_: 'FunctionProperty',
      name: 'getPeople',
      required: true,
      defaultValue: function(env) {
        throw new Error('NewConnectionListener missing people getter');
      },
    },
    {
      model_: 'BooleanProperty',
      name: 'singlePut',
      defaultValue: true,
    },
    {
      model_: 'BooleanProperty',
      name: 'forwardSignalEnvelope',
      defaultValue: true,
    },
    {
      model_: 'BooleanProperty',
      name: 'createClientForSource',
      defaultValue: false,
    },
    {
      model_: 'FunctionProperty',
      name: 'streamDataFactory',
      defaultValueFn: function() {
        return this.MultiplexDAO.DATA_FACTORY.defaultValue;
      },
    },
    {
      model_: 'FunctionProperty',
      name: 'streamClientFactory',
    },
    {
      model_: 'FunctionProperty',
      name: 'streamClientEnvelopeFactory',
      defaultValue: function(inputEnv, pid) {
        var data = this.streamClientFactory(inputEnv, pid);
        return data ? this.Envelope.create({
          source: inputEnv.source,
          owner: pid,
          data: data,
        }) : null;
      },
    },
    {
      model_: 'FunctionProperty',
      name: 'connectionListenerFactory',
      defaultValue: function(env) {
        return this.EasyStreamListener.create({
          streamDAO: this.streamDAO,
          substreams: this.getConnectionSubstreams(env),
          people: this.getPeople(env),
          dataFactory: this.streamDataFactory,
        });
      },
    },
    {
      model_: 'FunctionProperty',
      name: 'onNewConnection',
      defaultValue: function(env) {
        var people = this.getPeople(env);
        for ( var i = 0; i < people.length; ++i ) {
          if ( people[i] === env.source && ! this.createClientForSource ) continue;
          var clientEnv = this.streamClientEnvelopeFactory(env, people[i]);
          if ( clientEnv ) this.streamDAO.put(clientEnv);
        }
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      console.log('*** NEW CONNECTION LISTENER ON', this.substreams.join(', '));
      this.EasyStreamListener.create({
        streamDAO: this.streamDAO,
        substreams: this.substreams,
        singlePut: this.singlePut,
        onPut: function(env) {
          this.connectionListenerFactory(env);
          this.onNewConnection(env);
          if ( this.forwardSignalEnvelope && this.substreams.length ) {
            var substream = this.getConnectionSubstreams(env);
            var fwdEnv = env.clone();
            fwdEnv.id = env.id + '-' + substream;
            fwdEnv.sid = substream;
            console.log('*** FORWARD SIGNAL ENVELOPE AS', fwdEnv.id, 'ON', fwdEnv.sid);
            this.streamDAO.put(fwdEnv);
          }
        }.bind(this),
      });
    },
  ],
});
