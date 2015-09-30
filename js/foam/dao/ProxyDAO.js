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
  name: 'ProxyDAO',

  extendsModel: 'AbstractDAO',

  requires: [ 'foam.dao.NullDAO' ],

  documentation: function() {/*
    Provides a proxy to the $$DOC{ref:'.delegate'} DAO, and allows swapping out the
    $$DOC{ref:'.delegate'} transparently
    to any listeners of this $$DOC{ref:'.'}.
  */},

  properties: [
    {
      name: 'delegate',
      type: 'DAO',
      mode: "read-only",
      hidden: true,
      required: true,
      transient: true,
      documentation: "The internal DAO to proxy.",
      factory: function() { return this.NullDAO.create(); }, // TODO: use singleton
      postSet: function(oldDAO, newDAO) {
        if ( this.daoListeners_.length ) {
          if ( oldDAO ) oldDAO.unlisten(this.relay());
          newDAO.listen(this.relay());
          // FutureDAOs will put via the future. In that case, don't put here.
          this.notify_('reset', []);
        }
      }
    },
    {
      model_: 'ModelProperty',
      name: 'model',
      type: 'Model',
      defaultValueFn: function() { return this.delegate.model; },
      documentation: function() { /*
          <p>Determines the expected $$DOC{ref:'Model'} type for the items
            in this $$DOC{ref:'DAO'}.</p>
          <p>The properties of the $$DOC{ref:'Model'} definition specified
            here may be used when filtering and indexing.</p>
      */}
    }
  ],

  methods: {
    relay: function() { /* Sets up relay for listening to delegate changes. */
      if ( ! this.relay_ ) {
        var self = this;

        this.relay_ = {
          put:    function() { self.notify_('put', arguments);    },
          remove: function() { self.notify_('remove', arguments); },
          reset: function() { self.notify_('reset', arguments); },
          toString: function() { return 'RELAY(' + this.$UID + ', ' + self.model_.name + ', ' + self.delegate + ')'; }
        };
      }

      return this.relay_;
    },

    put: function(value, sink) { /* Passthrough to delegate. */
      this.delegate.put(value, sink);
    },

    remove: function(query, sink) { /* Passthrough to delegate. */
      this.delegate.remove(query, sink);
    },

    removeAll: function() { /* Passthrough to delegate. */
      return this.delegate.removeAll.apply(this.delegate, arguments);
    },

    find: function(key, sink) { /* Passthrough to delegate. */
      this.delegate.find(key, sink);
    },

    select: function(sink, options) { /* Passthrough to delegate. */
      return this.delegate.select(sink, options);
    },

    listen: function(sink, options) { /* Passthrough to delegate, using $$DOC{ref:'.relay'}. */
      // Adding first listener, so listen to delegate
      if ( ! this.daoListeners_.length && this.delegate ) {
        this.delegate.listen(this.relay());
      }

      this.SUPER(sink, options);
    },

    unlisten: function(sink) { /* Passthrough to delegate, using $$DOC{ref:'.relay'}. */
      this.SUPER(sink);

      // Remove last listener, so unlisten to delegate
      if ( this.daoListeners_.length === 0 && this.delegate ) {
        this.delegate.unlisten(this.relay());
      }
    },

    toString: function() { /* String representation. */
      return this.name_ + '(' + this.delegate + ')';
    }
  }
});
