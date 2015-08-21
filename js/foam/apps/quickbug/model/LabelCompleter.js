/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  name: 'LabelCompleter',
  package: 'foam.apps.quickbug.model',
  properties: [
    { model_: 'foam.core.types.DAOProperty', name: 'autocompleteDao' }
  ],
  requires: [
    'foam.apps.quickbug.model.QIssueLabel'
  ],
  imports: [
    'issueLabelDAO'
  ],
  methods: {
    autocomplete: function(data) {
      var src = this.issueLabelDAO;
      var dao = src.where(
        data ?
          STARTS_WITH_IC(this.QIssueLabel.LABEL, data) :
          TRUE);

      var self = this;
      dao.limit(2).select()(function(objs) {
        if ( objs.length === 1 && self.f(objs[0]) === data ) {
          self.autocompleteDao = src.where(FALSE);
        } else {
          self.autocompleteDao = dao;
        }
      });
    },
    f: function(issue) {
      return issue.label;
    }
  }
});
