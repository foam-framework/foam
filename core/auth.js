// Defines some utilities for handling authentication and authorization.
// NB: It is currently assumed (by the DAO server) that write permission
// implies read permission.
// This may not be true in all apps, but it's the simplest thing that works for
// now.
// Certainly the converse (read => write) is not true for all apps.

// This is the interface used for checking if a user is authorized to perform
// some action.
// TODO: We may want to split query into a read-only and write-only query.
// Also they could replace the *Permission methods, if mlangs are sufficiently
// expressive to handle all the queries we care about.
FOAModel({
  model_: 'Interface',
  name: 'Authenticator',
  description: 'Interface for checking a principal\'s permission to access an object',

  methods: [
    {
      name: 'readPermission',
      args: [
        { name: 'principal', type: 'Object' },
        { name: 'obj', type: 'Object' }
      ],
      returnType: 'Boolean'
    },
    {
      name: 'writePermission',
      args: [
        { name: 'principal', type: 'Object' },
        { name: 'obj', type: 'Object' }
      ],
      returnType: 'Boolean'
    },
    {
      name: 'decorateAsOwner',
      args: [
        { name: 'principal', type: 'Object' },
        { name: 'obj', type: 'Object' }
      ],
      returnType: 'Object'
    },
    {
      name: 'authQuery',
      args: [ { name: 'principal', type: 'Object' } ],
      help: 'Used to make select() more efficient. This should return everything the principal and read. This is just a pre-filter; the read/writePermission functions have the final word for all operations. Put another way, this can be set to TRUE without impacting the security of the system.',
      returnType: 'EXPR'
    }
  ]
});

// This is the interface implemented by a model that makes it able to
// authorize users to access itself.
FOAModel({
  model_: 'Interface',
  name: 'Authenticated',
  description: 'Interface for checking a principal\'s permission to access this object',

  methods: [
    {
      name: 'readPermission',
      args: [
        { name: 'principal', type: 'Object' }
      ],
      returnType: 'Boolean'
    },
    {
      name: 'writePermission',
      args: [
        { name: 'principal', type: 'Object' }
      ],
      returnType: 'Boolean'
    },
    {
      name: 'decorateAsOwner',
      args: [
        { name: 'principal', type: 'Object' }
      ]
    }
    /*
       TODO: Can't have this here because when it's being called there's no
       instance to call it on. It needs to be a static method on the model.
    {
      name: 'authQuery',
      args: [
        { name: 'principal', type: 'Object' }
      ],
      returnType: 'EXPR'
    }
    */
  ]
});


// This AuthenticatedDAO knows how to check a user is authorized before
// performing any actions.
// If the `authenticator` property is provided, it uses that (which must be an
// instance of the Authenticator interface) to authorize requests.
// If `authenticator` is not provided, it will expect the model of object to
// support the Authenticated interface above.
// If neither is the case, it will fail.
// Either way, it expects a `principal` property, giving the object which will
// be passed to either the Authenticator instance or Authenticated methods.

