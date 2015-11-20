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
  name: 'MultiplexDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [ 'com.google.ow.model.Envelope' ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'tag',
      lazyFactory: function() { return createGUID(); },
    },
    {
      model_: 'StringArrayProperty',
      name: 'people',
    },
    {
      model_: 'FunctionProperty',
      name: 'envelopeFactory',
      defaultValue: function(baseEnv, pid) {
        var env = baseEnv.clone();

        // Tag envelope as seen.
        var tags = baseEnv.tags.slice();
        tags.push(this.tag);
        env.tags = tags;

        // Put new envelope only when putting to different owner;
        // otherwise put same envelope back.
        env.id = baseEnv.owner !== pid ?
            baseEnv.id + '-' + pid : env.id;
        env.timestamp = new Date();
        env.owner = pid;
        env.data = this.dataFactory(baseEnv.data, pid);
        return env;
      },
    },
    {
      model_: 'FunctionProperty',
      name: 'dataFactory',
      defaultValue: function(data, pid) {
        return data.clone();
      },
    },
  ],

  methods: [
    function put(env) {
      // Put to everyone.
      this.people.forEach(function(pid) {
        this.delegate.put(this.envelopeFactory(env, pid));
      }.bind(this));
    },
  ],
});
