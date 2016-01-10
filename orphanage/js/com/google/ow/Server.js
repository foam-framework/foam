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
    'com.google.ow.SubstreamSink',
    'com.google.ow.content.SingleStream',
    'com.google.ow.content.Stream',
    'com.google.ow.content.UpdateStream',
    'com.google.ow.content.Video',
    'com.google.ow.model.Ad',
    'com.google.ow.model.CustomerOrder',
    'com.google.ow.model.Envelope',
    'com.google.ow.model.MerchantOrder',
    'com.google.ow.model.ProductAd',
    'com.google.ow.model.Text',
    'com.google.ow.stream.NewConnectionListener',
    'com.google.plus.Person',
    'foam.dao.AuthorizedDAO',
    'foam.dao.DebugAuthDAO',
    'foam.dao.EasyDAO',
    'foam.dao.LoggingDAO',
    'foam.dao.PrivateOwnerAuthorizer',
    'foam.dao.ProxyDAO',
    'foam.mlang.PropertySequence',
  ],
  imports: [
    'console',
    'idGenerator',
    'exportToContext',
    'exportDAO',
    'exportDirectory',
  ],
  exports: [
    'personDAO',
    // TODO(markdittmer): This bypasses authorization for server components.
    // We should do better.
    'streamDAO_ as streamDAO',
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
      name: 'fs',
      factory: function() { return require('fs'); }
    },
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
          // logging: true,
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
          // autoIndex: true,
          // logging: true,
        }, this.Y).orderBy(this.Envelope.TIMESTAMP);
      },
    },
    {
      name: 'streamDAO',
      lazyFactory: function() {
        return this.authorizeFactory(this.Envelope, this.streamDAO_);
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
        }, this.Y);
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
      name: 'streamData',
      help: 'Test data',
      factory: function() { return this.dataFactory('streams', this.Stream); },
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
      type: 'Function',
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
            substreams: data.substreams || [],
          });
        }.bind(this);
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      // Done in loadData at the moment
      //this.streamDAO_.listen(this.SubstreamSink.create(null, this.Y));
    },
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
      var dao = this.EasyDAO.create({
        name: name,
        model: model,
        daoType: this.MDAO,
        guid: true,
      }, this.Y);

      var dataPaths = this.DATA_PATHS.map(function(p) {
        return p + name + '.json';
      });
      for ( var i = 0; i < dataPaths.length; ++i ) {
        try {
          var result = this.fs.readFileSync(dataPaths[i]);
          if ( result ) {
            JSONUtil.arrayToObjArray(this.Y, eval('(' + result + ')'), model).select(dao);
            break;
          }
        } catch (e) {}
      }

      return dao;
    },
    function execute() {
      this.exportDAO(this.streamDAO);
      this.exportDAO(this.personDAO);
      this.exportToContext({
        streamDAO: this.streamDAO_,
      });
      this.exportDirectory('/static', 'static');
      this.loadData();
    },
    function loadData() {
      var self = this, videoStreamEnv;

      // Bootstrap streams.
      var people = [];
      self.personData.select(people)(function() {
        people = people.map(function(p) { return p.id; });

        self.NewConnectionListener.create({
          streamDAO: self.streamDAO_,
          substreams: [ '/Chat/New' ],
          createClientForSource: true,
          getPeople: function(env) {
            return people;
          },
          getConnectionSubstreams: function(env) { return [ '/Chat/All' ]; },
          streamClientFactory: function(inputEnv, pid) {
            return self.SingleStream.create({
              substream: this.getConnectionSubstreams(inputEnv)[0],
            });
          },
        });

        self.streamDAO_.put(self.Envelope.create({
          source: '0',
          owner: '0',
          sid: '/Chat/New',
          data: self.Text.create({ message: "Hey, let's chat!" }),
        }));
      });
      self.adData.select(GROUP_BY(self.Ad.AD_STREAM))(function(data) {
        var sids = data.groupKeys;
        for ( var i = 0; i < sids.length; ++i ) {
          self.NewConnectionListener.create({
            streamDAO: self.streamDAO_,
            substreams: [ sids[i] ],
            getPeople: function(env) {
              return [ env.data.merchant, env.data.customer ];
            },
            streamClientFactory: function(inputEnv, pid) {
              return self.UpdateStream.create({
                substreams: this.getConnectionSubstreams(inputEnv),
              });
            },
            streamDataFactory: function(data, pid) {
              // TODO(markdittmer): This special case should be better abstracted.
              if ( data.status === 'PENDING' ) data.status = 'SUBMITTED';
              if ( pid === data.merchant ) return self.MerchantOrder.create(data);
              else                         return self.CustomerOrder.create(data);
            },
          });
        }
      });
      self.streamData.select({
        put: function(o) {
          // HACK(markdittmer): Manual setup tasks for various test streams.
          if ( o.data.name === 'Test Videos' ) {
            videoStreamEnv = o;
            self.personDAO_.pipe({
              put: function(person) {
                //console.log("Person vid list create", person.id, videoStreamEnv.substreams);
                self.streamDAO_.put(self.Envelope.create({
                  owner: person.id,
                  source: '0',
                  substreams: videoStreamEnv.substreams,
                  sid: videoStreamEnv.sid,
                  data: videoStreamEnv.data.clone(),
                }));
              }
            });
          } else if ( o.data.name === 'User Data' ) {
            self.personDAO_.pipe({
              put: function(person) {
                console.log("Person *** data create", o.data.name_, person.id);
                self.streamDAO_.put(self.Envelope.create({
                  owner: person.id,
                  source: '0',
                  substreams: o.substreams,
                  sid: o.sid,
                  data: o.data.clone(),
                }));
              }
            });
          } else {
            self.streamDAO_.put(o);
          }
        },
      });
      self.loadData_(videoStreamEnv);
    },
    function loadData_(videoStreamEnv) {
      // Give everyone the ads and videos.
      this.personDAO_.pipe({
        put: function(person) {
          console.log("Person put!", person.id);

          var incr = 0;
          this.adData.select({
            put: function(ad) {
              this.streamDAO_.put(this.Envelope.create({
                owner: person.id,
                source: ad.merchant,
                data: ad,
              }));
            }.bind(this),
          });
          if ( videoStreamEnv ) {
            this.videoDAO_.select({
              put: function(video) {
                //console.log("Create vid:",person.id, video.id, videoStreamEnv.substreams[0]);
                this.streamDAO_.put(this.Envelope.create({
  //                id: 'fakeIDVid'+incr++,
                  owner: person.id,
                  source: incr,
                  data: video,
                  sid: videoStreamEnv.substreams[0] + '/fakeIDVid'+incr,
                  substreams: [videoStreamEnv.substreams[0] + '/fakeIDVid'+incr,
                    video.id+'/commentThreads'],
                }, this.Y));
                //console.log('vid sid:',videoStreamEnv.substreams[0] + '/fakeIDVid'+incr);
              }.bind(this),
            });
          }
        }.bind(this),
      });
      // Bootstrap video data.
      this.videoData.select(this.videoDAO_)(function() {
        // Bootstrap people.
        this.personData.select(this.personDAO_)(function() {
           this.streamDAO_.listen(this.SubstreamSink.create(null, this.Y));
        }.bind(this));
      }.bind(this));

    },
  ],
});