// Implementation detail: As a security precaution: this is NOT a ProxyDAO.
// Therefore if a new DAO method is added, as removeAll() was not long ago,
// it will not be available through the server, unauthorized.
// It only takes a moment imagining what the addition of removeAll could have
// done with that security hole to agree this is worth it.
FOAModel({
  name: 'AuthenticatedDAO',
  extendsModel: 'AbstractDAO',

  properties: [
    {
      name: 'delegate',
      type: 'DAO',
      mode: 'read-only',
      hidden: true,
      transient: true,
      postSet: function(oldDAO, newDAO) {
        this.model = newDAO.model;
        if (!this.relay_) return;
        if (oldDAO) oldDAO.unlisten(this.relay_);
        newDAO.listen(this.relay_);
      }
    },
    {
      name: 'principal',
      type: 'Object',
      mode: 'read-only'
    },
    {
      name: 'authenticator',
      type: 'Authenticator',
      factory: function() {
        return {
          readPermission: function(principal, obj) {
            return obj.readPermission(principal);
          }.bind(this),
          writePermission: function(principal, obj) {
            return obj.writePermission(principal);
          }.bind(this),
          decorateAsOwner: function(principal, obj) {
            obj.decorateAsOwner(principal);
            return obj;
          }.bind(this),
          authQuery: function(principal) {
            return this.delegate.model.authQuery(principal);
          }.bind(this)
        };
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      // Sanity check: Forwarding these is sufficient, since put and remove
      // would only fire from the delegate if we're actually making edits,
      // which we only do after we've decided they're allowed.
      // So there will never be a notify_ for an action we later disallow.
      this.relay_ = {
        put:    function() { this.notify_('put', arguments); }.bind(this),
        remove: function() { this.notify_('remove', arguments); }.bind(this)
      };

      this.delegate.listen(this.relay_);
    },

    put: function(value, sink) {
      // First, try to find this value already in the DAO.
      // This gets into an ugly async mess, oh well.
      var self = this;
      this.delegate.find(value.id, {
        put: function(obj) {
          // We found it. Therefore, check that we're authorized to write the
          // newly-found object.
          if (self.authenticator.writePermission(self.principal, obj)) {
            // We can write, so put.
            // We need to decorate it with ourselves as owner first, though.
            self.delegate.put(
                self.authenticator.decorateAsOwner(self.principal, value),
                sink);
          } else {
            sink && sink.error && sink.error('put', value);
          }
        },
        error: function() {
          // We couldn't find it. Therefore this is fine to put, so long as it's
          // correctly owned by us.
          self.delegate.put(self.authenticator.decorateAsOwner(self.principal, value), sink);
        }
      });
    },

    remove: function(value, sink) {
      var value = value.id ? value : { id: value };
      var self = this;
      // Find it first and make sure we have permission to write it, before
      // erasing it.
      this.delegate.find(value.id, {
        put: function(obj) {
          // We found it. Therefore, check that we're authorized to write the
          // newly-found object.
          if (self.authenticator.writePermission(self.principal, obj)) {
            // We can write, so remove it.
            self.delegate.remove(value.id, sink);
          } // Do nothing otherwise; it effectively doesn't exist.
        }
      });
      // On error() we do nothing, since there's nothing to do for non-existent
      // objects.
    },

    removeAll: function(sink, options) {
      // Do a(n authenticated) select() with the original query AND'd with
      // authenticator.query. For each one that gets returned, check that we
      // have write permissions, and remove them.
      options = options || {};
      var ownerQuery = this.authenticator.authQuery(this.principal);
      if (options.query) options.query = AND(ownerQuery, options.query);
      else options.query = ownerQuery;

      var self = this;

      var future = afuture();

      this.select({
        put: function(obj) {
          if (self.authenticator.writePermission(self.principal, obj)) {
            self.delegate.remove(obj, sink);
          } // Otherwise do nothing.
        }, eof: function() {
          sink && sink.eof && sink.eof();
          future.set(sink); // TODO: Is this correct?
        }
      }, options);
      return future.get;
    },

    find: function(key, sink) {
      var self = this;
      this.delegate.find(key, {
        put: function(obj) {
          if (self.authenticator.readPermission(self.principal, obj)) {
            sink && sink.put && sink.put(obj);
          } else {
            sink && sink.error && sink.error('find', key);
          }
        },
        error: function() {
          sink && sink.error && sink.error('find', key);
        }
      });
    },

    select: function(sink, options) {
      options = options || {};
      var ownerQuery = this.authenticator.authQuery(this.principal);
      if (options.query) options.query = AND(ownerQuery, options.query);
      else options.query = ownerQuery;

      var self = this;

      var future = afuture();

      // We have the authenticator.query, but still check readPermission.
      // Better safe than sorry and all that.
      this.delegate.select({
        put: function(obj) {
          if (self.authenticator.readPermission(self.principal, obj)) {
            sink && sink.put && sink.put(obj);
          }
        },
        eof: function() {
          sink && sink.eof && sink.eof();
          future.set();
        }
      }, options);
    }
  },

  // These tests have the four security people: Alice, Bob, Carol, and Dave,
  // plus the nefarious Eve. Eve is not a user; she has no data of her own and
  // access to none. Each of the others has data of their own, plus data they
  // share with one of the others, in pairs. (Alice with Bob, Carol with Dave)
  // The shared data is readable by either of the pair, but writeable only by
  // its proper, single owner.
  tests: [
    {
      name: 'master',
      model_: 'UnitTest',
      description: 'Master test that sets up the initial conditions for the other tests',
      // Initializing code
      code: function() {
        var User = FOAM({
          name: 'User',
          model_: 'Model',
          properties: [
            { name: 'id' },
            { name: 'name' },
            { name: 'group', required: false }
          ]
        });

        var Group = FOAM({
          name: 'Group',
          model_: 'Model',
          properties: [
            { name: 'id' },
            { name: 'name' }
          ]
        });

        // TODO: Setting a does-not-exist value like -1 for groups is slightly
        // dangerous. If it's possible for a user to get their group set to -1,
        // they can now view all of the should-be private data!
        // It might be better to set a "shared" flag or access-control list,
        // which can't be faked into like that.
        // On the other hand, reads and writes to DAOs like that for Users and
        // Groups should be tightly controlled in any case.
        Secret = FOAM({
          name: 'Secret',
          model_: 'Model',
          properties: [
            { name: 'id' },
            { name: 'owner' },
            { name: 'group', required: false, defaultValue: -1 },
            { name: 'secret' }
          ],
          methods: {
            readPermission: function(principal) {
              return principal.id == this.owner ||
                  principal.group == this.group;
            },

            writePermission: function(principal) {
              return principal.id == this.owner;
            },

            decorateAsOwner: function(principal) {
              // We set only the owner. If it's supposed to be shared, it's up
              // to the user to set the group.
              // TODO possible caveat: Trying to figure out if the user is in the
              // group they're trying to share this with.
              // This may have to be left as application-specific.
              this.owner = principal.id;
            }
          }
        });
        Secret.authQuery = function(principal) {
          return OR(EQ(Secret.OWNER, principal.id),
                    EQ(Secret.GROUP, principal.group));
        };


        alice = User.create({ id: 1, group: 1, name: 'Alice' });
        bob = User.create({ id: 2, group: 1, name: 'Bob' });
        carol = User.create({ id: 3, group: 2, name: 'Carol' });
        dave = User.create({ id: 4, group: 2, name: 'Dave' });
        eve = User.create({ id: 5, name: 'Eve' });

        baseDAO = MDAO.create({ model: Secret });
        data = [
          Secret.create({ id: 1, owner: 1, secret: 'Alice\'s personal secret' }),
          Secret.create({ id: 2, owner: 2, secret: 'Bob\'s personal secret 1' }),
          Secret.create({ id: 3, owner: 2, secret: 'Bob\'s personal secret 2' }),
          Secret.create({ id: 4, owner: 3, secret: 'Carol\'s personal secret' }),
          Secret.create({ id: 5, owner: 4, secret: 'Dave\'s personal secret' }),

          Secret.create({ id: 6, owner: 1, group: 1,
                        secret: 'Alice\'s secret shared with Bob' }),
          Secret.create({ id: 7, owner: 2, group: 1,
                        secret: 'Bob\'s secret shared with Alice 1' }),
          Secret.create({ id: 8, owner: 2, group: 1,
                        secret: 'Bob\'s secret shared with Alice 2' }),
          Secret.create({ id: 9, owner: 3, group: 2,
                        secret: 'Carol\'s secret shared with Dave' })
        ];

        data.select(baseDAO);

        // A helper function for the tests below. Given an array of objects
        // and an array of IDs, ensure that every object's ID appears in the
        // array of IDs. No duplicates.
        idSet = function(objs, ids) {
          var idMap = {};
          ids.forEach(function(c) { idMap[c] = 1; });

          for (var i = 0; i < objs.length; i++) {
            if (idMap[objs[i].id]) {
              idMap[objs[i].id]--;
            } else {
              return false;
            }
          }
          return true;
        }

        // Now the setup is complete and the other tests can run.
        // NB: Those tests MUST CLONE the originalDAO, or suffering will result.
      },

      // Inner tests
      tests: [
        {
          name: 'getPersonalSecrets',
          model_: 'UnitTest',
          description: 'Everyone but Eve can retrieve exactly their own personal secrets',
          code: function() {
            // Copy even though we're only select()ing here; to avoid having
            // lots of listeners floating around.
            var testDAO = MDAO.create({ model: Secret });
            baseDAO.select(testDAO);

            // First, let's be Bob.
            var dao = AuthenticatedDAO.create({
              delegate: testDAO,
              principal: bob
            });
            var result = [];
            dao.where(EQ(Secret.GROUP, -1)).select(result);
            assert(result.length == 2, 'Bob should have 2 private secrets');
            assert(idSet(result, [2,3]), 'Bob privately has secrets #2 and #3');

            // Now let's be Carol.
            dao = AuthenticatedDAO.create({
              delegate: testDAO,
              principal: carol
            });

            result = [];
            dao.where(EQ(Secret.GROUP, -1)).select(result);
            assert(result.length == 1, 'Carol should have 1 private secret');
            assert(result[0].id == 4, 'Carol\'s private secret should be #4');

            // Finally, let's be Eve.
            dao = AuthenticatedDAO.create({
              delegate: testDAO,
              principal: eve
            });
            result = [];
            dao.where(EQ(Secret.GROUP, -1)).select(result);
            assert(result.length === 0, 'Eve should not be able to read anything');

            ok();
          }
        },

        {
          name: 'getSharedSecrets',
          model_: 'UnitTest',
          description: 'People can read secrets shared with their group',
          code: function() {
            var testDAO = MDAO.create({ model: Secret });
            baseDAO.select(testDAO);

            // Be Bob and select() everything I can.
            var dao = AuthenticatedDAO.create({
              delegate: testDAO,
              principal: bob
            });
            var result = [];
            dao.select(result);
            assert(result.length == 5, 'Bob should see 5 secrets');
            assert(idSet(result, [2, 3, 6, 7, 8]),
                'Bob should see secrets 2, 3, 6, 7, and 8.');
            ok();
          }
        },

        {
          name: 'updatePersonalSecrets',
          model_: 'UnitTest',
          description: 'People can put() secrets they own, but not ones from their group',
          code: function() {
            var testDAO = MDAO.create({ model: Secret });
            baseDAO.select(testDAO);

            // Be Alice and try to update my personal secret.
            // Then try to update one of the secrets Bob shares with me, which
            // should return error().
            var dao = AuthenticatedDAO.create({
              principal: alice,
              delegate: testDAO
            });

            var newSecret = 'Updated secret!';
            dao.find(1, {
              put: function(obj) {
                var o = obj.clone();
                o.secret = newSecret;
                dao.put(o, {
                  put: function(obj2) {
                    ok();
                  },
                  error: function() {
                    fail('Failed to write my own object.');
                  }
                });
              }, error: function() {
                fail('Couldn\'t find an object I own');
              }
            });

            // Fortunately the MDAO is synchronous.
            dao.find(1, {
              put: function(obj) {
                assert(obj.secret == newSecret,
                    'Object should actually be updated');
              }, error: function() {
                fail('Could not find object that should be there');
              }
            });

            // Now if we try to update one of Bob's shared secrets, it should
            // fail - I can read them but not write them.
            dao.find(7, {
              put: function(obj) {
                var o = obj.clone();
                o.secret = newSecret;
                dao.put(o, {
                  put: function() {
                    fail('Should not allow a put to an object I don\'t own!');
                  }, error: function(){
                    ok('Correctly failed to write objects I do not own');
                  }
                });
              }, error: function() {
                fail('Could not find object that should be there');
              }
            });
          }
        },

        {
          name: 'updateSomeoneElses',
          model_: 'UnitTest',
          description: 'put() will fail to modify someone else\'s object',
          code: function() {
            var testDAO = MDAO.create({ model: Secret });
            baseDAO.select(testDAO);

            // Be Alice, and try to modify one of Bob's shared secrets.
            var dao = AuthenticatedDAO.create({
              delegate: testDAO,
              principal: alice
            });

            var newSecret = 'Alice has updated me';
            dao.find(7, { // One of Bob's shared secrets.
              put: function(obj) {
                ok('Found the object I expected');
                var o = obj.clone();
                o.secret = newSecret;
                dao.put(o, {
                  put: function(obj) {
                    fail('Succeeded in overwriting someone else\'s object');
                  },
                  error: function() {
                    ok('Failed to put() someone else\'s object');
                  }
                });
              }, error: function() {
                fail('Failed to find an expected object');
              }
            });
          }
        },

        {
          name: 'putWithWrongOwner',
          model_: 'UnitTest',
          description: 'People can put() new secrets, but the owner is reset to be them',
          code: function() {
            var testDAO = MDAO.create({ model: Secret });
            baseDAO.select(testDAO);

            // Be Carol, and put a new secret shared with Dave, under his
            // ownership.
            // When it's done, that new object should be owned by me and shared
            // with Dave.
            var dao = AuthenticatedDAO.create({
              delegate: testDAO,
              principal: carol
            });

            var newObj = Secret.create({
              id: 10,
              owner: 4,
              group: 2,
              secret: 'New secret Carol is trying to inject into Dave\'s account'
            });

            dao.put(newObj, {
              put: function(obj) {
                ok('Successfully put the new object');
                if (newObj.owner == 3) { // Carol
                  ok('New object is owned by the putter, not original owner.');
                } else {
                  fail('Bad owner value is being written to the database.');
                }
              }, error: function() {
                fail('Failed to put a new object');
              }
            });

            // Now be Dave quickly and make sure it's correctly shared with me.
            dao = AuthenticatedDAO.create({
              delegate: testDAO,
              principal: dave
            });
            var result = [];
            dao.select(result);
            assert(idSet(result, [5, 9, 10]),
                'Dave should be able to see his original secrets, plus this new one Carol added');
          }
        },

        {
          name: 'findFailOnHidden',
          model_: 'UnitTest',
          description: 'find() should fail identically on nonexistent and invisible objects',
          code: function() {
            var testDAO = MDAO.create({ model: Secret });
            baseDAO.select(testDAO);

            var dao = AuthenticatedDAO.create({
              delegate: testDAO,
              principal: alice
            });

            dao.find(3, { // Trying to find one of Bob's personal secrets
              put: function(obj) {
                fail('Found an object I should not be able to see');
              },
              error: function() {
                ok('Failed to find an invisible object');
              }
            });

            dao.find(90, { // Trying to find an object that doesn't exist.
              put: function(obj) {
                fail('Found a nonexistent object. onoes!');
              }, error: function() {
                ok('Failed to find the nonexistent object');
              }
            });
          }
        },

        {
          name: 'removeFailSilentlyOnHidden',
          model_: 'UnitTest',
          description: 'remove() should silently do nothing on objects I can\'t write',
          code: function() {
            var testDAO = MDAO.create({ model: Secret });
            baseDAO.select(testDAO);

            // Be Bob, and try to remove one of Alice's shared secrets.
            // remove() should silently fail, and it should still be there on a
            // select().
            var dao = AuthenticatedDAO.create({
              delegate: testDAO,
              principal: bob
            });
            dao.find(6, {
              put: function(obj) {
                ok('Found the target object');
                dao.remove(obj, {
                  remove: function(o) {
                    fail('Succeeded in removing an object I don\'t own');
                  }, error: function() {
                    fail('Got an error from remove(); it should silently do nothing');
                  }
                });
                ok('Executed remove()');
              }, error: function() {
                fail('Could not find expected item');
              }
            });

            var results = [];
            dao.select(results);
            assert(idSet(results, [2, 3, 6, 7, 8]),
                'Bob should still see all of his secrets, and Alice\'s shared secret');

            // Try to remove one of Dave's private secrets.
            // This should silently do nothing.
            dao.remove({ id: 4 }, {
              remove: function(obj) {
                fail('Removed someone else\'s secret');
              }, error: function() {
                fail('remove() should silently do nothing, but I got an error');
              }
            });

            // Now use the master DAO to check that it's still actually there.
            testDAO.find(4, {
              put: function(obj) {
                ok('It didn\'t actually delete the other person\'s object');
              }, error: function() {
                fail('Deleted someone else\'s object!');
              }
            });
          }
        },

        {
          name: 'removeAll',
          model_: 'UnitTest',
          description: 'removeAll() is properly limited, and works',
          code: function() {
            var testDAO = MDAO.create({ model: Secret });
            baseDAO.select(testDAO);

            // Be Bob and do an unfiltered removeAll()
            var dao = AuthenticatedDAO.create({
              delegate: testDAO,
              principal: bob
            });

            var results = [];
            dao.removeAll({ remove: function(o) { results.push(o); } });
            // Make sure all the right things got deleted.
            assert(idSet(results, [2, 3, 7, 8]),
                'Bob\'s removeAll() deleted everything he owns');

            // And make sure that only Bob's things were deleted.
            results = [];
            testDAO.select(results);
            assert(idSet(results, [1, 4, 5, 6, 9]),
                'Only Bob\'s items were deleted');
          }
        },

        {
          name: 'removeAllWithFilter',
          model_: 'UnitTest',
          description: 'removeAll() with a where()',
          code: function() {
            var testDAO = MDAO.create({ model: Secret });
            baseDAO.select(testDAO);

            // Be Bob and delete all my shared secrets.
            var dao = AuthenticatedDAO.create({
              delegate: testDAO,
              principal: bob
            });

            var results = [];
            dao.where(NEQ(Secret.GROUP, -1)).removeAll({
              remove: function(o) { results.push(o); }
            });

            // Check that this deleted Bob's shared items.
            assert(idSet(results, [7, 8]),
                'Correctly deleted exactly Bob\'s shared items');

            // Now select from the unfiltered DAO to make sure that was all
            // that got deleted.
            results = [];
            testDAO.select(results);
            assert(idSet(results, [1, 2, 3, 4, 5, 6, 9]),
                'Everything else still exists after Bob\'s removeAll()');
          }
        }

        /*
          Secret.create({ id: 1, owner: 1, secret: 'Alice\'s personal secret' }),
          Secret.create({ id: 2, owner: 2, secret: 'Bob\'s personal secret 1' }),
          Secret.create({ id: 3, owner: 2, secret: 'Bob\'s personal secret 2' }),
          Secret.create({ id: 4, owner: 3, secret: 'Carol\'s personal secret' }),
          Secret.create({ id: 5, owner: 4, secret: 'Dave\'s personal secret' }),

          Secret.create({ id: 6, owner: 1, group: 1,
                        secret: 'Alice\'s secret shared with Bob' }),
          Secret.create({ id: 7, owner: 2, group: 1,
                        secret: 'Bob\'s secret shared with Alice 1' }),
          Secret.create({ id: 8, owner: 2, group: 1,
                        secret: 'Bob\'s secret shared with Alice 2' }),
          Secret.create({ id: 9, owner: 3, group: 2,
                        secret: 'Carol\'s secret shared with Dave' })
                        */
      ]
    }
  ]
});
// TODO: Check that this is safe with UPDATE mlang. Which DAO would it be
// running against?

