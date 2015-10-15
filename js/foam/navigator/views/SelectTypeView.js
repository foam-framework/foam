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
  name: 'SelectTypeView',
  package: 'foam.navigator.views',
  extends: 'foam.ui.DAOListView',
  label: 'Create what type?',
  requires: [
    'foam.navigator.views.CreateView',
    'foam.navigator.views.TypeCitationView',
  ],
  imports: ['overlay'],
  exports: ['selection$'],
  properties: [
    {
      name: 'rowView',
      defaultValue: function(args, opt_X) {
        return this.TypeCitationView.create(args, opt_X);
      }
    },
    {
      name: 'selection',
      postSet: function(old, nu) {
        if (nu && SimpleValue.isInstance(nu)) nu = nu.get();
        if (nu) {
          this.overlay.open(this.CreateView.create({
            model: nu
          }));
        }
      }
    }
  ]
});
