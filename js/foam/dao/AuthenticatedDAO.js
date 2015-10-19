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
  name: 'AuthenticatedDAO',
  // Deliberately does NOT extend AbstractDAO, ProxyDAO, etc. It would be unsafe
  // for a new method to be added, but not authenticated.
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
      name: 'authenticator',
      documentation: 'An instance of $$DOC{ref:"foam.dao.Authenticator"} ' +
          'that describes how to authenticate each DAO method.',
      required: true
    },
  ],

  methods: [
    function adelegateFind_(id) {
      return function(ret) {
        this.delegate.find(id, {
          put: ret,
          error: function() { ret(null); }
        });
      }.bind(this);
    },
    function put(obj, sink, opt_X) {
      // On put, ask the authenticator to decorate our object.
      // It might return null, indicating that the object is owned by another
      // user, and this put should be denied.
      var self = this;
      var principal = opt_X && opt_X.principal;
      if (!principal) {
        sink && sink.error && sink.error('Illegal put.');
        return;
      }

      aseq(
        // Always return null if ID is not set; this is a new object.
        obj.id ? this.adelegateFind_(obj.id) : aconstant(null),
        function(ret, old) {
          self.authenticator.massageForPut(ret, principal, old, obj);
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
                self.authenticator.massageForRead(function(massaged) {
                  // Even if the massaged value is false, the put didn't fail.
                  // So we always call sink.put, maybe with null.
                  sink && sink.put && sink.put(massaged || null);
                  ret();
                }, principal, postPut);
              }
            });
          }
        }
      )(function(massaged) {
      });
    },
    function remove(id_or_obj, sink, opt_X) {
      // On remove, we retrieve the original object from the delegate, then ask
      // the authenticator whether the removal is allowed. If the user sent us a
      // whole object instead of an ID, we don't trust any part of it except the
      // ID.
      var self = this;
      var principal = opt_X && opt_X.principal;
      if (!principal) {
        sink && sink.error && sink.error('Illegal remove.');
        return;
      }

      var id = id_or_obj.id || id_or_obj;

      aseq(
        this.adelegateFind_(id),
        function(ret, old) {
          self.authenticator.shouldAllowRemove(ret, principal, old);
        }
      )(function(allowed) {
        if (allowed) {
          self.delegate.remove(id, {
            remove: function(obj) {
              self.authenticator.massageForRead(function(massaged) {
                sink && sink.remove && sink.remove(massaged || null);
              }, principal, obj);
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
      // authenticator to massage it for this principal, and return it.
      // The authenticator might return null, in which case we return an error.
      var self = this;
      var principal = opt_X && opt_X.principal;
      if (!principal) {
        sink && sink.error && sink.error('Illegal find');
        return;
      }

      this.delegate.find(id, {
        error: function() {
          // Generic error to avoid data leaks.
          sink && sink.error && sink.error('Failed to find');
        },
        put: function(obj) {
          self.authenticator.massageForRead(function(obj) {
            if (obj === null) {
              sink && sink.error && sink.error('Failed to find');
            } else {
              sink && sink.put && sink.put(obj);
            }
          }, principal, obj);
        }
      });
    },
    function select(sink, options, opt_X) {
      // On select, we first decorate the delegate to avoid wasting effort.
      // Then we run the select(), and massage each output value for reading
      // before sending it to the sink. nulls are dropped, as though they don't
      // exist. (That should be rare, unless the authenticator can't express all
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
      var principal = opt_X && opt_X.principal;
      if (!principal) {
        sink && sink.error && sink.error('Illegal select.');
        future.set(sink);
        return future.get;
      }

      aseq(
        function(ret) {
          self.authenticator.decorateForSelect(ret, principal, self.delegate);
        },
        function(ret, dao) {
          dao.select({
            error: function() {
              // Generic error to avoid data leaks.
              sink && sink.error && sink.error('Internal error in select');
            },
            put: function(obj) {
              self.authenticator.massageForRead(function(massaged) {
                if (massaged !== null) {
                  sink && sink.put && sink.put(massaged);
                }
              }, principal, obj);
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
    },
    function where(query) {
      return (this.Y || X).lookup('FilteredDAO_').create({ query: query, delegate: this });
    },
    function limit(count) {
      return (this.Y || X).lookup('LimitedDAO_').create({ count: count, delegate: this });
    },
    function skip(skip) {
      return (this.Y || X).lookup('SkipDAO_').create({ skip: skip, delegate: this });
    },
    function orderBy() {
      return (this.Y || X).lookup('OrderedDAO_').create({
        comparator: arguments.length === 1 ? arguments[0] : argsToArray(arguments),
        delegete: this
      });
    },
  ]
});
