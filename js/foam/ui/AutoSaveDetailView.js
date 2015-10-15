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
  name: 'AutoSaveDetailView',
  extends: 'foam.ui.DetailView',
  documentation: function() {/*
    <p>This is a $$DOC{ref:'foam.ui.DetailView'} that calls a user-defined
    $$DOC{ref:".onEdit"} callback whenever a property of $$DOC{ref:".data"}
    changes.</p>

    <p>Users of this view should subclass it and override $$DOC{ref:".onEdit"}.</p>
  */},
  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if (old) old.removeListener(this.onDataChange);
        if (nu) nu.addListener(this.onDataChange);
      },
    },
  ],

  listeners: [
    {
      name: 'onDataChange',
      code: function() {
        this.onEdit.apply(this, arguments);
      }
    },
  ],

  methods: {
    onEdit: function() {
      /* Does nothing by default. Override me! */
    },
  },
});
