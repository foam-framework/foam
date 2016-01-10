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
  name: 'Contact',

  properties: [
    { name: 'id' },
    { type: 'String', name: 'first' },
    { type: 'String', name: 'last' },
    { type: 'EMail', name: 'email' },
    {
      name: 'avatar',
      defaultValueFn: function() { return this.last[0]; },
    },
    { type: 'String',
      name: 'color',
      factory: function() {
        var colors = 'e8ad62 9b26af 6639b6 4184f3 02a8f3 00bbd3 009587 0e9c57 9e9c57 8ac249 ccdb38 ffea3a f3b300 ff9700 ff5621 785447'.split(' ');
        var c = Math.abs(this.hashCode()) % colors.length;
        return '#' + colors[c];
      }
    }
  ]
});

function addContacts(dao) {
  JSONUtil.arrayToObjArray(X, [
    { first: "Harry", last: "Chandler", email: "Harry@Chandler.com" },
    { first: "Austin", last: "Nelson", email: "Austin@Nelson.com" },
    { first: "Ruby", last: "Romero", email: "Ruby@Romero.com" },
    { first: "Henry", last: "Vaughn", email: "Henry@Vaughn.com" },
    { first: "Katie", last: "Mason", email: "Katie@Mason.com" },
    { first: "Kayla", last: "Cunningham", email: "Kayla@Cunningham.com" },
    { first: "Lula", last: "Mitchell", email: "Lula@Mitchell.com" },
    { first: "Dana", last: "Erickson", email: "Dana@Erickson.com" },
    { first: "Chad", last: "Christensen", email: "Chad@Christensen.com" },
    { first: "Yvette", last: "Clarke", email: "Yvette@Clarke.com" },
    { first: "Danny", last: "Sims", email: "Danny@Sims.com" },
    { first: "Angelina", last: "Frazier", email: "Angelina@Frazier.com" },
    { first: "Delia", last: "Love", email: "Delia@Love.com" },
    { first: "Denise", last: "Gonzales", email: "Denise@Gonzales.com" },
    { first: "Brandi", last: "Palmer", email: "Brandi@Palmer.com" },
    { first: "Dexter", last: "Reed", email: "Dexter@Reed.com" },
    { first: "Ramona", last: "Craig", email: "Ramona@Craig.com" },
    { first: "Lyle", last: "Castillo", email: "Lyle@Castillo.com" },
    { first: "Ricardo", last: "Saunders", email: "Ricardo@Saunders.com" },
    { first: "Rose", last: "Goodman", email: "Rose@Goodman.com" },
    { first: "Pat", last: "Watson", email: "Pat@Watson.com" },
    { first: "Courtney", last: "Shelton", email: "Courtney@Shelton.com" },
    { first: "Lucille", last: "Becker", email: "Lucille@Becker.com" },
    { first: "Adrienne", last: "Benson", email: "Adrienne@Benson.com" },
    { first: "Sadie", last: "Phelps", email: "Sadie@Phelps.com" },
    { first: "Helen", last: "Jenkins", email: "Helen@Jenkins.com" },
    { first: "Irving", last: "Ortega", email: "Irving@Ortega.com" },
    { first: "Nora", last: "Fox", email: "Nora@Fox.com" },
    { first: "Caleb", last: "Blair", email: "Caleb@Blair.com" },
    { first: "Duane", last: "Sparks", email: "Duane@Sparks.com" },
    { first: "Sara", last: "Bowen", email: "Sara@Bowen.com" },
    { first: "Jackie", last: "Yates", email: "Jackie@Yates.com" },
    { first: "Jenna", last: "Hardy", email: "Jenna@Hardy.com" },
    { first: "Kenneth", last: "Greer", email: "Kenneth@Greer.com" },
    { first: "Kristina", last: "Davis", email: "Kristina@Davis.com" },
    { first: "Gail", last: "Wright", email: "Gail@Wright.com" },
    { first: "Garrett", last: "Byrd", email: "Garrett@Byrd.com" },
    { first: "Luz", last: "Hunter", email: "Luz@Hunter.com" },
    { first: "Janis", last: "Miller", email: "Janis@Miller.com" },
    { first: "Julie", last: "Bates", email: "Julie@Bates.com" },
    { first: "Bernice", last: "Roberson", email: "Bernice@Roberson.com" },
    { first: "Laura", last: "Brown", email: "Laura@Brown.com" },
    { first: "Terri", last: "Little", email: "Terri@Little.com" },
    { first: "Bradley", last: "Barton", email: "Bradley@Barton.com" },
    { first: "Patrick", last: "Ortiz", email: "Patrick@Ortiz.com" },
    { first: "Sonia", last: "Bass", email: "Sonia@Bass.com" },
    { first: "Edith", last: "Garrett", email: "Edith@Garrett.com" },
    { first: "Frankie", last: "Valdez", email: "Frankie@Valdez.com" },
    { first: "Jermaine", last: "Mccoy", email: "Jermaine@Mccoy.com" },
    { first: "Zachary", last: "Hayes", email: "Zachary@Hayes.com" }
  ], Contact).select(dao);
}
