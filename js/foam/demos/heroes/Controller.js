/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.demos.heroes',
  name: 'Controller',
  extends: 'foam.u2.Element', 

  requires: [
    'foam.u2.DAOListView',
    'foam.demos.heroes.Hero'
  ],

  imports: [ 'dynamic' ],

  properties: [
    {
      type: 'DAO',
      name: 'heroDAO',
      toPropertyE: function() { return this.X.lookup('foam.u2.DAOListView').create(); },
      factory: function() {
        return JSONUtil.arrayToObjArray(this.X, [
	  {"id": 11, "name": "Mr. Nice"},
	  {"id": 12, "name": "Narco", starred: true},
	  {"id": 13, "name": "Bombasto", starred: true},
	  {"id": 14, "name": "Celeritas", starred: true},
	  {"id": 15, "name": "Magneta", starred: true},
	  {"id": 16, "name": "RubberMan"},
	  {"id": 17, "name": "Dynama"},
	  {"id": 18, "name": "Dr IQ"},
	  {"id": 19, "name": "Magma"},
	  {"id": 20, "name": "Tornado"}
        ], this.Hero);
      }
    },
    {
      type: 'DAO',
      name: 'starredHeroDAO',
      toPropertyE: function() { return this.X.lookup('foam.u2.DAOListView').create(); },
      factory: function() {
        return this.heroDAO.where(EQ(this.Hero.STARRED, true));
      }
    },
    {
      name: 'view',
      defaultValue: 'heroes'
    }
  ],

  templates: [
    function initE() {/*#U2
      <div x:data={{this}}>
        <div>Tour of Heroes</div>
        <:dashboard/> <:heroes/>
        <hr>
        <:starredHeroDAO style="display:{{this.dynamic(function(view) { return view == 'dashboard' ? 'block' : 'none'; }, this.view$)}};"/>
        <:heroDAO        style="display:{{this.dynamic(function(view) { return view == 'heroes'    ? 'block' : 'none'; }, this.view$)}};"/>
      </div>
    */}
  ],

  actions: [
    {
      name: 'dashboard',
      isEnabled: function() { return this.view != 'dashboard'; },
      code: function() { this.view = 'dashboard'; }
    },
    {
      name: 'heroes',
      isEnabled: function() { return this.view != 'heroes'; },
      code: function() { this.view = 'heroes'; }
    }
  ]
});
