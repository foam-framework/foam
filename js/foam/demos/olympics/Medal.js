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
  package: 'foam.demos.olympics',
  name: 'Medal',

requires: [ 'foam.u2.Element' ],  //////////// Added this line HERE

  properties: [
    { name: 'id', hidden: true },
    { name: 'year', shortName: 'y'  },
    {
      name: 'color',
      defaultValue: 'Gold',
      shortName: 'c',
      aliases: ['colour', 'medal'],
      xxxtableFormatter: function(c) {
        return '<span class="' + c + '">' + c + '</span>';
      },
      tableFormatter: function(c, owner) {
        var e = owner.Element.create({ nodeName: 'span'});
        this.X.setTimeout(function() { e.cls(c); e.c(c); }, 100+Math.random()*500);
        return e;
      },
      compareProperty: function(o1, o2) {
        return o1 === o2       ?  0 :
               o1 === 'Gold'   ? -1 :
               o1 === 'Bronze' ?  1 :
               o2 === 'Gold'   ?  1 : -1;
      }
    },
    { name: 'city',        shortName: 'cy' },
    { name: 'country',     shortName: 'cn' },
    { name: 'discipline',  shortName: 'd' },
    { name: 'sport',       shortName: 's' },
    { name: 'event',       shortName: 'e' },
    { name: 'eventGender', shortName: 'eg', defaultValue: 'M' },
    { name: 'gender',      shortName: 'g', aliases: ['sex'], defaultValue: 'Men' },
    { name: 'firstName',   shortName: 'f', aliases: ['fname', 'fn', 'first'] },
    { name: 'lastName',    shortName: 'l', aliases: ['lname', 'ln', 'last'] }
  ]
});
