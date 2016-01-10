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
  name: 'Issue',
  package: 'foam.navigator.types',
  extends: 'foam.navigator.BasicFOAMlet',

  properties: [
    {
      name: 'id'
    },
    {

      model_: 'foam.core.types.StringEnumProperty',
      name: 'type',
      defaultValue: 'BUG',
      view: 'foam.ui.ChoiceView',
      choices: [
        ['BUG', 'Bug'],
        ['FEATURE_REQUEST', 'Feature Request'],
        ['CUSTOMER_ISSUE', 'Customer Issue'],
        ['INTERNAL_CLEANUP', 'Internal Cleanup'],
        ['PROCESS', 'Process']
      ]
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'status',
      defaultValue: 'NEW',
      view: 'foam.ui.ChoiceView',
      choices: [
        ['NEW', 'New'],
        ['ASSIGNED', 'Assigned'],
        ['ACCEPTED', 'Accepted'],
        ['FIXED', 'Fixed'],
        ['VERIFIED', 'Verified'],
        ['NOT_REPRODUCIBLE', 'Not Reproducible'],
        ['INTENDED_BEHAVIOR', 'Working as Intended'],
        ['OBSOLETE', 'Obsolete'],
        ['INFEASIBLE', 'Infeasible'],
        ['DUPLICATE', 'Duplicate']
      ]
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'priority',
      defaultValue: 'P2',
      view: 'foam.ui.ChoiceView',
      choices: ['P0', 'P1', 'P2', 'P3', 'P4']
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'severity',
      defaultValue: 'S2',
      view: 'foam.ui.ChoiceView',
      choices: ['S0', 'S1', 'S2', 'S3', 'S4']
    },
    {
      type: 'Boolean',
      name: 'starred',
      defaultValue: false
    },
    {
      name: 'title'
    },
    {
      name: 'comment'
    },
    {
      type: 'StringArray',
      name: 'cc',
      preSet: function(old, nu) {
        return nu || [];
      }
    },
    {
      name: 'assignee'
    },
    {
      name: 'reporter'
    }
  ]
});
