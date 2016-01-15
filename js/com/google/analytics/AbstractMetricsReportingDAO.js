/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  name: 'AbstractMetricsReportingDAO',
  package: 'com.google.analytics',
  extends: 'AbstractDAO',

  properties: [
    {
      type: 'String',
      name: 'propertyId',
      transient: true
    },
    {
      type: 'String',
      name: 'clientId',
      factory: function() {
        return createGUID();
      }
    },
    {
      type: 'String',
      name: 'appName',
      transient: true
    },
    {
      type: 'String',
      name: 'appId',
      transient: true
    },
    {
      type: 'String',
      name: 'appVersion',
      transient: true
    },
    {
      type: 'StringArray',
      name: 'endpoints',
      factory: function() { return [ 'http://www.google-analytics.com/collect' ]; },
      transient: true
    }
  ],

  methods: {
    put: function(o, sink) {
      var data = [
        'v=1',
        'tid=' + this.propertyId,
        'cid=' + this.clientId,
        'qt=' + (Date.now() - o.created)
      ];

      if ( this.appName ) {
        data.push('an=' + this.appName);
      }
      if ( this.appId ) {
        data.push('aid=' + this.appId);
      }
      if ( this.appVersion ) {
        data.push('av=' + this.appVersion);
      }

      if ( o.type === 'timing' ) {
        data.push('t=timing');
        data.push('utc=' + encodeURIComponent(o.subType));
        data.push('utv=' + encodeURIComponent(o.name));
        data.push('utt=' + o.value);
      } else if ( o.type === 'error' ) {
        data.push('t=exception');
        data.push('exd=' + encodeURIComponent(o.name));
        data.push('exf=' + (o.isFatal ? '1' : '0'));
      } else if ( o.type === 'pageview' ) {
        data.push('t=pageview');
        data.push('dl=', encodeURIComponent(o.url));
      } else if ( o.type === 'screenview' ) {
        data.push('t=screenview');
        data.push('cd=' + encodeURIComponent(o.name));
      } else {
        data.push('t=event');
        data.push('ec=' + encodeURIComponent(o.subType));
        data.push('ea=' + encodeURIComponent(o.name));
        data.push('ev=' + o.value);
        if  ( o.label ) data.push('el=' + o.label);
      }

      if ( ! o.interactive ) {
        data.push('ni=1');
      }

      data.push("z=" + Math.floor(Math.random() * 10000).toString(10));

      data = data.join('&');

      this.send(o, data, sink);
    },
    send: function(o, data, sink) {
      var n = this.endpoints.length;
      var c = 0;
      var done = false;
      var notify = this.notify_.bind(this);
      var multiSink = {
        put: function(o) {
          ++c;
          if ( c === n && ! done ) {
            notify('put', [o]);
            sink && sink.put && sink.put(o);
          }
        },
        error: function(e) {
          if ( ! done ) sink && sink.error && sink.error(e);
          done = true;
        }
      };

      for ( var i = 0; i < n; ++i ) {
        this.send_(this.endpoints[i], o, data, multiSink);
      }
    }
  }
});
