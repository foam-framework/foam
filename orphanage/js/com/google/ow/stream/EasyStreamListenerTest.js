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
  name: 'EasyStreamListenerTest',

  requires: [
    'MDAO',
    'foam.dao.EasyDAO',
    'com.google.ow.stream.EasyStreamListener'
  ],
  imports: [
    'assert',
    'error',
  ],

  constants: {
    DATA_PATHS: [
      GLOBAL.FOAM_BOOT_DIR + '../js/com/google/ow/stream/test/',
    ],
  },

  models: [
    {
      name: 'Envelope',

      properties: [
        {
          name: 'id',
          lazyFactory: function() {
            debugger; // Should never happen.
            return createGUID();
          },
        },
        {
          type: 'DateTime',
          name: 'timestamp',
          factory: function() { return new Date(); },
        },
        {
          type: 'Boolean',
          name: 'promoted',
          defaultValue: false,
        },
        'sid',
        'shares',
        'owner',
        'source',
        {
          type: 'StringArray',
          name:'tags',
        },
        {
          name: 'data',
          postSet: function(old, nu) {
            if ( old === nu ) return;
            if ( ! nu.id ) nu.id = createGUID();
          },
        },
        {
          type: 'StringArray',
          name: 'substreams',
        },
      ],

      methods: [
        // For debugging/logging purposes.
        function toString() {
          var str = (this.data && this.data.model_ ? this.data.model_.id : '') + '(' +
              '\n  envelope id: ' + this.id +
              '\n  data id: ' + (this.data ? this.data.id : '') +
              '\n  timestamp: ' + this.timestamp.toString() +
              '\n  source: ' + this.source +
              '\n  owner: ' + this.owner +
              '\n  sid: ' + this.sid +
              '\n  substreams: ' + this.substreams.join(', ') +
              '\n)';
          return str;
        },
      ],
    },
    {
      name: 'Order',

      properties: [
        {
          name: 'id',
          lazyFactory: function() { return createGUID(); },
        },
        {
          type: 'Reference',
          name: 'customer',
        },
        {
          type: 'Reference',
          name: 'merchant',
        },
        {
          type: 'Array',
          name: 'items',
          lazyFactory: function() { return []; },
        },
      ],
    },
  ],

  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'streamDAO',
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.Y.registerModel(this.Envelope, 'com.google.ow.model.Envelope');
      this.Y.registerModel(this.Order, 'com.google.ow.model.Order');
    },
    function testSetUp(test) {
      this.streamDAO = this.EasyDAO.create({
        model: this.Envelope,
        name: 'streams',
        daoType: this.MDAO,
        guid: true,
        // isServer: true,
        // autoIndex: true,
        // logging: true,
      });
    },
    function testTearDown() {
      this.streamDAO = '';
    },
    function dataFactory(ret, names, model, dao) {
      if ( ! Array.isArray(names) ) names = [names];
      var dataPaths = [];
      for ( var i = 0; i < names.length; ++i ) {
        for ( var j = 0; j < this.DATA_PATHS.length; ++j ) {
          dataPaths.push(this.DATA_PATHS[j] + names[i] + '.json');
        }
      }

      var seq = [];
      function maybeGet(path, next, data) {
        if ( data && ! Error.prototype.isPrototypeOf(data) ) {
          next && next(data);
          return;
        }
        this.axhr(path)(next);
      }
      for ( var i = 0; i < dataPaths.length; ++i ) {
        seq.push(maybeGet.bind(this, dataPaths[i]));
      }

      aseq.apply(null, seq)(function(data) {
        if ( Error.prototype.isPrototypeOf(data) ) {
          ret && ret(new Error('Failed to find test data at ' +
              dataPaths.join(' OR ') + 'Last error: ' + data.toString()));
        } else {
          ret && ret(data);
        }
      });
    },
    function axhr(url) {
      return function(ret) {
        var xhr = this.XHR.create({ contentType: 'text/plain' });
        xhr.asend(function(data) {
          try {
            ret && ret(JSONUtil.parse(this.X, data));
          } catch (e) {
            ret && ret(e);
          }
        }, url);
      };
    },
    function parPut(arr, dao) {
      var future = afuture();
      arr.select(dao);
      var l = function() {
        if ( ! dao.busy ) {
          debugger;
          future.set(dao);
          dao.busy$.removeListener(l);
        }
      };
      dao.busy$.addListener(l);
      return future.get;
    //   var self = this;
    //   var count = 0;
    //   var err = false;
    //   var sink = {
    //     put: function() {
    //       if ( err ) return;
    //       ++count;
    //       if ( count === arr.length ) {
    //         debugger;
    //         future.set(dao);
    //       }
    //     },
    //     error: function() {
    //       err = true;
    //       debugger;
    //       future.set(null);
    //     }
    //   };

    //   for ( var i = 0; i < arr.length; ++i ) {
    //     dao.put(arr[i], sink);
    //   }
    //   return future.get;
    },
  ],

  tests: [
    {
      model_: 'UnitTest',
      name: 'Single put',
      description: '',
      async: true,
      code: function(ret, test) {
        var data = [
          this.Envelope.create({
            source: '0',
            owner: '0',
            sid: '/foo',
            data: this.Order.create({
              customer: '0',
              merchant: '1',
            }),
          }),
        ];

        this.EasyStreamListener.create({
          streamDAO: this.streamDAO,
          substreams: ['/foo'],
          people: [ '0', '1' ],
        });

        // This works (completes all puts and removes) because the DAO is sync.
        data.select(this.streamDAO)(function() {
          var res = [];
          this.streamDAO.select(res)(function() {
            this.assert(res.length === 2, 'Two envelopes');
            this.assert(
                (res[0].owner === '0' &&
                res[1].owner === '1') ||
                (res[0].owner === '1' &&
                res[1].owner === '0'), 'One envelope per owner');
            ret && ret(res);
          }.bind(this));
        }.bind(this));
      },
    },
    {
      model_: 'UnitTest',
      name: 'Double identical put',
      description: '',
      async: true,
      code: function(ret, test) {
        var data1 = [
          this.Envelope.create({
            id: '0',
            source: '0',
            owner: '0',
            sid: '/foo',
            data: this.Order.create({
              customer: '0',
              merchant: '1',
            }),
          }),
        ].dao;
        var data2 = data1.slice().dao;

        this.EasyStreamListener.create({
          streamDAO: this.streamDAO,
          substreams: ['/foo'],
          people: [ '0', '1' ],
        });

        var self = this;
        data1.select(self.streamDAO)(function() {
          data2.select(self.streamDAO)(function() {
            var res = [];
            self.streamDAO.select(res)(function() {
              self.assert(res.length === 2, 'Two envelopes');
              self.assert(
                  (res[0].owner === '0' &&
                      res[1].owner === '1') ||
                      (res[0].owner === '1' &&
                      res[1].owner === '0'), 'One envelope per owner');
              ret && ret(res);
            });
          });
        });
      },
    },
    {
      model_: 'UnitTest',
      name: 'Dedup double put',
      description: '',
      async: true,
      code: function(ret, test) {
        var data1 = [
          this.Envelope.create({
            id: '0',
            source: '0',
            owner: '0',
            sid: '/foo',
            data: this.Order.create({
              customer: '0',
              merchant: '1',
            }),
          }),
        ].dao;
        var data2 = [
          this.Envelope.create({
            id: '0',
            // Contents may be different, but ID is the same.
            source: '1',
            owner: '1',
            sid: '/foo',
            data: this.Order.create({
              customer: '1',
              merchant: '0',
            }),
          }),
        ].dao;

        var count = 0;
        this.EasyStreamListener.create({
          streamDAO: this.streamDAO,
          substreams: ['/foo'],
          singlePut: true,
          onPut: function() { ++count; },
        });

        var self = this;
        data1.select(self.streamDAO)(function() {
          data2.select(self.streamDAO)(function() {
            self.assert(count === 1, 'One put through listener');
            ret && ret();
          });
        });
      },
    },
    {
      model_: 'UnitTest',
      name: 'Two puts',
      description: '',
      async: true,
      code: function(ret, test) {
        var data = [
          this.Envelope.create({
            source: '0',
            owner: '0',
            sid: '/foo',
            data: this.Order.create({
              customer: '0',
              merchant: '1',
            }),
          }),
          this.Envelope.create({
            source: '1',
            owner: '1',
            sid: '/foo',
            data: this.Order.create({
              customer: '0',
              merchant: '1',
            }),
          }),
        ];

        this.EasyStreamListener.create({
          streamDAO: this.streamDAO,
          substreams: ['/foo'],
          people: [ '0', '1' ],
        });

        data.select(this.streamDAO)(function() {
          var res = [];
          this.streamDAO.select(res)(function() {
            this.assert(res.length === 4, 'Four envelopes');
            this.assert(res.filter(function(env) {
              return env.owner === '0';
            }).length === 2, 'Two envelopes for first user');
            this.assert(res.filter(function(env) {
              return env.owner === '1';
            }).length === 2, 'Two envelopes for second user');
            ret && ret(res);
          }.bind(this));
        }.bind(this));
      },
    },
  ]
});
