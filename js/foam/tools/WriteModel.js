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
  package: 'foam.tools',
  name: 'WriteModel',
  requires: [
    'node.dao.JSModelFileDAO'
  ],
  properties: [
    {
      name: 'name',
      help: 'ID of the model to serialize',
      required: true
    }
  ],
  methods: {
    execute: function() {
      this.X.arequire(this.name)(function(m) {
        var dao = this.JSModelFileDAO.create();
        dao.put(m, {
          put: function(o) {
            console.log("Wrote model: ", o.id);
            process.exit(0);
          },
          error: function() {
            var args = argsToArray(arguments);
            console.log("ERROR: ", args.join(''));
            process.exit(1);
          }
        });
      }.bind(this));
    }
  }
});
