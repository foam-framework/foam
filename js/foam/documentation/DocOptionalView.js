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
  package: 'foam.documentation',
  name: 'DocOptionalView',
  extends: 'foam.documentation.DocView',
  documentation: 'A view wrapper for hiding content if a DAO is empty.',

  properties: [
    {
      name: 'data',
      hidden: false,
      postSet: function() {
        this.childData = this.data;
        if (this.data && this.data.select) {
          this.dao = this.data;
        } else {
          this.dao = [];
        }
      }
    },
    {
      name:  'dao',
      model_: 'foam.core.types.DAOProperty',
      factory: function() { return []; },
      onDAOUpdate: function() {
        var self = this;
        this.dao.select(COUNT())(function(c) {
          self.hasContent = c.count > 0;
        });
      }
    },
    {
      name: 'hasContent',
      defaultValue: false,
      postSet: function() {
        this.updateHTML();
      }
    }
  ]

});
