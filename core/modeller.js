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

// localStorage.removeItem('Models');
    // to re-load models into local storage run the follow from JS shell: localStorage.removeItem('models');
    var models = [
       Action,
       AlternateView,
//       ApplicationPower,
//       BatteryMeter,
//       BookmarkModel,
//       CIssueBrowser,
//       Canvas,
//       CIssue,
//       CIssueTileView,
       Dragon,
       Circle,
       ClockView,
       DAOController,
       DAOCreateController,
       DAOUpdateController,
       EMail,
       EyeCView,
       EyesCView,
       Graph,
       Issue,
//        Method,
//       Model,
       Mouse,
//       NeedleMeter,
//       Power,
//       Property,
       Rectangle,
//       Screen,
       StackView,
       TextAreaView,
       Template,
       Timer,
       UnitTest,
       System,
       Developer,
//       EMail
    ];

var ModelDAO = StorageDAO.create({model: Model});
ModelDAO.find(TRUE, {error: function() { console.log('Populating DAO...'); models.select(ModelDAO); }});

// ModelDAO = ModelDAO.orderBy(Model.NAME);

var stack = StackView.create();
stack.write(document);
FOAM.browse(Model, ModelDAO);
