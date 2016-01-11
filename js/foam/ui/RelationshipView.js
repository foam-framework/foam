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
  name: 'RelationshipView',
  extends: 'foam.ui.View',

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        this.destroy();
        this.construct();
      }
    },
    {
      name: 'relationship',
      required: true
    },
    {
      name: 'args'
    },
    {
      type: 'ViewFactory',
      name: 'viewModel',
      defaultValue: 'foam.ui.DAOController'
    },
    {
      name: 'view'
    }
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);
      if ( this.args && this.args.model_ ) this.viewModel = this.args.model_
    },
  },
  templates: [
    function toInnerHTML() {/*
    <%
      this.view = this.viewModel({
        dao: this.data[this.relationship.name],
        model: this.relationship.relatedModel
      }, this.X).copyFrom(this.args);
      this.addChild(this.view);
    %>
    %%view */}
  ]
});
