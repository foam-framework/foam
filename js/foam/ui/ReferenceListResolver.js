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
  package: 'foam.ui',
  name: 'ReferenceListResolver',

  requires: [ 'foam.dao.ProxyDAO' ],

  documentation: function() {/* TODO: Change this into a proxy DAO.
    A generic replacement for a DAOKeyView.
    Use this controller to transform your reference list dao, and pass
    $$DOC{ref:'.resolvedData'} to your internal DAOListView. */},

  properties: [
    {
      name: 'dao',
      help: 'Source for resolving references',
      lazyFactory: function() {
        if (!this.subType) return undefined;
        var basename = this.subType.split('.').pop();
        // TODO: camelize()
        var lowercase = basename[0].toLowerCase() + basename.substring(1);
        return this.X[lowercase + 'DAO'] || this.X[basename + 'DAO'];
      }
    },
    {
      name: 'data',
      help: 'A dao of references to resolve',
      postSet: function(_, refs) {
        var subKey = this.X.lookup(this.subType + '.' + this.subKey);
        this.resolvedData.delegate = this.dao.where(IN(subKey, refs));
      }
    },
    { name: 'subType' },
    { name: 'subKey', defaultValue: 'ID' },
    {
      name: 'prop',
      postSet: function(old, nu) {
        if ( nu ) {
          nu.subType && (this.subType = nu.subType);
          nu.subKey && (this.subKey = nu.subKey);
        }
      }
    },
    {
      name: 'resolvedData',
      help: 'The resolved dao of references.',
      lazyFactory: function() {
        return this.ProxyDAO.create({ model: this.X.lookup(this.subType), delegate: [].dao });
      }
    }
  ],

});
