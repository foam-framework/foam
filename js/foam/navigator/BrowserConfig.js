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

  requires: [
    'EasyDAO',
    'FutureDAO'
  ],

  constants: [
  ],

  properties: [
    {
      name: 'model',
      required: true
    },
    {
      name: 'dao',
      model_: 'FactoryProperty',
      factory: function() {
        return this.FutureDAO.create({
          future: aseq(
            arequire(this.model),
            function(ret, model) {
              ret(this.EasyDAO.create({
                model: model,
                cache: true,
                seqNo: true,
                daoType: 'IDB'
              }));
            }.bind(this)
          )
        });
      }
    },
    {
      name: 'queryParserModelName',
      model_: 'StringProperty'
    },
    {
      name: 'iconURL',
      model_: 'StringProperty',
      label: 'Icon'
    }
  ]
});
