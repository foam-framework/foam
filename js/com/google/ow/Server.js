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
  name: 'Server',
  package: 'com.google.ow',

  requires: [
    'com.google.plus.Person',
    'com.google.plus.ShareSink'
    'foam.dao.EasyDAO',
    'com.google.ow.model.Envelope',
  ],
  
  imports: [
    'exportDAO',
  ]

  exports: [
    'personDAO',
    'streamDAO',
    'createStreamItem',
  ],

  documentation: function() {/*  */},

  properties: [
    {
      name: 'personDAO',
      factory: function() {
        return this.EasyDAO.create({
          model: this.Person,
          name: 'people',
          daoType: MDAO,
//          cache: true,
          guid: true,
          isServer: true,
        });
      },
    },
    {
      name: 'streamDAO',
      factory: function() {
        var sd = this.EasyDAO.create({
          model: this.Envelope,
          name: 'streams',
          daoType: MDAO,
          guid: true,
          isServer: true,
        });
        return this.ShareSink.create({ delegate: sd });
      },
    },
    // {
    //   name: 'contentDAO',
    //   help: "Pool of shared content duplicated across Envelops in the streamDAO.",
    //   factory: function() {
    //     return this.EasyDAO.create({
    //       model: this.?????,
    //       name: 'content',
    //       daoType: MDAO,
    //       guid: true,
    //     });
    //   },
    // },
    {
      model_: 'FunctionProperty',
      name: 'createStreamItem',
      hidden: true,
      factory: function() {
        return function(source, target, data) {
          return this.Envelope.create({
            owner: target,
            source: source,
            data: data,
          });
        }.bind(this);
      },
    },
  ],
  
  methods: [
    function init() {
      this.SUPER();
      this.exportDAO(this.streamDAO);
      this.exportDAO(this.personDAO);
    }
  ]
});
