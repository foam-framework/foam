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
    'foam.dao.EasyDAO',
    'foam.node.dao.JSONFileDAO',
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
      name: 'idGenerator',
      lazyFactory: function() {
        return this.IdGenerator.create(null, this.Y);
      },
    },
    {
      name: 'personDAO',
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
      name: 'streamDAO',
      lazyFactory: function() {
        var sd = this.EasyDAO.create({
          model: this.Envelope,
          name: 'streams',
          daoType: this.MDAO,
          guid: true,
          isServer: true,
          // logging: true,
        });
        return this.ShareSink.create({ delegate: sd });
      },
    },
    {
      name: 'videoDAO',
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
      name: 'personData',
      factory: function() { return this.dataFactory('people', this.Person); },
    },
    {
      name: 'adData',
      factory: function() { return this.dataFactory('ads', this.ProductAd); },
    },
    {
      name: 'videoData',
      factory: function() { return this.dataFactory('videos', this.Video); },
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
      // if ( this.isNode() ) this.loadData();
    },
    function loadData() {
      // Give everyone the ads.
      this.personDAO.pipe({
        put: function(person) {
          this.adData.select({
            put: function(ad) {
              this.streamDAO.put(this.Envelope.create({
                owner: person.id,
                source: '0',
                data: ad,
              }, this.Y));
            }.bind(this),
          });
        }.bind(this),
      });
      // Bootstrap people.
      this.personData.select(this.personDAO);
      // Bootstrap videos.
      this.videoData.select(this.videoDAO);
      this.exportDAO(this.videoDAO);
    },
  ],
});
