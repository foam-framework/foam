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
  name: 'Server',
  package: 'com.google.ow',

  requires: [
    'com.google.ow.IdGenerator',
    'com.google.ow.model.Envelope',
    'com.google.plus.Person',
    'com.google.plus.ShareSink',
    'foam.dao.EasyDAO',
  ],
  imports: [
    'console',
    'idGenerator',
    'exportDAO',
  ],
  exports: [
    'personDAO',
    'streamDAO',
    'createStreamItem',
  ],

  documentation: function() {/*  */},

  properties: [
    {
      name: 'idGenerator',
      lazyFactory: function() {
        return this.IdGenerator.create(null, this.Y);
      },
    },
    {
      name: 'personDAO',
      factory: function() {
        return this.EasyDAO.create({
          model: this.Person,
          name: 'people',
          daoType: MDAO,
          guid: true,
          isServer: true,
          // logging: true,
        });
      },
    },
    {
      name: 'streamDAO',
      factory: function() {
        var sd = this.EasyDAO.create({
          model: this.Envelope,
          name: 'streams',
          daoType: MDAO,
          guid: true,
          isServer: true,
          // logging: true,
        });
        return this.ShareSink.create({ delegate: sd });
      },
    },
    {
      model_: 'FunctionProperty',
      name: 'createStreamItem',
      hidden: true,
      factory: function() {
        return function(source, target, data) {
          return this.Envelope.create({
            owner: target,
            source: source,
            data: data,
          });
        }.bind(this);
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.exportDAO(this.streamDAO);
      this.exportDAO(this.personDAO);
      if ( this.isNode() ) this.loadData();
    },
    function isNode() {
      return typeof vm !== 'undefined' && vm.runInThisContext;
    },
    function loadData() {
      var console = this.console;
      var createStreamItem = this.createStreamItem.bind(this);
      var fConst = function(v) { return function() { return v; }; };

      function sink(dao, opt_id, opt_source, opt_target) {
        return {
          put: function(data) {
            data.dao.pipe({
              put: function(o) {
                if ( opt_id ) o.id = opt_id(o);
                if ( opt_source || opt_target )
                  return dao.put(createStreamItem(opt_source(o), opt_target(o), o));
                else
                  return dao.put(o);
              },
            });
          },
          error: function() {
            console.error('Failed attempt to find modelled data', arguments);
          },
        };
      }

      function find(keys, sink, ret, opt_i) {
        var i = opt_i || 0;
        if ( i >= keys.length ) {
          console.error('Failed to load modelled data', keys);
          ret && ret.call(this, undefined);
          return;
        }
        var put = sink.put ? sink.put.bind(sink) : null;
        sink.put = function() {
          put && put.apply(this, arguments);
          ret && ret.apply(this, arguments);
        };
        var error = sink.error ? sink.error.bind(sink) : null;
        sink.error = function() {
          error && error.apply(this, arguments);
          find(keys, sink, ret, i + 1);
        };
        this.X.ModelDAO.find(keys[i], sink);
      }

      var firstPerson = null;
      var personSink = {
        __proto__: sink(this.personDAO,
                        function(o) {
                          return o.id ? o.id : this.idGenerator.fromName([
                            o.givenName,
                            o.middleName,
                            o.familyName,
                          ]);
                        }.bind(this)),
        put: function(o) {
          if ( ! firstPerson ) firstPerson = o.dao[0];
          return this.__proto__.put(o);
        },
      };
      find(
          ['com.google.ow.local.PersonData', 'com.google.ow.examples.PersonData'],
          personSink,
          function() {
            find(
                ['com.google.ow.local.AdData', 'com.google.ow.examples.AdData'],
                sink(this.streamDAO,
                     undefined,
                     fConst(this.idGenerator.fromName(['FOAM', 'Team'])),
                     fConst(firstPerson.id)));
          }.bind(this));
      find(
          ['com.google.ow.local.ContentData', 'com.google.ow.examples.ContentData'],
          sink(this.streamDAO,
               undefined,
               fConst(this.idGenerator.fromName(['FOAM', 'Team'])),
               fConst(this.idGenerator.fromName(
                   this.idGenerator.testNames[0]))));

      arequire('com.google.ow.content.Video')(function(videoModel) {
        var videoDAO = this.EasyDAO.create({
          name: 'videoDAO',
          model: videoModel,
          daoType: MDAO,
          //isServer: true,
        });
        this.exportDAO(videoDAO);
        this.X.ModelDAO.find('com.google.ow.examples.VideoData', sink(videoDAO));
      }.bind(this));
    },
  ],
});
