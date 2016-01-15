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
  package: 'foam.ui',
  name: 'AbstractDAOView',
  extends: 'foam.ui.SimpleView',

  documentation: function() { /*
     <p>For $$DOC{ref:'foam.ui.View',usePlural:true} that take data items from a $$DOC{ref:'DAO'}
     and display them all, $$DOC{ref:'.'} provides the basic interface. Set or bind
     either $$DOC{ref:'.data'} or $$DOC{ref:'.dao'} to your source $$DOC{ref:'DAO'}.</p>
     <p>Call $$DOC{ref:'.onDAOUpdate'} to indicate a data change that should be
      re-rendered.</p>
  */},

  exports: [ 'dao as daoViewCurrentDAO' ],

  properties: [
    {
      name: 'data',
      postSet: function(oldDAO, dao) {
        if ( this.dao !== dao ) {
          this.dao = dao;
        }
      },
      documentation: function() { /*
          Sets the $$DOC{ref:'DAO'} to render items from. Use $$DOC{ref:'.data'}
          or $$DOC{ref:'.dao'} interchangeably.
      */}
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      label: 'DAO',
      help: 'An alias for the data property.',
      onDAOUpdate: 'onDAOUpdate',
      postSet: function(oldDAO, dao) {
        if (!dao) {
          this.data = '';
        } else if ( this.data !== dao ) {
          this.data = dao;
        }
      },
      documentation: function() { /*
          Sets the $$DOC{ref:'DAO'} to render items from. Use $$DOC{ref:'.data'}
          or $$DOC{ref:'.dao'} interchangeably.
      */}
    }
  ],

  methods: {
    onDAOUpdate: function() { /* Implement this $$DOC{ref:'Method'} in
          sub-models to respond to changes in $$DOC{ref:'.dao'}. */ }
  }
});
