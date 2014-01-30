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
             QueryParser.parseString(searchField.value.get()),
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
     'Critical': 'hsl(  0, 100%, 70%)',
     'High':     'hsl(-340, 100%, 70%)',
     'Medium':   'hsl(-320, 100%, 70%)',
     'Low':      'hsl(-300, 100%, 70%)',
     '':         'lightgray'
  }
};


function createView(rowSelection, browser) {
  return AlternateView.create({
    dao: browser.IssueDAO,
    views: [
      ViewChoice.create({
        label: 'List',
        view: function() {
          return Model.create({
             extendsModel: 'ScrollBorder',
             methods: {
               init: function() {
                 this.SUPER();
                 this.view.browser = browser;
               },
               initHTML: function() {
                 this.SUPER();

                 this.view.$.addEventListener('mouseout', function(e) {
                   if ( e.fromElement === this.view.$ && e.toElement !== browser.currentPreview ) {
                     browser.preview(null);
                   }
                 }.bind(this));

                 this.view.selection.addListener(function(_,_,_,obj) {
                   if ( obj.id && obj.id !== browser.previewID ) browser.preview(null);
                 });
               },
               
               toHTML: function() {
                 return '<div class="QIssueTableHeader"></div>' + this.SUPER();
               }
             }
          }).create({view: TableView.create({
            model: QIssue,
            hardSelection: rowSelection,
            editColumnsEnabled: true
          })});
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
                   name:  'dao',
                   // crbug limits grid view to 6000 rows, so do the same
                   preSet: function(dao) { return dao.limit(6000); }
                }
              ]}).create({
                model: QIssue,
                accChoices: [
                  [ MAP(QIssueTileView.create({browser: browser}), COL.create()), "Tiles"  ],
                  [ MAP(idFormatter, COL.create()),             "IDs"    ],
                  [ ItemCount.create(),                         "Counts" ],
                  [ PIE(QIssue.STATUS),                         "PIE(Status)" ],
                  [ PIE(QIssue.PRIORITY, priColorMap),          "PIE(Priority)" ]
                  //                 [ PIE(QIssue.STATE, {colorMap: {open:'red',closed:'green'}}), "PIE(State)" ]
                ],
              grid: GridByExpr.create()
           });

           // Pre-set default values.  TODO: persist settings
           g.row.value.set(QIssue.OWNER);
           g.col.value.set(QIssue.STATUS);
           g.acc.choice = g.accChoices[0];

           return g;
        }
      })
    ]
  });
}