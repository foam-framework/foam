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
  name: 'EditView',
  extends: 'foam.ui.View',
  properties: [
    {
      name: 'modelName',
      postSet: function() {
        this.X.arequire(this.modelName)(function(m) {
          this.model = m
        }.bind(this));
      }
    },
    {
      name: 'model',
      postSet: function() {
        this.view = this.model.create();
      }
    },
    {
      name: 'view',
      view: 'foam.ui.DetailView',
      postSet: function() {
        this.updateHTML();
      }
    }
  ],
  templates: [
    function toInnerHTML() {/*<%= this.view %><br>$$view*/}
  ]
});
