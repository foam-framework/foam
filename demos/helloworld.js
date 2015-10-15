/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved
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
  name: 'Person',
  properties: [ 'name' ]
});

CLASS({
  name: 'PersonView',

  extends: 'foam.ui.DetailView',

  templates: [
    {
      name: 'toHTML',
      template: '<span>Hello $$name{mode: "read-only"}</span>'
   }
  ]
});

var value = Person.create({ name: 'Adam' });
var view  = PersonView.create({ model: Person, data: value });

view.write();
