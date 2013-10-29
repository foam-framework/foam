/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
var IssueMDAO  = MDAO.create({model: CIssue})
  .addIndex(CIssue.ID)
  .addIndex(CIssue.PRIORITY)
  .addIndex(CIssue.MILESTONE)
  .addIndex(CIssue.ITERATION)
  .addIndex(CIssue.RELEASE_BLOCK)
  .addIndex(CIssue.CATEGORY)
  .addIndex(CIssue.STATUS)
  .addIndex(CIssue.OWNER)
  .addIndex(CIssue.SUMMARY)
  .addIndex(CIssue.OS)
  .addIndex(CIssue.UPDATED);

var IssueIDBDAO = IDBDAO.create({model: CIssue});
var IssueDAO   = CachingDAO.create(IssueMDAO, IssueIDBDAO);

var COL = {
  create: function() { return { __proto__: this, values: [] }; },
  put: function(v) { this.values.push(v); },
  toHTML: function() { return this.values.join('<br/>'); },
  clone: function() { return this.create(); }
};

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

var idFormatter = {
  f: function(i) { return '<a href="https://code.google.com/p/chromium/issues/detail?id=' + i.id + '">' + i.id + '</a>'; }
};

// Listen for table selection and go to crbug page
var rowSelection = new SimpleValue();
rowSelection.addListener(function(_,_,_,issue) {
   document.location = 'https://code.google.com/p/chromium/issues/detail?id=' + issue.id;
});

var priColorMap = {
  colorMap: {
     '0': 'red',
     '1': 'orange',
     '2': 'yellow',
     '3': 'lightyellow',
     '': 'lightgray',
     'NaN': 'lightgray'
  }
};

var altView = AlternateView.create({
  dao: IssueDAO,
  views: [
    ViewChoice.create({
      label: 'List',
      view: function() {
         return /*ScrollBorder.create({view:*/ Model.create({
           extendsModel: 'TableView',
           methods: {
              toHTML: function() {
                 return '<div class="CIssueTableHeader"></div>' + this.SUPER();
              }
           }
           }).create({ model: CIssue, hardSelection: rowSelection})/*})*/;
      }
    }),
    ViewChoice.create({
      label: 'Grid',
      view: function() {
         var g = Model.create({
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

// From: google3/codesite/dit/constants.py
var searchChoice = ChoiceView.create({
  helpText: 'Search within:',
  choices:[
    ["",                            "&nbsp;All issues"],
    ["-status=Closed",              "&nbsp;Open issues"],
    ["owner=me -status=Closed",     "&nbsp;Open and owned by me"],
    ["-status=Closed reporter=me",  "&nbsp;Open and reported by me"],
    ["-status=Closed is:starred",   "&nbsp;Open and starred by me"],
    ["-status=Closed commentby:me", "&nbsp;Open and comment by me"],
    ["status=New",                  "&nbsp;New issues"],
    ["status=Fixed,Done",           "&nbsp;Issues to verify"]
  ]
});

// Set initial value to 'Open issues'
searchChoice.value.set(searchChoice.choices[1][0]);

var searchField = TextFieldView.create({
  name: 'search',
  displayWidth: 90
});

/** Filter data with the supplied predicate, or select all data if null. **/
function search(p) {
  if ( p ) console.log('SEARCH: ', p.toSQL());
  altView.dao = p ? IssueDAO.where(p) : IssueDAO;
}

function performQuery() {
  search(AND(
      CIssueQueryParser.parseString(searchChoice.value.get()) || TRUE,
      CIssueQueryParser.parseString(searchField.value.get()) || TRUE
    ).partialEval());
}

searchChoice.value.addListener(performQuery);
searchField.value.addListener(performQuery);

searchChoice.insertInElement('searchChoice');
searchField.insertInElement('searchField');

altView.write(document);

/*
var IssueDAO = RestDAO.create({
  url:'https://www-googleapis-staging.sandbox.google.com/projecthosting/v2/projects/chromium/issues',
  model: CIssue
});

IssueDAO = IssueDAO.limit(10);
*/

var syncManager = SyncManager.create({
  srcDAO: IssueNetworkDAO,
  dstDAO: IssueDAO,
  lastModified: new Date(2013,01,01),
  modifiedProperty: CIssue.UPDATED
});

var syncView = ActionBorder.create(SyncManager, DetailView.create({model: SyncManager}));
document.writeln(syncView.toHTML());
syncView.set(syncManager);
syncView.initHTML();

var space = Canvas.create({width: 1300, height: 100, background:'#000'});
var graph = Graph.create({x:0, y:0, width:1300, height:100, axisColor:'white', data:[]});
space.addChild(graph);
space.write(document);
 syncManager.propertyValue('timesSynced').addListener(function() { graph.addData(syncManager.lastBatchSize); space.paint(); });
// syncManager.propertyValue('timesSynced').addListener(function() { graph.addData(syncManager.lastSyncDuration); space.paint(); });

var timer = Timer.create({});
var logo = $('logo');
syncManager.propertyValue('isSyncing').addListener(function() {
  if ( syncManager.isSyncing ) {
     timer.step();
     timer.start();
  } else {
     timer.stop();
     altView.view = altView.view;
  }
});

logo.onclick = syncManager.forceSync.bind(syncManager);

/*
timer.propertyValue('i').addListener(function() {
  logo.style.webkitTransform = 'rotate(' + -timer.i + 'deg)';
});
*/
Events.dynamic(function() {
  logo.style.webkitTransform = 'rotate(' + -timer.i + 'deg)';
});
