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
  name: 'DocFeatureCollapsedView',
  extends: 'foam.documentation.DocBodyView',
  documentation: 'A generic view for collapsed sets.',

  properties: [
    {
      name: 'data',
      postSet: function() {
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
          self.count = c.count;
        });
      }
    },
    {
      name: 'count',
      postSet: function() {
        this.updateHTML();
      }
    }
  ],

  templates: [
    function toInnerHTML() {/*
      <p><%=this.count%> more...</p>
    */}
  ]
});
