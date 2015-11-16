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
__DATA({
  model_: 'Interface',
  package: 'foam.dao',
  name: 'Authorizer',

  documentation: function() {/*
    <p>This $$DOC{ref:'Interface'} describes the pluggable
    $$DOC{ref:'foam.dao.AuthorizedDAO.authorizer'} property of an
    $$DOC{ref:'foam.dao.AuthorizedDAO'}.</p>
    <p>Care should be taken in implementing an Authorizer to ensure that each
    operation safely defaults to allowing nothing, when access is not permitted.
    </p>
  */},

  methods: [
    {
      name: 'massageForPut',
      description: 'Prepares an object to be put() into the DAO.',
      documentation: function() {/*
        <p>Calls ret() with an updated object, or null if the put should be
        denied. (If, for example, an object with that ID already exists and this
        user lacks permission to write it.)</p>
        <p>Passed the current object with the same id, if any (null if not).
        Should clone the new object before making any changes.</p>
      */},
      args: [
        { name: 'ret', type: 'Function', documentation: 'afunc return callback' },
        { name: 'X', documentation: 'The context that this request is coming in' },
        { name: 'old', documentation: 'The original object, or null if this is a new ID.' },
        { name: 'nu', documentation: 'The new object the user wishes to put.' }
      ]
    },
    {
      name: 'massageForRead',
      description: 'Prepares an object to be returned to the user.',
      documentation: function() {/*
        <p>Returns an object that is safe to be sent to the current user. Often
        no change is needed here, but this method might eg. erase
        server-only or hidden properties.</p>
        <p>If the object should actually be denied the user, this should return
        null or false.</p>
        <p>Note that this method is called in four cases:
          <ul>
            <li>On a find()</li>
            <li>On the result of a put() before returning it to the sink.</li>
            <li>On the result of a remove() before returning it to the sink.</li>
            <li>On the results found by select() before returning them.</li>
          </ul>
          and this method should do the right thing for all of them.</p>
        <p>Note also that the object should be cloned before changes are made.</p>
      */},
      args: [
        { name: 'ret', type: 'Function', documentation: 'afunc return callback' },
        { name: 'X', documentation: 'The context that this request is coming in' },
        { name: 'obj', documentation: 'The object to be returned.' }
      ],
      returnType: 'Function'
    },
    {
      name: 'shouldAllowRemove',
      description: 'Called to check validity of a remove()',
      documentation: function() {/*
        <p>Calls the ret callback with a boolean: true if this user should be
        permitted to remove the given object, and false if the remove should be
        denied.</p>
      */},
      args: [
        { name: 'ret', type: 'Function', documentation: 'afunc return callback' },
        { name: 'X', documentation: 'The context that this request is coming in' },
        { name: 'obj', documentation: 'The original object. null if it doesn\'t exist.' }
      ]
    },
    {
      name: 'decorateForSelect',
      description: 'Decorates a DAO to return only those objects this user can read.',
      documentation: function() {/*
        <p>Calls the ret callback with a decorated DAO. That DAO should ideally
        return only objects this user is allowed to see. The returned values
        still pass through $$DOC{ref:'.massageForRead'}, which can handle any
        conditions that can't be expressed as a where() clause.</p>
      */},
      args: [
        { name: 'ret', type: 'Function', documentation: 'afunc return callback' },
        { name: 'X', documentation: 'The context that this request is coming in' },
        { name: 'dao', documentation: 'The original DAO, to be decorated.' }
      ]
    }
  ]
});
