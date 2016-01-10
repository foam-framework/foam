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
      type: 'StringArray',
      name: 'people',
    },
    {
      type: 'Boolean',
      name: 'repackageOriginal',
      defaultValue: false,
    },
    {
      type: 'Function',
      name: 'envelopeFactory',
      defaultValue: function(baseEnv, pid) {
        var env = baseEnv.clone();
        env.id = baseEnv.id + '-' + pid;
        env.timestamp = new Date();
        env.owner = pid;
        env.data = this.dataFactory(baseEnv.data, pid);
        return env;
      },
    },
    {
      type: 'Function',
      name: 'dataFactory',
      defaultValue: function(data, pid) {
        return data.clone();
      },
    },
    {
      type: 'Function',
      name: 'putTo',
      defaultValue: function(env, sink, pid) {
        this.delegate.put(this.envelopeFactory(env, pid), sink);
      },
    },
  ],

  methods: [
    function getSharedSink_(env, sink, numOps) {
      var ownerEnv = null;
      var self = this;
      var ops = self.people.length + 1;
      var count = 0;
      var err = false;
      return {
        put: function(putEnv) {
          if ( err ) return;
          if ( putEnv.owner === env.owner ) ownerEnv = putEnv;
          ++count;
          if ( count === numOps ) sink && sink.put && sink.put(ownerEnv);
        },
        remove: function() {
          if ( err ) return;
          ++count;
        },
        error: function() {
          err = true;
          sink.error.apply(sink, arguments);
        }
      };
    },
    function put(env, sink) {
      var sharedSink = sink ?
          this.getSharedSink_(env, sink, self.people.length + 1) : null;
      if ( this.repackageOriginal )
        this.delegate.remove(env, sharedSink);
      for ( var i = 0; i < this.people.length; ++i ) {
        var pid = this.people[i];
        if ( this.repackageOriginal || pid !== env.owner )
          this.putTo(env, sharedSink, pid);
      }
      // var sinkError = sink && sink.error ? sink.error.bind(sink) : nop;
      // var putToNext = function(i) {
      //   if ( i >= self.people.length ) {
      //     sink && sink.put && sink.put(ownerEnv);
      //     return;
      //   }
      //   var pid = self.people[i];
      //   var pidEnv = this.envelopeFactory(env, pid);
      //   if ( pid === env.owner ) ownerEnv = pidEnv;
      //   this.delegate.put(pidEnv, {
      //     put: putToNext.bind(this, i + 1),
      //     error: sinkError,
      //   });
      // };
      // // Remove original envelope for replacement with multipliexed versions.
      // this.delegate.remove(env, {
      //   remove: putToNext.bind(this, 0),
      //   error: putToNext.bind(this, 0)
      // });
      // Put to everyone.
      // this.people.forEach(function(pid) {
      //   // Notify sink when we put for the original owner.
      //   if ( pid === env.owner ) this.putTo(env, pid, sink);
      //   else                     this.putTo(env, pid);
      // }.bind(this));
    },
  ],
});
