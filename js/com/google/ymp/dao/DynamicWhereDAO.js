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
  package: 'com.google.ymp.dao',
  name: 'DynamicWhereDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: function() {/*
    <p>$$DOC{ref:'foam.dao.ProxyDAO'} that updates its .where()
    predicate based on a dynamic property value.</p>
  */},

  properties: [
    {
      name: 'sourceDelegate',
      postSet: function(old, nu) {
        this.model = nu.model;
        this.rebuildDelegate();
      }
    },
    {
      name: 'predicate',
      defaultValue: EQ,
      postSet: function(old,nu) {
        this.rebuildDelegate();
      },
    },
    {
      name: 'property',
      help: 'Set this to the YourModel.PROPERTY to pass as parameter 1 of your predicate.',
    },
    {
      name: 'parameter',
      help: 'Bind this to the value to use as parameter 2 of your predicate.',
      postSet: function(old,nu) {
        this.rebuildDelegate();
      }
    }
  ],
  methods: [
    function init() {
      this.SUPER();
      this.rebuildDelegate();
    },
    function rebuildDelegate() {
      if ( ! this.sourceDelegate ) return;
      if ( true || ! this.predicate || ! this.property || ! this.parameter ) { //TODO: make delegate swithcing work. Setting the delegate more than once isn't updating the predicate the IDBDAO thinks it has.
        this.delegate = this.sourceDelegate;
        return;
      }
      this.delegate = this.sourceDelegate.where(this.predicate(this.property, this.parameter));
    }
  ]
});
