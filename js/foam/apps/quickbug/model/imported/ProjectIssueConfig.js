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
   "package": "foam.apps.quickbug.model.imported",
   "name": "ProjectIssueConfig",
   "tableProperties": [
      "defaultColumns",
      "defaultPromptForMembers",
      "defaultPromptForNonMembers",
      "defaultSorting",
      "kind",
      "labels",
      "prompts",
      "restrictToKnown",
      "statuses",
      "usersCanSetLabels"
   ],
   "properties": [
      {
         type: 'StringArray',
         "name": "defaultColumns",
         "help": "Default column ordering defined for this project."
      },
      {
         type: 'Int',
         "name": "defaultPromptForMembers",
         "help": "Index into the prompts list of the default prompt for project members."
      },
      {
         type: 'Int',
         "name": "defaultPromptForNonMembers",
         "help": "Index into the prompts list of the default prompt for non-project-members."
      },
      {
         type: 'StringArray',
         "name": "defaultSorting",
         "help": "Default sort specification defined for this project."
      },
      {
         type: 'String',
         "name": "kind",
         "help": "Issue tracker configuration for a project."
      },
      {
         type: 'Array',
         "name": "labels",
         "help": "Pre-defined issue labels configured for this project, e.g., \"Type-Defect\", \"Priority-Medium\", etc."
      },
      {
         type: 'Array',
         "name": "prompts",
         "help": "Pre-defined issue prompts configured for this project, e.g., \"User defect report\", \"Review request\", etc."
      },
      {
         type: 'Boolean',
         "name": "restrictToKnown",
         "help": "Whether or not the project restricts issue labels and statuses to the pre-defined values."
      },
      {
         type: 'Array',
         "name": "statuses",
         "help": "Pre-defined issue statuses configured for this project, e.g., \"New\", \"Accepted\", etc."
      },
      {
         type: 'Boolean',
         "name": "usersCanSetLabels",
         "help": "Whether non-project-members can set labels on new issues."
      }
   ]
});
