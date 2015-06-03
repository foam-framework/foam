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

function ps(_, v) { return v ? v.intern() : v ; }

CLASS({
  package: 'foam.demos.olympics',
  name: 'Medal',

  properties: [
    { name: 'id',          hidden: true },
    { name: 'city',        preSet: ps },
    {
      name: 'color',
      preSet: ps,
      defaultValue: 'Gold',
      tableFormatter: function(c) {
        return '<span class="' + c + '">' + c + '</span>';
      },
      compareProperty: function(o1, o2) {
        return o1 === o2       ?  0 :
               o1 === 'Gold'   ? -1 :
               o1 === 'Bronze' ?  1 :
               o2 === 'Gold'   ?  1 : -1;
      }
    },
    { name: 'country',     preSet: ps },
    { name: 'discipline',  preSet: ps },
    { name: 'sport',       preSet: ps },
    { name: 'event',       preSet: ps },
    { name: 'eventGender', preSet: ps, defaultValue: 'M' },
    { name: 'firstName',   preSet: ps },
    { name: 'gender',      preSet: ps, defaultValue: 'Men' },
    { name: 'lastName',    preSet: ps },
    { model_: 'IntProperty', name: 'year' }
  ]
});
