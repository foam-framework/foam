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
          var col = altView.views[1].view().col.value.get();
          var row = altView.views[1].view().row.value.get();
          var q = AND(
             CIssueQueryParser.parseString(searchField.value.get()),
             EQ(col, col.f(this.obj)),
             EQ(row, row.f(this.obj))).partialEval();
          searchField.value.set(q.toMQL());
          // Switch to TableView
          altView.view = altView.views[0];
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
     'Critical': 'red',
     'High':     'orange',
     'Medium':   'yellow',
     'Low':      'lightyellow',
     '':         'lightgray'
  }
};


function createView(rowSelection) {
  return AlternateView.create({
    dao: IssueDAO,
    views: [
      ViewChoice.create({
        label: 'List',
        view: function() {
          return Model.create({
             extendsModel: 'ScrollBorder',
             methods: {
               toHTML: function() {
                 return '<div class="CIssueTableHeader"></div>' + this.SUPER();
               }
             }
          }).create({view: TableView.create({model: CIssue, hardSelection: rowSelection})});
        }
      }),
      ViewChoice.create({
        label: 'Grid',
        view: function() {
           var g = Model.create({
              name: 'CIssueGridView',
              extendsModel: 'GridView',
              properties: [
                {
                   name:  'dao',
                   // crbug limits grid view to 6000 rows, so do the same
                   preSet: function(dao) { return dao.limit(6000); }
                }
              ]}).create({
                model: CIssue,
                accChoices: [
                   [ MAP(CIssueTileView.create(), COL.create()), "Tiles"  ],
                   [ MAP(idFormatter, COL.create()),             "IDs"    ],
                   [ ItemCount.create(),                         "Counts" ],
                   [ PIE(CIssue.STATUS),                         "PIE(Status)" ],
                   [ PIE(CIssue.PRIORITY, priColorMap),          "PIE(Priority)" ]
//                 [ PIE(CIssue.STATE, {colorMap: {open:'red',closed:'green'}}), "PIE(State)" ]
                ],
              grid: GridByExpr.create()
           });

           // Pre-set default values.  TODO: persist settings
           g.row.value.set(CIssue.OWNER);
           g.col.value.set(CIssue.STATUS);
           g.acc.value.set(g.accChoices[0][0]);

           return g;
        }
      })
    ]
  });
}