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

// Accumulator which formats objects in a column.  Used within GridView
var COL = {
  create: function() { return { __proto__: this, values: [] }; },
  put: function(v) { this.values.push(v); },
  toHTML: function() { return this.values.join('<br/>'); },
  initHTML: function() {
    for ( var i in this.values ) {
      var o = this.values[i];
      o.initHTML && o.initHTML();
    }
  },
  clone: function() { return this.create(); }
};


/*
 * An extension to COUNT() which turns count into a link which performs
 * a query for only the selected data when clicked.
 */
var ItemCount = Model.create({
  extendsModel: 'CountExpr',

  properties: [
    {
      name: 'browser'
    }
  ],

  methods: {
    put: function(obj) {
      if ( ! this.obj ) {
        this.obj = obj;
        this.eid = AbstractView.getPrototype().nextID();
      }
      this.SUPER(obj);
    },
    toHTML: function() {
      return '<span id="' + this.eid + '" class="idcount">' + this.count + (this.count == 1 ? ' item' : ' items') + '</span>';
    },
    initHTML: function() {
      var f = function() {
        var searchField = this.browser.searchField;
        var altView = this.browser.view;
        var col = altView.views[1].view().col.value.get();
        var row = altView.views[1].view().row.value.get();
        var q = AND(
          QueryParser.parseString(searchField.value.get()),
          EQ(col, col.f(this.obj)),
          EQ(row, row.f(this.obj))).partialEval();
        this.browser.location.copyFrom({ mode: 'list', q: q.toMQL() });
      }.bind(this);
      $(this.eid).addEventListener('click', f, false);
    }
  }
});


// Formats Issue ID's as links to the main crbug.com site.
var idFormatter = {
  f: function(i) {
    return '<a href="https://code.google.com/p/chromium/issues/detail?id=' + i.id + '">' + i.id + '</a>';
  }
};


var priColorMap = {
  colorMap: {
     'Critical': 'hsl(  0, 100%, 70%)',
     'High':     'hsl(-340, 100%, 70%)',
     'Medium':   'hsl(-320, 100%, 70%)',
     'Low':      'hsl(-300, 100%, 70%)',
     '':         'lightgray'
  }
};


function createView(rowSelection, browser) {
  var location = browser.location;

  return AlternateView.create({
    dao: browser.IssueDAO,
    headerView: browser.countField,
    views: [
      ViewChoice.create({
        label: 'List',
        view: function() {
          var tableView = TableView.create({
            model: QIssue,
            hardSelection: rowSelection,
            editColumnsEnabled: true
          });

          tableView.sortOrder$  = location.sort$;
          tableView.properties$ = location.colspec$;

          return Model.create({
             extendsModel: 'ScrollBorder',
             methods: {
               init: function() {
                 this.SUPER();
                 this.view.browser = browser;
               },
               initHTML: function() {
                 this.SUPER();

                 this.view.selection.addListener(function(_,_,_,obj) {
                   if ( obj.id && obj.id !== browser.previewID ) browser.preview(null);
                 });
               },
               toHTML: function() {
                 return '<div class="QIssueTableHeader"></div>' + this.SUPER();
               }
             }
          }).create({view: tableView});
        }
      }),
      ViewChoice.create({
        label: 'Grid',
        view: function() {
           var g = Model.create({
              name: 'QIssueGridView',
              extendsModel: 'GridView',
              properties: [
                {
                   name: 'dao',
                   // crbug limits grid view to 6000 rows, so do the same
                   preSet: function(dao) { return dao.limit(6000); }
                }
              ]}).create({
                model: QIssue,
                accChoices: [
                  [ MAP(QIssueTileView.create({browser: browser}), COL.create()), "Tiles" ],
                  [ MAP(idFormatter, COL.create()),             "IDs" ],
                  [ ItemCount.create({browser: browser}),       "Counts" ],
                  [ PIE(QIssue.STATUS),                         "Pie(Status)"  ],
                  [ PIE(QIssue.PRIORITY, priColorMap),          "Pie(Priority)" ]
                  //                 [ PIE(QIssue.STATE, {colorMap: {open:'red',closed:'green'}}), "PIE(State)" ]
                ],
              grid: GridByExpr.create()
           });

          g.row.value = location.y$;
          g.col.value = location.x$;

          // TODO: cleanup this block
          function setAcc(title) {
            var acc = g.accChoices[0];
            for ( var i = 1 ; i < g.accChoices.length ; i++ ) {
              if ( location.tile === g.accChoices[i][1].toLowerCase() ) acc = g.accChoices[i];
            }
            g.acc.choice = acc;
          }
          setAcc(location.title);

          g.acc.value.addListener(function(choice) { location.tile = g.acc.choice[1].toLowerCase(); });
          location.tile$.addListener(setAcc);

          return g;
        }
      })
    ]
  });
}
