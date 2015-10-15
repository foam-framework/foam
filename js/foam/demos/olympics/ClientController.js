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

// Run server with: node --harmony tools/foam.js foam.demos.olympics.Server
CLASS({
  package: 'foam.demos.olympics',
  name: 'ClientController',
  extends: 'foam.demos.olympics.Controller',
  requires: [
    'foam.demos.olympics.Medal',
    'foam.dao.EasyClientDAO',
  ],
  imports: [
    'document'
  ],
  properties: [
    {
      name: 'dao',
      factory: function() {
	return this.EasyClientDAO.create({
	  serverUri: this.document.location.origin + '/api',
	  model: this.Medal
	})
      }
    }
  ]
});
