/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

FOAModel({
   name: 'Feature',
   plural:'Features',
   help:  "A feature of a Model.",

    ids: [
      'model','name'
    ],

    tableProperties: [
      'model',
      'type',
      'name'
    ],

    properties: [
       {
          name:  'model',
          type:  'String'
       },
       {
           name:  'name',
           type:  'String',
           defaultValue: '',
           help: 'The coding identifier for the property.'
       },
       {
           name: 'type',
           type: 'String',
           required: true,
           view: {
              create: function() { return ChoiceView.create({choices: [
                 'Property',
                 'Method',
                 'Listener',
                 'Template',
                 'Issue',
                 'Test'
              ]});}
           },
           defaultValue: 'Property',
           help: 'Type of a feature.'
       },
       {
           name: 'label',
           type: 'String',
           required: false,
           displayWidth: 70,
           displayHeight: 1,
           defaultValueFn: function() { return this.name.capitalize(); },
           help: 'The display label for the property.'
       }
    ]
});


var header = $('header');
var footer = $('footer');
var search = $('search');
var browse = $('browse');
var edit   = $('edit');

var reversed = false;

function pos(e, top, left, width, height) {
  var s = e.style;
  left = left || 0;

  if ( reversed ) left = (window.innerWidth - 15) - left - (width || toNum(e.style.width));

  top != null && (e.style.top = toNum(top) + 'px');
  left != null && (e.style.left = toNum(left) + 'px');
  width != null && (e.style.width = toNum(width) + 'px');
  height != null && (e.style.height = toNum(height) + 'px');
}

var MIN_THREE_COLUMN_W = 1600;
var table;

function layout() {
  var W         = window.innerWidth - 15;
  var H         = window.innerHeight-5;
  var HEADER_H  = 60;
  var FOOTER_H  = 0;
  var SEARCH_W  = 300;
  var SEARCH_H  = H - HEADER_H - FOOTER_H;
  var RIGHT_W   = W - SEARCH_W;

  pos(header,null,null,W,HEADER_H-10);
  pos(search, HEADER_H, null, SEARCH_W, SEARCH_H);

  if ( W > MIN_THREE_COLUMN_W ) {
    pos(browse, HEADER_H, SEARCH_W + 10, RIGHT_W * 0.3, SEARCH_H);
    pos(edit, HEADER_H, SEARCH_W + 10 + RIGHT_W * 0.3, RIGHT_W * 0.7, SEARCH_H-15);
  } else {
    pos(browse, HEADER_H, SEARCH_W + 10, RIGHT_W, SEARCH_H/2);
    pos(edit,
      toNum(browse.style.top) + toNum(browse.style.height) + 5,
      SEARCH_W + 10,
      RIGHT_W-10,
      SEARCH_H / 2 -20);
  }
  pos(footer, H-FOOTER_H, null, W, FOOTER_H);
}

window.onresize = layout;
layout();

//    var dao = StorageDAO.create({model: Feature});
    var dao = [];

    function importFeatures(m, features, type) {
      if ( ! features ) return;
      for ( var i = 0 ; i < features.length ; i++ ) {
        var f = Feature.create(features[i]);
        if ( ! f.name && features[i].description ) f.name = features[i].description;
        if ( ! f.name && features[i].summary ) f.name = features[i].summary;
        if ( ! f.name || typeof f.name !== 'string' ) continue;
        f.model = m.name;
        f.type = type;
        f.obj = features[i];
        dao.put(f);
      }
    }
    for ( key in window ) {
      var m = window[key];
      if ( ! ( m && m.model_ && m.model_ === Model ) ) continue;
      console.log('Model: ', m.name);

      var f = Feature.create(m);
      f.model = '- GLOBAL -';
      f.type = 'Model';
      f.obj = m;
      dao.put(f);

      importFeatures(m, m.properties, 'Property');
      importFeatures(m, m.methods,    'Method');
      importFeatures(m, m.listeners,  'Listener');
      importFeatures(m, m.templates,  'Template');
      importFeatures(m, m.tests,      'Test');
      importFeatures(m, m.issues,     'Issue');
      importFeatures(m, m.models,     'Model');
    };

