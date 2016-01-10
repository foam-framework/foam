/*
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
   "package": "foam.ui.layout",
   "name": "PositionedViewTrait",
   "properties": [
      {
         type: 'Float',
         "name": "x",
         "units": "px",
         "defaultValue": 0
      },
      {
         type: 'Float',
         "name": "y",
         "units": "px",
         "defaultValue": 0
      },
      {
         type: 'Float',
         "name": "z",
         "units": "px",
         "defaultValue": 0
      },
      {
         type: 'Int',
         "name": "width",
         "units": "px",
         "defaultValue": 100
      },
      {
         type: 'Int',
         "name": "height",
         "units": "px",
         "defaultValue": 100
      },
      {
         type: 'Int',
         "name": "preferredWidth",
         "units": "px",
         "defaultValue": 100
      },
      {
         type: 'Int',
         "name": "preferredHeight",
         "units": "px",
         "defaultValue": 100
      }
   ]
});
