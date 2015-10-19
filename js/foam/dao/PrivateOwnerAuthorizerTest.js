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
  name: 'PrivateOwnerAuthorizerTest',
  requires: [
    'foam.dao.AuthorizedDAO',
    'foam.dao.EasyDAO',
    'foam.dao.PrivateOwnerAuthorizer',
  ],

  imports: [
    'assert',
    'fail',
    'log',
    'ok'
  ],

  models: [
    {
      name: 'Employee',
      properties: [
        'id',
        'name',
        'company',
      ]
    }
  ],

  methods: [
    function buildDAO() {
      var inner = this.EasyDAO.create({
        daoType: 'MDAO',
        model: this.Employee,
        seqNo: true
      });

      inner.put(this.Employee.create({ id: 1, name: 'Kevin', company: 'XYZ', }));
      inner.put(this.Employee.create({ id: 2, name: 'Adam', company: 'XYZ', }));
      inner.put(this.Employee.create({ id: 3, name: 'Braden', company: 'ABC', }));
      inner.put(this.Employee.create({ id: 4, name: 'Jackson', company: 'ABC', }));
      inner.put(this.Employee.create({ id: 5, name: 'Mark', company: 'ABC', }));

      return this.AuthorizedDAO.create({
        model: this.Employee,
        authorizer: this.PrivateOwnerAuthorizer.create({
          ownerProp: this.Employee.COMPANY
        }),
        delegate: inner
      });
    }
  ],

  tests: [
    // Tests for select()
    function testSelect_ABC() {
      var dao = this.buildDAO();
      var sink = [].sink;
      var X = this.Y.sub({ principal: 'ABC' });
      dao.select(sink, undefined, X);

      this.assert(sink.length === 3, 'select with ABC should return 3 entries');
      var names = sink.mapProp('name');
      this.assert(names.indexOf('Jackson') >= 0, 'results should contain Jackson');
    },
    function testSelectFiltered_XYZ() {
      var dao = this.buildDAO();
      var sink = [].sink;
      var X = this.Y.sub({ principal: 'XYZ' });
      // Should return just Adam.
      dao.where(CONTAINS_IC(this.Employee.NAME, 'a')).select(sink, undefined, X);

      this.assert(sink.length === 1, 'select with XYZ and where name contains "a" should return just 1 (Adam)');
      this.assert(sink[0].name === 'Adam', 'single returned entry should be Adam');
    },
    function testSelect_NoPrincipal() {
      var dao = this.buildDAO();
      var sink = {
        put: function() { this.fail('put called, should have been error'); }.bind(this),
        eof: function() { this.fail('eof called, should have been error'); }.bind(this),
        error: function() { this.ok('error called, appropriately'); }.bind(this)
      };
      dao.select(sink);
    },
    function testSelect_BadPrincipal() {
      var dao = this.buildDAO();
      var inner = [].sink;
      var sink = {
        put: inner.push.bind(inner),
        error: function() {
          this.fail('Received error call, should have put nothing.');
        }.bind(this)
      };

      var X = this.Y.sub({ principal: 'Some Other Company' });
      dao.select(sink, undefined, X);

      this.assert(inner.length === 0, 'No results should be returned');
    },

    // Tests for find()
    function testFind_NoPrincipal() {
      var dao = this.buildDAO();
      dao.find(4, {
        put: function() {
          this.fail('find succeeded! should reject without principal set');
        }.bind(this),
        error: function() {
          this.ok('find without principal failed properly');
        }.bind(this)
      }, this.Y);
    },
    function testFind_Exists_Mine() {
      var dao = this.buildDAO();
      var X = this.Y.sub({ principal: 'ABC' });
      dao.find(4, {
        put: function(obj) {
          this.ok('put() called on sink');
          this.assert(obj.id === 4, 'Returned correct object');
        }.bind(this),
        error: function() {
          this.fail('error() called on sink');
        }.bind(this)
      }, X);
    },
    function testFind_Exists_NotMine() {
      var dao = this.buildDAO();
      var X = this.Y.sub({ principal: 'XYZ' });
      dao.find(4, {
        put: function(obj) {
          this.fail('put() called on sink - should fail to find');
        }.bind(this),
        error: function() {
          this.ok('error() called on sink - correctly not found');
        }.bind(this)
      }, X);
    },
    function testFind_NotExist() {
      var dao = this.buildDAO();
      var X = this.Y.sub({ principal: 'XYZ' });
      dao.find(14, {
        put: function(obj) {
          this.fail('put() called on sink - should fail to find');
        }.bind(this),
        error: function() {
          this.ok('error() called on sink - correctly not found');
        }.bind(this)
      }, X);
    },

    // Tests for put()
    function testPut_NoPrincipal() {
      var dao = this.buildDAO();
      dao.put(this.Employee.create({ name: 'Mike' }), {
        put: function() {
          this.fail('put succeeded! should reject without principal set');
        }.bind(this),
        error: function() {
          this.ok('put without principal failed properly');
        }.bind(this)
      }, this.Y);
    },
    function testPut_New_NoOwner() {
      var dao = this.buildDAO();
      var newGuy = this.Employee.create({ name: 'Mike' });
      var X = this.Y.sub({ principal: 'ABC' });
      dao.put(newGuy, {
        put: function(emp) {
          this.ok('put() called on sink');
          this.assert(emp.name === 'Mike', 'New employee is named Mike');
          this.assert(emp.id, 'ID is now set by SeqNoDAO');
          this.assert(emp.company === 'ABC', 'Owner field filled in properly.');
        }.bind(this),
        error: function() {
          this.fail('error called on sink');
        }.bind(this)
      }, X);
    },
    function testPut_New_CorrectOwner() {
      var dao = this.buildDAO();
      var newGuy = this.Employee.create({ name: 'Mike', company: 'ABC' });
      var X = this.Y.sub({ principal: 'ABC' });
      dao.put(newGuy, {
        put: function(emp) {
          this.ok('put() called on sink');
          this.assert(emp.name === 'Mike', 'New employee is named Mike');
          this.assert(emp.id, 'ID is now set by SeqNoDAO');
          this.assert(emp.company === 'ABC', 'Owner field still set properly.');
        }.bind(this),
        error: function() {
          this.fail('error called on sink');
        }.bind(this)
      }, X);
    },
    function testPut_NewWithID_NoOwner() {
      var dao = this.buildDAO();
      var newGuy = this.Employee.create({ id: 12, name: 'Mike' });
      var X = this.Y.sub({ principal: 'ABC' });
      dao.put(newGuy, {
        put: function(emp) {
          this.ok('put() called on sink');
          this.assert(emp.name === 'Mike', 'New employee is named Mike');
          this.assert(emp.id === 12, 'ID is still set to what I gave it');
          this.assert(emp.company === 'ABC', 'Owner field filled in');
        }.bind(this),
        error: function() {
          this.fail('error called on sink');
        }.bind(this)
      }, X);
    },
    function testPut_New_BadOwner() {
      // The correct behavior here is to put successfully, and overwrite the
      // bad owner with the correct value.
      var dao = this.buildDAO();
      var newGuy = this.Employee.create({ name: 'Mike', company: 'ASJKA' });
      var X = this.Y.sub({ principal: 'ABC' });
      dao.put(newGuy, {
        put: function(emp) {
          this.ok('put() called on sink');
          this.assert(emp.name === 'Mike', 'New employee is named Mike');
          this.assert(emp.id, 'ID is now set by SeqNoDAO');
          this.assert(emp.company === 'ABC', 'Owner field overwritten properly.');
        }.bind(this),
        error: function() {
          this.fail('error called on sink');
        }.bind(this)
      }, X);
    },
    function testPut_Exists_OwnedByMe_NoOwner() {
      // Correct behavior: update normally.
      var dao = this.buildDAO();
      var X = this.Y.sub({ principal: 'ABC' });
      var original;
      dao.find(4, {
        put: function(obj) {
          original = obj;
        },
        error: function() {
          this.fail('could not find existing entry');
        }.bind(this)
      }, X);

      var clone = original.clone();
      clone.name = 'Jacksonic';
      clone.company = '';

      this.log('Performing put()');
      dao.put(clone, {
        put: function(emp) {
          this.ok('put() called on sink for put()');
          this.assert(emp.name === 'Jacksonic', 'Name updated properly');
          this.assert(emp.company === 'ABC', 'Owner unchanged');
          this.assert(emp.id === 4, 'ID unchanged');
        }.bind(this),
        error: function() {
          this.fail('error called on sink');
        }.bind(this)
      }, X);

      this.log('Check it stuck with find()');
      dao.find(4, {
        put: function(emp) {
          this.ok('put() called on sink for find()');
          this.assert(emp.name === 'Jacksonic', 'Name still updated');
        }.bind(this),
        error: function() {
          this.fail('error called on sink');
        }.bind(this)
      }, X);
    },
    function testPut_Exists_OwnedByMe_WithOwner() {
      // Correct behavior: update normally.
      var dao = this.buildDAO();
      var X = this.Y.sub({ principal: 'ABC' });
      var original;
      dao.find(4, {
        put: function(obj) {
          original = obj;
        },
        error: function() {
          this.fail('could not find existing entry');
        }.bind(this)
      }, X);

      var clone = original.clone();
      clone.name = 'Jacksonic';

      this.log('Performing put()');
      dao.put(clone, {
        put: function(emp) {
          this.ok('put() called on sink for put()');
          this.assert(emp.name === 'Jacksonic', 'Name updated properly');
          this.assert(emp.company === 'ABC', 'Owner unchanged');
          this.assert(emp.id === 4, 'ID unchanged');
        }.bind(this),
        error: function() {
          this.fail('error called on sink');
        }.bind(this)
      }, X);

      this.log('Check it stuck with find()');
      dao.find(4, {
        put: function(emp) {
          this.ok('put() called on sink for find()');
          this.assert(emp.name === 'Jacksonic', 'Name still updated');
        }.bind(this),
        error: function() {
          this.fail('error called on sink');
        }.bind(this)
      }, X);
    },
    function testPut_Exists_NotOwnedByMe_NoOwner() {
      // Correct behavior: reject.
      var dao = this.buildDAO();
      var goodX = this.Y.sub({ principal: 'ABC' });
      var badX = this.Y.sub({ principal: 'XYZ' });
      var original;
      dao.find(4, {
        put: function(obj) {
          original = obj;
        },
        error: function() {
          this.fail('could not find existing entry');
        }.bind(this)
      }, goodX);

      var clone = original.clone();
      clone.name = 'Jacksonic';
      clone.company = '';

      this.log('Performing put()');
      dao.put(clone, {
        put: function(emp) {
          this.fail('allowed to put() someone else\'s object!');
        }.bind(this),
        error: function() {
          this.ok('error called properly');
        }.bind(this)
      }, badX);

      this.log('Check with find() that nothing changed');
      dao.find(4, {
        put: function(emp) {
          this.ok('put() called on sink for find()');
          this.assert(emp.name === 'Jackson', 'Name not changed');
        }.bind(this),
        error: function() {
          this.fail('error called on sink');
        }.bind(this)
      }, goodX);
    },
    function testPut_Exists_NotOwnedByMe_CorrectOwner() {
      // Correct behavior: reject.
      var dao = this.buildDAO();
      var goodX = this.Y.sub({ principal: 'ABC' });
      var badX = this.Y.sub({ principal: 'XYZ' });
      var original;
      dao.find(4, {
        put: function(obj) {
          original = obj;
        },
        error: function() {
          this.fail('could not find existing entry');
        }.bind(this)
      }, goodX);

      var clone = original.clone();
      clone.name = 'Jacksonic';

      this.log('Performing put()');
      dao.put(clone, {
        put: function(emp) {
          this.fail('allowed to put() someone else\'s object!');
        }.bind(this),
        error: function() {
          this.ok('error called properly');
        }.bind(this)
      }, badX);

      this.log('Check with find() that nothing changed');
      dao.find(4, {
        put: function(emp) {
          this.ok('put() called on sink for find()');
          this.assert(emp.name === 'Jackson', 'Name not changed');
        }.bind(this),
        error: function() {
          this.fail('error called on sink');
        }.bind(this)
      }, goodX);
    },
    function testPut_Exists_NotOwnedByMe_MeAsOwner() {
      // Correct behavior: reject.
      var dao = this.buildDAO();
      var goodX = this.Y.sub({ principal: 'ABC' });
      var badX = this.Y.sub({ principal: 'XYZ' });
      var original;
      dao.find(4, {
        put: function(obj) {
          original = obj;
        },
        error: function() {
          this.fail('could not find existing entry');
        }.bind(this)
      }, goodX);

      var clone = original.clone();
      clone.name = 'Jacksonic';
      clone.company = 'XYZ';

      this.log('Performing put()');
      dao.put(clone, {
        put: function(emp) {
          this.fail('allowed to put() someone else\'s object!');
        }.bind(this),
        error: function() {
          this.ok('error called properly');
        }.bind(this)
      }, badX);

      this.log('Check with find() that nothing changed');
      dao.find(4, {
        put: function(emp) {
          this.ok('put() called on sink for find()');
          this.assert(emp.name === 'Jackson', 'Name not changed');
        }.bind(this),
        error: function() {
          this.fail('error called on sink');
        }.bind(this)
      }, goodX);
    },

    // Tests for remove()
    function testRemove_Exists_OwnedByMe() {
      var dao = this.buildDAO();
      var X = this.Y.sub({ principal: 'ABC' });
      dao.remove(4, {
        remove: function() {
          this.ok('remove succeeded');
        }.bind(this),
        error: function() {
          this.fail('remove failed');
        }.bind(this)
      }, X);

      this.log('Check that it\'s really gone with find, select');
      dao.find(4, {
        put: function() {
          this.fail('find succeeded: should be deleted!');
        }.bind(this),
        error: function() {
          this.ok('find failed: remove successful');
        }.bind(this)
      }, X);

      var sink = [].sink;
      dao.select(sink, undefined, X);
      this.assert(sink.length === 2, 'only 2 entries left after deletion');
      this.assert(sink.mapProp('name').indexOf('Jackson') < 0, 'deleted entry is gone');
    },
    function testRemove_Exists_NotOwnedByMe() {
      var dao = this.buildDAO();
      var goodX = this.Y.sub({ principal: 'ABC' });
      var badX = this.Y.sub({ principal: 'XYZ' });
      dao.remove(4, {
        remove: function() {
          this.fail('remove succeeded');
        }.bind(this),
        error: function() {
          this.ok('remove failed');
        }.bind(this)
      }, badX);

      this.log('Check that it\'s still there with find');
      dao.find(4, {
        put: function() {
          this.ok('find succeeded');
        }.bind(this),
        error: function() {
          this.ok('find failed: remove successful');
        }.bind(this)
      }, goodX);
    },
    function testRemove_NotExist() {
      var dao = this.buildDAO();
      var X = this.Y.sub({ principal: 'XYZ' });
      dao.remove(14, {
        remove: function() {
          this.fail('remove succeeded');
        }.bind(this),
        error: function() {
          this.ok('remove failed');
        }.bind(this)
      }, X);
    },
    function testRemove_NoPrincipal() {
      var dao = this.buildDAO();
      dao.remove(14, {
        remove: function() {
          this.fail('remove succeeded');
        }.bind(this),
        error: function() {
          this.ok('remove failed');
        }.bind(this)
      }, this.Y);
    },
  ]
});