/*
    var dao = MDAO.create({model: EMail});
    emails.select(dao);
    dao.bulkLoad(dao);
    dao.addIndex(EMail.TO);
    dao.addIndex(EMail.FROM);
    dao.addIndex(EMail.SUBJECT);
*/
    var table = TableView.create({
      model: Feature,
      dao: dao,
      rows: 20,
      scrollEnabled: true
    });

    var searchSubject = TextSearchView.create({width:44, label: 'Search',
      property: { __proto__: Feature.NAME, f: function(o) { return o.toJSON(); } }});
    var byModel = GroupBySearchView.create({width: 33, size: 15, dao: dao, property: Feature.MODEL});
    var byType = GroupBySearchView.create({width: 33, size: 8, dao: dao, property: Feature.TYPE});
    var byName = GroupBySearchView.create({width: 33, size: 8, dao: dao, property: Feature.NAME});
    Object.defineProperty(byModel, 'updateChoice', {value: (function(newValue, oldValue) {
       var choice = newValue.get();
       if ( choice ) {
          this.predicate = EQ(this.property, choice);

          var matchType = modelMatchType.value.get();

          if ( matchType !== 'Exact' ) this.predicate.f = function(obj) {
             var arg1 = this.arg1.f(obj);
             var arg2 = this.arg2.f(obj);
             var m1 = GLOBAL[arg1];
             var m2 = GLOBAL[arg2];

             if ( m1 && m2 ) return matchType === 'Super' ? m1.isSubModel(m2) : m2.isSubModel(m1);

             return arg1 === arg2;
          };
       } else {
          this.predicate = TRUE;
       }
    }).bind(byModel)});

    var modelMatchType = RadioBoxView.create({
      name: 'modelMatchType',
      choices: ['Super', 'Exact', 'Sub']
    });
    modelMatchType.data = 'Exact';
    browse.innerHTML = table.toHTML();
    searchSubject.insertInElement('subjectSearch');
    byModel.insertInElement('modelSearch');
    modelMatchType.insertInElement('modelMatchType');
    byType.insertInElement('typeSearch');
    byName.insertInElement('nameSearch');

    table.initHTML();

    table.selection.addListener(function (src, property, oldValue, newValue) {
      if ( ! newValue ) return;
      var obj = table.selection.get().obj.clone();
      var editView = DetailView.create({value: SimpleValue.create(obj)});
      editView.model = table.selection.get().obj.model_;
      edit.innerHTML = editView.toHTML();
      editView.initHTML();
    });
//    table.selection.set(table.objs[0]);

    layout();

    function updateQuery() {
      var predicate = AND(
        searchSubject.predicate,
        byType.predicate,
        byModel.predicate,
        byName.predicate).partialEval();

      console.log('query: ', predicate.toSQL());

      table.dao = dao.where(predicate);

      byType.filter  = AND(searchSubject.predicate, byModel.predicate, byName.predicate).partialEval();
      byModel.filter = AND(searchSubject.predicate, byType.predicate,  byName.predicate).partialEval();
      byName.filter  = AND(searchSubject.predicate, byModel.predicate, byType.predicate).partialEval();
    }

    Events.dynamic(function() {
      searchSubject.predicate;
      byType.predicate;
      byModel.predicate;
      byName.predicate;
    },
    updateQuery);

    modelMatchType.data$.addListener(function() { byModel.updateChoice(byModel.view.value); updateQuery(); });

    function resetSearch() {
      byType.view.value.set(''); byModel.view.value.set(''); byName.view.value.set('');
      byType.filter = byModel.filter = byName.filter = TRUE;
      table.dao = dao;
    }

    var stack = StackView.create();
    stack.write(document);
