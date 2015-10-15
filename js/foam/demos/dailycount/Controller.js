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
  package: 'foam.demos.dailycount',
  name: 'Controller',
  extends: 'foam.ui.View',

  requires: [
    'foam.dao.EasyDAO',
    'foam.demos.dailycount.DailyCount',
    'foam.demos.dailycount.DailyThing',
    'foam.ui.DetailView'
  ],

  exports: [ 'counts' ],
  
  properties: [
    {
      name: 'things',
      view: 'foam.ui.DAOListView',
      factory: function() {
        return this.EasyDAO.create({
          model: this.DailyThing,
          cache: true,
          seqNo: true});
      }
    },
    {
      name: 'counts',
      view: 'foam.ui.TableView',
      factory: function() {
        return this.EasyDAO.create({
          model: this.DailyCount,
          cache: true,
          seqNo: true});
      }
    }
  ],

  actions: [
    {
      name: 'add',
      code: function() { this.things.put(this.DailyThing.create()); }
    }
  ],

  templates: [
    function toHTML() {/*
      $$things
      $$add
      <hr>
      $$counts
    */}
  ]
});
