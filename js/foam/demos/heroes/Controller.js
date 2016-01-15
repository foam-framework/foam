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
    'foam.demos.heroes.CitationView',
    'foam.demos.heroes.DashboardCitationView',
    'foam.demos.heroes.Hero',
    'foam.u2.DAOListView',
    'foam.u2.DetailView',
    'foam.u2.tag.Checkbox'
  ],

  exports: [ 'editHero' ],

  properties: [
    {
      // model_: 'foam.core.types.DAOProperty',
      // type: 'DAO',
      name: 'heroDAO',
      toPropertyE: function(X) {
        return X.lookup('foam.u2.DAOListView').create({rowView: 'foam.demos.heroes.CitationView'}, X);
      },
      factory: function() {
        return JSONUtil.arrayToObjArray(this.X, [
	  { id: 11, name: "Mr. Nice"},
	  { id: 12, name: "Narco",     starred: true},
	  { id: 13, name: "Bombasto",  starred: true},
	  { id: 14, name: "Celeritas", starred: true},
	  { id: 15, name: "Magneta",   starred: true},
	  { id: 16, name: "RubberMan"},
	  { id: 17, name: "Dynama"},
	  { id: 18, name: "Dr IQ"},
	  { id: 19, name: "Magma"},
	  { id: 20, name: "Tornado"}
        ], this.Hero);
      }
    },
    {
      // model_: 'foam.core.types.DAOProperty',
      // type: 'DAO',
      name: 'starredHeroDAO',
      toPropertyE: function(X) {
        return X.lookup('foam.u2.DAOListView').create({rowView: 'foam.demos.heroes.DashboardCitationView'}, X);
      },
      factory: function() { return this.heroDAO.where(EQ(this.Hero.STARRED, true)); }
    },
    {
      name: 'view',
      defaultValue: 'dashboard'
    },
    {
      name: 'selection',
      toPropertyE: 'foam.u2.DetailView'
    }
  ],

  methods: [
    function editHero(hero) {
      this.selection = hero;
    }
  ],

  templates: [
    function CSS() {/*#U2
      h2 { color: #444; font-weight: lighter; }
      body { margin: 2em; }
      body, input[text], button { color: #888; font-family: Cambria, Georgia; }
      button { padding: 0.2em; font-size: 14px}
      * { font-family: Arial; }
    */},
    function initE() {/*#U2
      <div x:data={{this}}>
        <h2>Tour of Heroes</h2>
        <:dashboard/> <:heroes/>
        <br>
        {{ this.dynamic(function (s, v) {
          if ( s )                return this.detailE(X);
          if ( v == 'dashboard' ) return this.dashboardE(X);
          return this.heroesE(X);
        }.bind(this), this.selection$, this.view$)}}
      </div>
    */},
    function detailE() {/*#U2
      <div>
        {{this.selection.name$}} details!
        <:selection title=""/>
        <:back/>
      </div>
    */},
    function dashboardE() {/*#U2
      <div>
        <h3>Top Heroes</h3>
        <:starredHeroDAO/>
      </div>
    */},
    function heroesE() {/*#U2
      <div>
        <h3>My Heroes</h3>
        <:heroDAO/>
      </div>
    */}
  ],

  actions: [
    {
      name: 'dashboard',
      isEnabled: function() { return this.view != 'dashboard'; },
      code: function() { this.back(); this.view = 'dashboard'; }
    },
    {
      name: 'heroes',
      isEnabled: function() { return this.view != 'heroes'; },
      code: function() { this.back(); this.view = 'heroes'; }
    },
    {
      name: 'back',
      code: function() { this.selection = null; }
    }
  ]
});
