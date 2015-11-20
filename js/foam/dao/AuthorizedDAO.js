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
  package: 'foam.dao',
  name: 'AuthorizedDAO',
  // Deliberately does NOT extend AbstractDAO, ProxyDAO, etc. It would be unsafe
  // for a new method to be added, but not authorized.
  properties: [
    {
      name: 'model',
      required: true
    },
    {
      name: 'delegate',
      required: true
    },
    {
      name: 'authorizer',
      documentation: 'An instance of $$DOC{ref:"foam.dao.Authorizer"} ' +
          'that describes how to authorize each DAO method.',
      required: true
    },
  ],

  methods: [
    function adelegateFind_(id, X) {
      return function(ret) {
        this.delegate.find(id, {
          put: ret,
          error: function() { ret(null); }
        }, X);
      }.bind(this);
    },
    function put(obj, sink, opt_X) {
      // On put, ask the authorizer to decorate our object.
      // It might return null, indicating that the object is owned by another
      // user, and this put should be denied.
      var self = this;
      opt_X = opt_X || GLOBAL;

      aseq(
        // Always return null if ID is not set; this is a new object.
        obj.id ? this.adelegateFind_(obj.id) : aconstant(null),
        function(ret, old) {
          self.authorizer.massageForPut(ret, opt_X, old, obj);
        },
        function(ret, massaged) {
          if (massaged === null) {
            sink && sink.error && sink.error('Illegal put.');
          } else {
            self.delegate.put(massaged, {
              error: function(e) {
                // Generic error to avoid data leaks.
                sink && sink.error && sink.error('Internal error in put');
                ret();
              },
              put: function(postPut) {
                self.authorizer.massageForRead(function(massaged) {
                  // Even if the massaged value is false, the put didn't fail.
                  // So we always call sink.put, maybe with null.
                  sink && sink.put && sink.put(massaged || obj);
                  ret();
                }, opt_X, postPut);
              }
            }, opt_X);
          }
        }
      )(function(massaged) {
      });
    },
    function remove(id_or_obj, sink, opt_X) {
      // On remove, we retrieve the original object from the delegate, then ask
      // the authorizer whether the removal is allowed. If the user sent us a
      // whole object instead of an ID, we don't trust any part of it except the
      // ID.
      // When (a) the original object doesn't exist, or (b) it exists but we're
      // not allowed to
      var self = this;
      opt_X = opt_X || GLOBAL;

      var id = id_or_obj.id || id_or_obj;

      aseq(
        this.adelegateFind_(id),
        function(ret, old) {
          self.authorizer.shouldAllowRemove(ret, opt_X, old);
        }
      )(function(allowed) {
        if (allowed) {
          self.delegate.remove(id, {
            remove: function(obj) {
              self.authorizer.massageForRead(function(massaged) {
                if (!massaged) {
                  // Creates an empty object with the correct ID, if you can't
                  // read the original.
                  massaged = obj.model_.create({ id: id });
                }
                sink && sink.remove && sink.remove(massaged);
              }, opt_X, obj);
            },
            error: function() {
              // Generic error to avoid data leaks.
              sink && sink.error && sink.error('Internal error in remove.');
            }
          });
        } else {
          // If the thing exists but you're not allowed to remove it,
          // we return an error.
          sink && sink.error && sink.error('Illegal remove.');
        }
      });
    },
    function find(id, sink, opt_X) {
      // On find, we retrieve the object from the delegate, then ask the
      // authorizer to massage it for this principal, and return it.
      // The authorizer might return null, in which case we return an error.
      var self = this;
      opt_X = opt_X || GLOBAL;

      this.delegate.find(id, {
        error: function() {
          // Generic error to avoid data leaks.
          sink && sink.error && sink.error('Failed to find');
        },
        put: function(obj) {
          self.authorizer.massageForRead(function(obj) {
            if (obj === null) {
              sink && sink.error && sink.error('Failed to find');
            } else {
              sink && sink.put && sink.put(obj);
            }
          }, opt_X, obj);
        }
      });
    },
    function select(sink, options, opt_X) {
      // On select, we first decorate the delegate to avoid wasting effort.
      // Then we run the select(), and massage each output value for reading
      // before sending it to the sink. nulls are dropped, as though they don't
      // exist. (That should be rare, unless the authorizer can't express all
      // of its conditions as a where() condition).
      // TODO(braden): Conditions from decorateForSelect() are fine, but if
      // massageForRead() will return null for any retrieved objects even with
      // the extra conditions from decorateForSelect, then the skip and limit
      // counts will be thrown off. This shouldn't matter most of the time,
      // since decorateForSelect will be comprehensive, and massageForRead will
      // never return null on the selected objects.
      if (!sink) sink = [].sink;
      var future = afuture();
      var self = this;
      opt_X = opt_X || GLOBAL;

      aseq(
        function(ret) {
          self.authorizer.decorateForSelect(ret, opt_X, self.delegate);
        },
        function(ret, dao) {
          dao.select({
            error: function() {
              // Generic error to avoid data leaks.
              sink && sink.error && sink.error('Internal error in select');
            },
            put: function(obj) {
              self.authorizer.massageForRead(function(massaged) {
                if (massaged !== null) {
                  sink && sink.put && sink.put(massaged);
                }
              }, opt_X, obj);
            },
            eof: function() {
              sink && sink.eof && sink.eof();
              ret();
            }
          }, options, opt_X);
        }
      )(function() {
        future.set(sink);
      });

      return future.get;
    },
    function removeAll(sink, options, opt_X) {
      // TODO(braden): Implement me. Use the select+remove scheme.
      opt_X = opt_X || GLOBAL;
    },
    function listen(sink, options, opt_X) {
      var self = this;
      opt_X = opt_X || GLOBAL;

      var mysink = {
        put: function(obj) {
          self.authorizer.massageForRead(function(obj) {
            if ( obj !== null ) {
              sink && sink.put && sink.put(obj);
            }
          }, opt_X, obj);
        },
        remove: function(obj) {
          self.authorizer.massageForRead(function(obj) {
            if ( obj !== null ) {
              sink && sink.remove && sink.remove(obj);
            }
          }, opt_X, obj);
        },
        reset: function() {
          sink && sink.reset && sink.reset();
        }
      };
      // TODO(adamvy): this is a bit hackish
      if ( options ) {
        mysink = AbstractDAO.getPrototype().decorateSink_(sink, options, true);
      }
      this.delegate.listen(mysink, opt_X);
    },
    function where(query) {
      return X.FilteredDAO_.create({ query: query, delegate: this }, this.Y);
    },
    function limit(count) {
      return X.LimitedDAO_.create({ count: count, delegate: this }, this.Y);
    },
    function skip(count) {
      return X.SkipDAO_.create({ skip: count, delegate: this }, this.Y);
    },
    function orderBy() {
      return X.OrderedDAO_.create({
        comparator: arguments.length === 1 ? arguments[0] : argsToArray(arguments),
        delegete: this
      }, this.Y);
    },
  ]
});
