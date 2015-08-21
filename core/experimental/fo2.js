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

var FeatureSet = {
  create: function() {
    var obj = Object.create(this);
    obj.a_ = [];
    obj.version_ = 1;
    obj.parentVersion_ = 0;
    obj.names_ = {};
    return obj;
  },

  where: function(p) {
    return {
      __proto__: this,
      forEach: function(iterator) {
        return this.__proto__.forEach.call(this, function(f) {
          if ( p(f) ) iterator(f);
        });
      },
      localForEach: function(iterator) {
        return this.__proto__.localForEach.call(this, function(f) {
          if ( p(f) ) iterator(f);
        });
      },
    };
  },

  forEach: function(iterator) {
    var self = this;
    if ( this.parent )
      this.parent.where(function(f) {
        return !f.name || !self.names_[f.name];
      }).forEach(iterator);
    this.localForEach(iterator);
  },

  localForEach: function(iterator) {
    for ( var i = 0; i < this.a_.length; i++ ) {
      var f = this.a_[i];

      if ( f.name && f !== this.names_[f.name] )
        continue;

      iterator(this.a_[i]);
    }
  },

  add: function(a) {
    if ( a.name ) this.names_[a.name] = a;
    this.a_.push(a);
    this.version_++;
  },

  get parent() { return this.parent_; },
  set parent(p)  { this.parent_ = p; },

  get version() {
    return this.version_;
  }
};

function defineLocalProperty(cls, name, factory) {
  Object.defineProperty(cls, name, { get: function() {
    if ( this == cls ) return null;
    var value = factory.call(this);
    Object.defineProperty(this, name, { value: value });
    return value;
  } });
}

Object.defineProperty(Object.prototype, 'this_', {
  get: function() { return this; }
});

Object.defineProperty(Object.prototype, 'express', {
  value: function(concept, individual) {
    concept[individual.name] = individual;
  },
  writable: true,
  configurable: true
});

var rootFeatureSet = [
  ['Todo', 'BooleanProperty', {
    name: 'completed'
  }],
  ['Todo', 'Property', {
    name: 'text'
  }],
  ['Todo', 'Property', {
    name: 'id',
  }],
  ['Todo', 'Property', {
    name: 'priority'
  }],


  ['foam.ui.TextFieldView', 'Method', function toHTML() {
    return
  }],

/*
  ['TodoController', 'Property', {
    name: 'input',
    setter: function(text) {
      this.todoDAO.put(Todo.create({ text: text }));
    },
    view: { model_: 'foam.ui.TextFieldView', placeholder: 'What needs to be done?' }
  }],
  ['TodoController', 'Property', {
    name: 'todoDAO'
  }],
  ['TodoController', 'foam.core.types.DAOProperty', {
    name: 'filteredDAO',
    view: { model_: 'DAOListController', rowView: 'TodoView' }
  }],
  ['TodoController', 'IntProperty', {
    name: 'completedCount',
  }],
  ['TodoController', 'IntProperty', {
    name: 'activeCount',
  }],
  ['TodoController', 'IntProperty', {
    name: 'query',
    postSet: function(_, q) {
      this.filteredDAO = this.todoDAO.where(q);
    },
    defaultValue: TRUE,
    view: {
      model_: 'ChoiceListView',
      choices: [ [ TRUE, 'All' ], [ NOT(Todo.COMPLETED), 'Active' ], [ Todo.COMPLETED, 'Completed' ] ]
    }
  }],
  ['TodoController', 'Action', {
    name: 'toggle',
    action: function() {
      this.todoDAO.select(UPDATE(SET(Todo.COMPLETED, this.activeCount), this.todoDAO));
    }
  }],
  ['TodoController', 'Listener', {
    name: 'onDAOUpdate',
    isFramed: true,
    code: function() {
        this.todoDAO.select(GROUP_BY(Todo.COMPLETED, COUNT()))(function (q) {
          this.completedCount = q.groups['true'];
          this.activeCount    = q.groups['false'];
        }.bind(this));
      }
  }],
  ['TodoController', 'Method', {
    name: 'init',
    code: function() {
      this.SUPER();
      this.todoDAO = X.lookup('foam.dao.EasyDAO').create({
        model: Todo,
        seqNo: true,
        cache: true,
        seqProperty: Todo.ID
      });
      this.query = this.query;
      this.todoDAO.listen(this.onDAOUpdate);
      this.onDAOUpdate();
    }
  }]*/
];

function afuture() {
  var set     = false;
  var values  = undefined;
  var waiters = [];

  return {
    set: function() {
      if ( set ) {
        console.log('ERROR: redundant set on future');
        return;
      }
      values = arguments;
      set = true;
      for (var i = 0 ; i < waiters.length; i++) {
        waiters[i].apply(null, values);
      }
      waiters = undefined;
    },

    get: function(ret) {
      if ( set ) { ret.apply(null, values); return; }
      waiters.push(ret);
    }
  };
};

function fact(concept, role, individual) {
  if ( ! this[concept] ||
       this[concept].__futureFeature__ ) this[concept] = {};

  if ( Array.isArray(role) ) {
    for ( var i = 0; i < role.length; i++ ) {
      fact.call(this, concept, role[i], individual);
    }
    return;
  }

  if ( ! this[role] ) {
    var future = afuture();
    future.__futureFeature__ = true;

    var scope = this;
    Object.defineProperty(this, role, {
      configurable: true,
      get: function() { return future; },
      set: function(value) {
        Object.defineProperty(scope, role, {
          value: value,
          writable: true,
          configurable: true
        });

        if ( value.hasOwnProperty(express) ) {
          future.set(value)
        } else {
          Object.defineProperty(value, 'express', {
            configurable: true,
            get: function() { return future; },
            set: function(value2) {
              Object.defineProperty(value, 'express', {
                value: value2,
                writable: true
              });
              future.set(value);
            }
          });
        }
      }
    });
  }

  if ( this[role].__futureFeature__ ) {
    var scope = this;
    this[role].get(function() {
      fact.call(scope, concept, role, individual);
    });
    return;
  }

  if ( Array.isArray(individual) ) {
    for ( i = 0; i < individual.length; i++ ) {
      fact.call(this, concept, role, individual[i]);
    }
    return;
  }

  this[role].express(this[concept], individual);
}

function build(scope) {
  for ( var i = 0; i < rootFeatureSet.length; i++ ) {
    var f = rootFeatureSet[i];

    var concept = f[0];
    var role = f[1];
    var individual = f[2];

    fact.call(scope, concept, role, individual)
  }
}
debugger;
build(window);
