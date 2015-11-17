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
    'MDAO',
    'com.google.ow.IdGenerator',
    'com.google.ow.content.Video',
    'com.google.ow.model.Envelope',
    'com.google.ow.model.ProductAd',
    'com.google.plus.Person',
    'com.google.plus.ShareSink',
    'foam.dao.AuthorizedDAO',
    'foam.dao.DebugAuthDAO',
    'foam.dao.EasyDAO',
    'foam.dao.LoggingDAO',
    'foam.dao.PrivateOwnerAuthorizer',
    'foam.node.dao.JSONFileDAO',
    'com.google.ow.examples.VideoA',
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

  constants: {
    DATA_PATHS: [
      global.FOAM_BOOT_DIR + '/../js/com/google/ow/local/',
      global.FOAM_BOOT_DIR + '/../js/com/google/ow/examples/',
    ],
  },

  properties: [
    {
      name: 'util',
      lazyFactory: function() { return require('util'); },
    },
    {
      name: 'idGenerator',
      lazyFactory: function() {
        return this.IdGenerator.create(null, this.Y);
      },
    },
    {
      name: 'personDAO_',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Person,
          name: 'people',
          daoType: this.MDAO,
          guid: true,
          isServer: true,
           logging: true,
        });
      },
    },
    {
      name: 'personDAO',
      lazyFactory: function() {
        // TODO(markdittmer): Authorize access to people.
        return this.personDAO_;
        // return this.authorizeFactory(this.Person, this.personDAO_);
      },
    },
    {
      name: 'streamDAO_',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Envelope,
          name: 'streams',
          daoType: this.MDAO,
          guid: true,
          isServer: true,
          // logging: true,
        });
      },
    },
    {
      name: 'streamDAO',
      lazyFactory: function() {
        return this.authorizeFactory(
            this.Envelope,
            this.ShareSink.create({ delegate: this.streamDAO_ }));
      },
    },
    {
      name: 'videoDAO_',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Video,
          name: 'videos',
          daoType: this.MDAO,
          // isServer: true,
          // logging: true,
        });
      },
    },
    {
      name: 'videoDAO',
      lazyFactory: function() {
        // TODO(markdittmer): Authorize access to people.
        return this.videoDAO_;
        //return this.authorizeFactory(this.Video, this.videoDAO_);
      },
    },
    {
      name: 'personData',
      help: 'Test data',
      factory: function() { return this.dataFactory('people', this.Person); },
    },
    {
      name: 'adData',
      help: 'Test data',
      factory: function() { return this.dataFactory('ads', this.ProductAd); },
    },
    {
      name: 'videoData',
      help: 'Test data',
      factory: function() { return this.dataFactory('videos', this.Video); },
    },
    {
      model_: 'FunctionProperty',
      name: 'createStreamItem',
      hidden: true,
      factory: function() {
        return function(source, target, data, opt_sid) {
          var srcId = source.id || source;
          var tgtId = target.id || target;
          // share handler, if some sort of setup is needed
          if ( data.onShare ) data.onShare(srcId, tgtId, opt_sid);
          return this.Envelope.create({
            owner: tgtId,
            source: srcId,
            data: data,
            sid: opt_sid || data.sid || '',
          });
        }.bind(this);
      },
    },
  ],

  methods: [
    function authorizeFactory(model, delegate) {
      return this.DebugAuthDAO.create({
        delegate: this.AuthorizedDAO.create({
          model: model,
          delegate: delegate,
          authorizer: this.PrivateOwnerAuthorizer.create({
            ownerProp: this.Envelope.OWNER,
          }, this.Y),
        }, this.Y),
      }, this.Y);
    },
    function dataFactory(name, model) {
      return this.EasyDAO.create({
        name: name,
        model: model,
        daoType: this.JSONFileDAO.xbind({
          filename: this.DATA_PATHS.map(function(p) {
            return p + name + '.json';
          })
        }),
        guid: true,
      }, this.Y);
    },
    function execute() {
      this.exportDAO(this.streamDAO);
      this.exportDAO(this.personDAO);
      this.loadData();
    },
    function loadData() {
      // Give everyone the ads.
      this.personDAO_.pipe({
        put: function(person) {
          this.adData.select({
            put: function(ad) {
              this.streamDAO_.put(this.Envelope.create({
                owner: person.id,
                source: '0',
                data: ad,
              }, this.Y));
            }.bind(this),
          });
          this.videoDAO_.select({
            put: function(ad) {
              this.streamDAO_.put(this.Envelope.create({
                owner: person.id,
                source: '0',
                data: ad,
                sid: ad.sid,
              }, this.Y));
            }.bind(this),
          });
        }.bind(this),
      });
      // Bootstrap videos.
      this.videoData.select(this.videoDAO_);

      // Bootstrap people.
      this.personData.select(this.personDAO_);
    },
  ],
});
