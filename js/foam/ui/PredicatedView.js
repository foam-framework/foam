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
  name: 'PredicatedView',
  extends: 'foam.ui.View',

  properties: [
    {
      name: 'dao',
      help: 'Payload of the view; assumed to be a DAO.'
    },
    {
      name: 'predicate',
      defaultValueFn: function() { return TRUE; },
      postSet: function(_, p) { this.predicatedDAO = this.dao.where(p); }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'predicatedDAO'
    },
    {
      name: 'view',
      required: true,
      preSet: function(_, v) {
        if ( typeof v === 'string' ) v = this.Y.lookup(v);
        this.children = [v];
        v.data = v.dao = this.predicatedDAO$Proxy;
        return v;
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.Y_ = this.Y.sub({DAO: this.predicatedDAO$Proxy});
    },
    toHTML: function() { return this.view.toHTML(); },
    initHTML: function() { this.view.initHTML(); }
  }
});
