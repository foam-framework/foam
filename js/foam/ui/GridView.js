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
  package: 'foam.ui',
  name: 'GridView',

  extends: 'foam.ui.AbstractDAOView',

  requires: [
    'foam.ui.ChoiceView'
  ],

  properties: [
    {
      name: 'row',
      type: 'foam.ui.ChoiceView',
      factory: function() { return this.ChoiceView.create(); }
    },
    {
      name: 'col',
      label: 'column',
      type: 'foam.ui.ChoiceView',
      factory: function() { return this.ChoiceView.create(); }
    },
    {
      name: 'acc',
      label: 'accumulator',
      type: 'foam.ui.ChoiceView',
      factory: function() { return this.ChoiceView.create(); }
    },
    {
      name: 'accChoices',
      label: 'Accumulator Choices',
      type: 'Array',
      factory: function() { return []; }
    },
    {
      name: 'scrollMode',
      type: 'String',
      defaultValue: 'Bars',
      view: { factory_: 'foam.ui.ChoiceView', choices: [ 'Bars', 'Warp' ] }
    },
    {
      name: 'model',
      type: 'Model'
    },
    {
      name: 'grid',
      type: 'GridByExpr',
      factory: function() { return GridByExpr.create(undefined, this.Y); }
    }
  ],

  // TODO: need an 'onChange:' property to handle both value
  // changing and values in the value changing

  // TODO: listeners should be able to mark themselves as mergable
  // or updatable on 'animate', ie. specify decorators
  methods: {
    filteredDAO: function() { return this.dao; },

    updateHTML: function() {
      if ( this.initialized_ && ! this.$ ) throw EventService.UNSUBSCRIBE_EXCEPTION;
      if ( ! this.$ ) return;

      var self = this;
      this.grid.xFunc = this.col.data || this.grid.xFunc;
      this.grid.yFunc = this.row.data || this.grid.yFunc;
      this.grid.acc   = this.acc.data || this.grid.acc;

      this.filteredDAO().select(this.grid.clone())(function(g) {
        if ( self.scrollMode === 'Bars' ) {
          console.time('toHTML');
          var html = g.toHTML();
          console.timeEnd('toHTML');
          self.$.innerHTML = html;
          g.initHTML();
        } else {
          var cview = self.Y.GridCView.create({grid: g, x:5, y: 5, width: 1000, height: 800}, self.Y);
          self.$.innerHTML = cview.toHTML();
          cview.initHTML();
          cview.paint();
        }
      });
    },

    initHTML: function() {
      var choices = [
        [ { f: function() { return ''; } }, 'none' ]
      ];

      this.model.getRuntimeProperties().orderBy(Property.LABEL).select({put: function(p) {
        choices.push([p, p.label]);
      }});
      this.row.choices = choices;
      this.col.choices = choices;

      this.acc.choices = this.accChoices;

      this.row.initHTML();
      this.col.initHTML();
      this.acc.initHTML();

      this.SUPER();

      this.row.data$.addListener(this.onDAOUpdate);
      this.col.data$.addListener(this.onDAOUpdate);
      this.acc.data$.addListener(this.onDAOUpdate);
      this.scrollMode$.addListener(this.onDAOUpdate);

      this.initialized_ = true;
      this.updateHTML();
    }
  },

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() { this.updateHTML(); }
    }
  ],

  templates:[
    /*
    {
      model_: 'Template',

      name: 'toHTML2',
      description: 'TileView',
      template: '<div class="column expand">' +
        '<div class="gridViewControl">Rows: <%= this.row.toHTML() %> &nbsp;Cols: <%= this.col.toHTML() %> &nbsp;Cells: <%= this.acc.toHTML() %><br/></div>' +
        '<div id="<%= this.id%>" class="gridViewArea column" style="flex: 1 1 100%; -webkit-flex: 1 1 100%"></div>' +
        '</div>'
    },
    */
    {
      model_: 'Template',

      name: 'toHTML',
      description: 'TileView',
      template: '<div class="column expand">' +
        '<div class="gridViewControl">Rows: <%= this.row.toHTML() %> &nbsp;Cols: <%= this.col.toHTML() %> &nbsp;Cells: <%= this.acc.toHTML() %> &nbsp;Scroll: $$scrollMode <br/></div>' +
        '<div id="<%= this.id%>" class="gridViewArea column" style="flex: 1 1 100%; -webkit-flex: 1 1 100%"></div>' +
        '</div>'
    }
  ]
});
