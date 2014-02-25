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

var DragAndDropGrid = FOAM({
  model_: 'Model',
  extendsModel: 'GridByExpr',

  properties: [
    {
      name: 'dao'
    }
  ],

  methods: {
    renderCell: function(x, y, value) {
      var cell = IssueDropCell.create({
        value: value,
        dao: this.dao,
        props: [this.xFunc, this.yFunc],
        values: [x, y]
      });
      this.children.push(cell);
      return cell.toHTML();
    },
    clone: function() {
      var clone = this.SUPER();
      clone.dao = this.dao;
      return clone;
    }
  }
});

var IssueDropCell = FOAM({
  model_: 'Model',

  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'value'
    },
    {
      name: 'dao',
      hidden: true
    },
    {
      model_: 'ArrayProperty',
      name: 'props'
    },
    {
      model_: 'ArrayProperty',
      name: 'values'
    }
  ],

  methods: {
    toHTML: function() {
      this.on('dragenter', this.onDragEnter, this.getID());
      this.on('dragover', this.onDragEnter, this.getID());
      this.on('drop', this.onDrop, this.getID());
      return '<td id="' + this.getID() + '">' +
        (this.value ? (this.value.toHTML ? this.value.toHTML() : this.value) : '') + '</td>';
    },
    initHTML: function() {
      this.SUPER();
      this.value && this.value.initHTML && this.value.initHTML();
    },
    put: function(obj) {
      this.value.put(obj);
    }
  },

  listeners: [
    {
      name: 'onDragEnter',
      code: function(e) {
        for ( var i = 0; i < e.dataTransfer.types.length; i++ ) {
          if ( e.dataTransfer.types[i] === 'application/x-foam-id' ) {
            e.dataTransfer.dropEffect = "move";
            e.preventDefault();
            return;
          }
        }
      }
    },
    {
      name: 'onDrop',
      code: function(e) {
        var data = e.dataTransfer.getData('application/x-foam-id');
        if ( ! data ) return;

        e.preventDefault();

        var props = this.props;
        var values = this.values;
        var dao = this.dao;
        dao.find(data, {
          put: function(obj) {
            obj = obj.clone();
            for ( var i = 0; i < props.length; i++ ) {
              var p = props[i];
              var v = values[i];
              obj[p.name] = v;
            }
            dao.put(obj);
          }
        });
      }
    }
  ]
});

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
        this.browser.location.mode = Location.MODE.fromMemento.call(this.browser, 'list');
        this.browser.location.q = q.toMQL();
      }.bind(this);
      $(this.eid).addEventListener('click', f, false);
    }
  }
});


// Formats Issue ID's as links to the main crbug.com site.
var IdFormatter = function(browser) {
  return {
    f: function(i) {
      var url = browser.url + '/issues/detail?id=' + i.id;
      return '<a target="_blank" href="' + url + '">' + i.id + '</a>';
    }
  };
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

var QIssueTableView = FOAM({
  model_: 'Model',

  name: 'QIssueTableView',

  extendsModel: 'TableView2',

  properties: [
    { name: 'browser' }
  ],

  methods: {
    /*
    initHTML: function() {
      this.SUPER();

      this.selection.addListener(function(_,_,_,obj) {
        if ( obj.id && obj.id !== this.browser.previewID ) this.browser.preview(null);
      });
    },
    */
    toHTML: function() {
      return '<div class="QIssueTableHeader"></div>' + this.SUPER();
    }
  }
});


function createView(rowSelection, browser) {
  var location = browser.location;

  return AlternateView.create({
    dao: browser.filteredIssueDAO,
    headerView: browser.countField,
    views: [
      ViewChoice.create({
        label: 'List',
        view: function() {
          var tableView = QIssueTableView.create({
            model: QIssue,
            dao: browser.filteredIssueDAO,
            browser: browser,
            hardSelection: rowSelection,
            scrollEnabled: true,
            editColumnsEnabled: true
          });

          tableView.sortOrder$  = location.sort$;
          tableView.properties$ = location.colspec$;

          tableView.window = browser.window;

          return tableView;
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
                  preSet: function(dao) { return dao.limit(2000); },
                  postSet: function(old, dao) {
                     if ( this.listener ) {
                        old && old.unlisten(this.listener);
                        dao.listen(this.listener);
                     }
                     this.grid.dao = dao;
                     this.updateHTML();
                  },
                },
              ],
              methods: {
                 init: function(args) {
                    this.SUPER(args);
                    this.listener = {
                       put: this.daoUpdate,
                       remove: this.daoUpdate
                    };
                 }
              },
              listeners: [
                 {
                    name: 'daoUpdate',
                    isMerged: 1000,
                    code: function() {
                       this.updateHTML();
                    }
                 }
              ]}).create({
                model: QIssue,
                accChoices: [
                  [ MAP(QIssueTileView.create({browser: browser}), COL.create()), "Tiles" ],
                  [ MAP(IdFormatter(browser), COL.create()),             "IDs" ],
                  [ ItemCount.create({browser: browser}),       "Counts" ],
                  [ PIE(QIssue.STATUS),                         "Pie(Status)"  ],
                  [ PIE(QIssue.PRIORITY, priColorMap),          "Pie(Priority)" ]
                  //                 [ PIE(QIssue.STATE, {colorMap: {open:'red',closed:'green'}}), "PIE(State)" ]
                ],
              grid: /*GridByExpr*/DragAndDropGrid.create({})
           });

          g.row.value = location.y$;
          g.col.value = location.x$;

          // TODO: cleanup this block
          function setAcc() {
            var acc = g.accChoices[0];
            for ( var i = 1 ; i < g.accChoices.length ; i++ ) {
              if ( location.cells === g.accChoices[i][1].toLowerCase() ) acc = g.accChoices[i];
            }
            g.acc.choice = acc;
          }
          setAcc(location.cells);

          g.acc.value.addListener(function(choice) { location.cells = g.acc.choice[1].toLowerCase(); });
          location.cells$.addListener(setAcc);

          return g;
        }
      })
    ]
  });
}
