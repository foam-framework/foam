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
  name: 'BrowserConfig',
  package: 'foam.navigator',

  documentation: function() {/*  */},

  requires: [
    'foam.dao.EasyDAO',
    'foam.dao.FutureDAO'
  ],

  constants: [
  ],

  properties: [
    {
      name: 'name',
      defaultValueFn: function() {
        if ( ! this.model ) return '';
        return (this.model.package ? this.model.package + '.' : '') + this.model.name;
      }
    },
    {
      type: 'Model',
      name: 'model',
      required: true
    },
    {
      name: 'dao',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.model,
          cache: true,
          seqNo: true,
          daoType: 'IDB'
        });
      }
    },
    {
      type: 'Function',
      name: 'queryParserFactory'
    },
    {
      name: 'iconURL',
      type: 'String',
      label: 'Icon'
    }
  ]
});
