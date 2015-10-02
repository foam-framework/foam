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
  package: 'foam.browser',
  name: 'BrowserConfig',
  documentation: 'Configuration object for FOAM\'s browser. ' +
      'Create an instance of this model and load it in a BrowserView.',

  requires: [
    'foam.dao.EasyDAO',
    'foam.dao.NullDAO',
    'foam.mlang.CannedQuery',
    'foam.ui.DAOListView',
    'foam.ui.md.CannedQueryCitationView',
    'foam.ui.md.CitationView',
  ],

  exports: [
    'dao'
  ],

  properties: [
    {
      name: 'title',
      defaultValueFn: function() {
        return this.model && this.model.name ? this.model.name + ' Browser' :
            'Browser';
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      documentation: 'The master DAO to browse. Will default to an MDAO if not provided.',
      lazyFactory: function() {
        return this.instance_.model && this.EasyDAO.create({
          model: this.model,
          daoType: 'MDAO',
          seqNo: true,
        });
      }
    },
    {
      model_: 'ModelProperty',
      name: 'model',
      required: true,
      factory: function() { return this.instance_.dao && this.dao.model; }
    },
    {
      name: 'filteredDAO',
      documentation: 'The filtered version of $$DOC{ref:".dao"} that\'s ' +
          'being viewed right now.',
      dynamicValue: function() {
        this.dao; this.query; this.sortOrder;
        var query = this.query || (this.showAllWithNoQuery ? TRUE : FALSE);
        var dao = this.dao.where(this.query);
        if (this.sortOrder) dao = dao.orderBy(this.sortOrder);
        return dao;
      },
      view: 'foam.ui.DAOListView',
    },
    {
      name: 'query',
      documentation: 'The authoritative mlang query. Formed from $$DOC{ref:".search"} ' +
          'AND $$DOC{ref:".cannedQuery"}. Dynamic value, should not need to ' +
          'be set directly.',
      dynamicValue: function() {
        // TODO(braden): Is AND the right semantics here? Maybe searches should
        // span the whole DAO without limiting by canned query.
        this.search; this.cannedQuery; this.searchWithinCannedQuery;
        var canned = this.cannedQuery.expression;
        if (this.search !== '') {
          var query = this.queryParser.parseString(this.search);
          return this.searchWithinCannedQuery ? AND(query, canned) : query;
        } else {
          return canned;
        }
      },
    },
    {
      name: 'queryParser',
      documentation: 'Parser for user-entered search strings. Should return ' +
          'an mlang suitable for searching $$DOC{ref:".dao"}. Defaults to KEYWORD.',
      defaultValue: { parseString: KEYWORD }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'cannedQueryDAO',
      documentation: 'A DAO of $$DOC{ref:"foam.mlang.CannedQuery"} objects.',
      factory: function() {
        return this.NullDAO.create();
      },
      postSet: function(old, nu) {
        if (nu && !this.query && !this.cannedQuery) {
          nu.limit(1).select([])(function(arr) { this.cannedQuery = arr[0]; }.bind(this));
        }
      },
      view: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'foam.ui.md.CannedQueryCitationView',
      },
    },
    {
      name: 'cannedQuery',
      documentation: 'Currently selected canned query. Combined into $$DOC{ref:".query"} ' +
          'by ANDing its expression with $$DOC{ref:".search"}.',
    },
    {
      name: 'sortChoices',
      factory: function() {
        return [];
      }
    },
    {
      name: 'sortOrder',
      factory: function() {
        return this.sortChoices && this.sortChoices.length && this.sortChoices[0][0];
      }
    },
    {
      model_: 'StringProperty',
      name: 'search',
      view: {
        factory_: 'foam.ui.md.TextFieldView',
        label: 'Search',
        floatingLabel: false,
        placeholder: 'Search',
        onKeyMode: true,
      },
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'listView',
      defaultValue: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'foam.ui.md.CitationView',
        minWidth: 350,
        preferredWidth: 500,
        maxWidth: 500,
      }
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'detailView',
      documentation: 'A ViewFactory for the main detail view. You usually ' +
          'will want to override $$DOC{ref:".innerDetailView"} rather than ' +
          'this property.',
      defaultValue: { factory_: 'foam.ui.md.UpdateDetailView', perferredWidth: 1000 },
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'innerDetailView',
      defaultValue: 'foam.ui.md.DetailView'
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'createView',
      documentation: 'The view for creating a new item. Defaults to creating ' +
          'a new empty instance of $$DOC{ref:".model"} and passing it to ' +
          '$$DOC{ref:".detailView"}.',
      defaultValue: function(args, X) {
        var newObj = this.model.create();
        return this.detailView({
          data: newObj,
          innerView: this.innerDetailView
        }, X);
      }
    },
    {
      model_: 'FunctionProperty',
      name: 'createFunction',
      documentation: 'Runs createView and adds the new view. "this" is the BrowserView, "this.data" is the BrowserConfig.',
      defaultValue: function() {
        this.stack.pushView(this.data.createView(null,
            this.Y.sub({ dao: this.data.dao })));
      },
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'menuRowView',
      defaultValue: 'foam.ui.md.CannedQueryCitationView'
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'menuHeaderView',
      documentation: 'Rendered at the top of the menu. Empty by default.',
    },
    {
      name: 'menuFactory',
      documentation: 'The menuFactory returns a View for the left-side menu. ' +
          'By default, it returns the view for $$DOC{ref:".cannedQueryDAO"}.',
      defaultValue: function() {
        var view = this.DAOListView.create({
          data: this.cannedQueryDAO.orderBy(
              this.CannedQuery.SECTION,
              this.CannedQuery.ORDER,
              this.CannedQuery.LABEL
          ),
          rowView: this.menuRowView
        }, this.Y.sub({
          selection$: this.cannedQuery$
        }));

        // Listen for the DAOListView's ROW_CLICK event, and emit our own
        // MENU_CLOSE event when it fires. This was originally a postSet on
        // cannedQuery, which is bound to the selection, but that only updates
        // when the value actually changes.
        view.subscribe(view.ROW_CLICK, function() {
          this.publish(this.MENU_CLOSE);
        }.bind(this));

        return view;
      }
    },
    {
      name: 'busyStatus',
      documentation: 'Optional busyStatus. If defined, a spinner will be ' +
          'shown when the BusyStatus is set to true.'
    },
    {
      name: 'headerColor',
      documentation: 'Globally sets a browser-header-color CSS class',
      defaultValue: '#3e50b4'
    },
    {
      name: 'showAllWithNoQuery',
      documentation: 'When there is no query set, should the browser ' +
          'render all the data, or none of it? Defaults to all, set false if ' +
          'you have a lot of data and don\'t want to render it all.',
      defaultValue: true,
    },
    {
      model_: 'BooleanProperty',
      name: 'showAdd',
      documentation: 'An action to create a new value in $$DOC{ref:".dao"} ' +
          'will be rendered when this is set to true (the default).',
      defaultValue: true,
    },
    {
      model_: 'BooleanProperty',
      name: 'searchWithinCannedQuery',
      documentation: 'By default, searches are against all of the DAO. To ' +
          'restrict searches to the currently selected canned query, set ' +
          'this to true.',
      defaultValue: false,
    },
  ],

  constants: {
    MENU_CLOSE: ['menu-close']
  },
});
