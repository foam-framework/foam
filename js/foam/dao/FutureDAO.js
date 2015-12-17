/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  package: 'foam.dao',
  name: 'FutureDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: function() {/*
    A DAO proxy that delays operations until the delegate is set in the future.
  */ },

  properties: [
    {
      name: 'delegate',
      factory: function() { return null; }
    },
    {
      name: 'future',
      swiftType: 'Future',
      swiftFactory: 'return Future()',
      required: true,
      documentation: "The future on which to operate before the delegate becomes available.",
    },
    {
      name: 'model',
      defaultValueFn: function() { return this.delegate ? this.delegate.model : ''; },
      documentation: function() {/*
        The model type of the items in the delegate DAO. Empty if the future has not been set yet.
      */}
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() { /* Sets up the future to provide us with the delegate when it becomes available. */
        this.SUPER();

        this.future(function(delegate) {
          var listeners = this.daoListeners_;
          this.daoListeners_ = [];
          this.delegate = delegate;
          this.daoListeners_ = listeners;
          this.delegate.listen(this.relay);
        }.bind(this));
      },
      swiftCode: function() {/*
        super._foamInit_()

        future.get({ delegate in
          let delegate = delegate as! AbstractDAO
          let listeners = self.daoListeners_
          self.daoListeners_ = []
          self.delegate = delegate
          self.daoListeners_ = listeners
          self.delegate.listen(self.relay);
        });
      */},
    },
    {
      name: 'put',
      code: function(value, sink) { /* Passthrough to delegate or the future, if delegate not set yet. */
        if ( this.delegate ) {
          this.delegate.put(value, sink);
        } else {
          this.future(this.put.bind(this, value, sink));
        }
      },
      swiftCode: function() {/*
        future.get { delegate in
          let delegate = delegate as! AbstractDAO
          delegate.put(obj, sink: sink)
        }
      */},
    },

    function remove(query, sink) { /* Passthrough to delegate or the future, if delegate not set yet. */
      if ( this.delegate ) {
        this.delegate.remove(query, sink);
      } else {
        this.future(this.remove.bind(this, query, sink));
      }
    },

    function removeAll() { /* Passthrough to delegate or the future, if delegate not set yet. */
      if ( this.delegate ) {
        return this.delegate.removeAll.apply(this.delegate, arguments);
      }

      var a = arguments;
      var f = afuture();
      this.future(function(delegate) {
        this.removeAll.apply(this, a)(f.set);
      }.bind(this));

      return f.get;
    },

    {
      name: 'find',
      code: function(key, sink) {/* Passthrough to delegate or the future, if delegate not set yet. */
        if ( this.delegate ) {
          this.delegate.find(key, sink);
        } else {
          this.future(this.find.bind(this, key, sink));
        }
      },
      swiftCode: function() {/*
        future.get { delegate in
          let delegate = delegate as! AbstractDAO
          delegate.find(id, sink: sink)
        }
      */},
    },

    {
      name: 'select',
      code: function(sink, options) {/* Passthrough to delegate or the future, if delegate not set yet. */
        if ( this.delegate ) {
          return this.delegate.select(sink, options);
        }

        var a = arguments;
        var f = afuture();
        this.future(function() {
          this.select.apply(this, a)(f.set);
        }.bind(this));

        return f.get;
      },
      swiftCode: function() {/*
        let selectFuture = Future()
        future.get { delegate in
          let delegate = delegate as! AbstractDAO
          delegate.select(sink, options: options).get { data in
            selectFuture.set(data)
          }
        }
        return selectFuture
      */},
    },
  ]
});
