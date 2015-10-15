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
  package: 'foam.ui.md',
  name: 'ResponsiveAppControllerView',
  extends: 'foam.ui.layout.ResponsiveView',

  requires: [
    'foam.ui.layout.ResponsiveViewOption',
    'foam.ui.md.TwoPane',
    'foam.ui.DetailView'
  ],

  properties: [
    {
      name: 'options',
      factory: function() {
        return [
          this.ResponsiveViewOption.create({
            data$: this.data$,
            controller: 'foam.ui.DetailView',
            minWidth: 0
          }),
          this.ResponsiveViewOption.create({
            data$: this.data$,
            controller: 'foam.ui.md.TwoPane',
            minWidth: 600
          })          
        ];
      }
    }
  ]
});
