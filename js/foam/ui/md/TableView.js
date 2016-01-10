/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.ui.md',
  name: 'TableView',
  extends: 'foam.ui.SimpleView',

  requires: [
    'foam.ui.TableView',
    'foam.ui.md.EditColumns',
    'foam.ui.md.EditColumnsView',
    'foam.ui.md.FlatButton',
    'foam.ui.md.OverlayDropdownView'
  ],
  imports: [ 'hardSelection$' ],

  properties: [
    {
      type: 'Boolean',
      name: 'editColumnsEnabled',
      defaultValue: false
    },
    {
      type: 'String',
      name: 'title',
      defaultValue: 'Table',
      postSet: function(old, nu) {
        // Default title not shown when data is selected.
        if ( this.hardSelection || ! this.$ ||  old === nu ) return;
        this.updateTableCaption();
      }
    },
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( this.X.model || old === nu ) return;
        if ( nu && nu.model ) {
          this.model = nu.model;
          if ( this.properties.length === 0 )
            this.properties = this.getDefaultProperties();
        }
      }
    },
    {
      type: 'StringArray',
      name:  'properties',
      lazyFactory: function() { return this.getDefaultProperties(); }
    },
    {
      name:  'model',
      lazyFactory: function() {
        return this.X.model ||
            (this.data && this.data.model);
      }
    },
    {
      name: 'hardSelection',
      defaultValue: null,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( nu ) {
          this.actions = this.gatherActions(this.hardSelection.model_).concat(
              this.gatherActions(this.model_));
        } else {
          this.actions = this.gatherActions(this.model_);
        }

        if ( ! this.$ ) return;
        this.updateTableCaption();
        this.updateTableActions();
        this.initInnerHTML();
      }
    },
    {
      type: 'Array',
      subType: 'Action',
      name: 'actions',
      lazyFactory: function() {
        return this.hardSelection ? this.gatherActions(this.hardSelection.model_) :
            this.gatherActions(this.model_);
      }
    },
    {
      type: 'Boolean',
      name: 'scrollEnabled',
      defaultValue: false
    },
    {
      name: 'table',
      lazyFactory: function() {
        return this.TableView.create({
          scrollEnabled: this.scrollEnabled,
          className: 'mdTable',
          ascIcon: '<i class="material-icons-extended">keyboard_arrow_up</i>',
          descIcon: '<i class="material-icons-extended">keyboard_arrow_down</i>',
          model$: this.model$,
          data$: this.data$,
          properties$: this.properties$,
          useInnerContainer: true
        });
      }
    },
    {
      name: 'columnSelectionView',
      lazyFactory: function() {
        return this.OverlayDropdownView.create({
          delegate: function() {
            return this.EditColumnsView.create({
              data: this.EditColumns.create({
                model$: this.model$,
                properties$: this.properties$
              }, this.Y)
            });
          }.bind(this)
        });
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.Y.registerModel(this.FlatButton.xbind({
        displayMode: 'ICON_ONLY',
        height: 24,
        width: 24,
        color: 'rgba(0, 0, 0, 0.54)',
        halo: ''
      }), 'foam.ui.ActionButton');
    },
    function getModel() {
      return this.X.model ||
          (this.data && this.data.model);
    },
    function getDefaultProperties() {
      return this.model ? this.model.getRuntimeProperties().filter(
          function(prop) { return !prop.hidden; }).map(
          function(prop) { return prop.name; }) : [];
    },
    function updateTableCaption() {
      var out = TemplateOutput.create(this);
      this.tableCaptionHTML(out);
      this.$.querySelector('table-caption').innerHTML = out.toString();
    },
    function updateTableActions() {
      var children = this.children.slice();
      for ( var i = 0; i < children.length; ++i ) {
        var child = children[i];
        if ( Action.isInstance(child.action) ) {
          this.removeChild(child);
        }
      }

      var out = TemplateOutput.create(this);
      this.tableActionsHTML(out);
      this.$.querySelector('table-actions').innerHTML = out.toString();
    },
    function createActionView(action, args) {
      var view = this.SUPER(action, args);
      view.data = (this.hardSelection && ! this.isViewAction(action)) ? this.hardSelection : this;
      return view;
    },
    function isViewAction(action) {
      return this.gatherActions(this.model_).some(function(a) { return a === action; });
    },
    function gatherActions(model) {
      if ( ! model ) return [];
      // TODO(markdittmer): Should we be defining a getter for "actions_" so
      // that we don't need to check "instance_"?
      return model.actions_ || (model.instance_ && model.instance_.actions_) ||
          model.actions;
    }
  ],

  actions: [
    {
      name: 'clearSelection',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAGUlEQVR4AWOgBxgF/3FDkjUMe/ePun8UAAAVElOtyzJqcQAAAABJRU5ErkJggg==',
      ligature: 'clear_all',
      isAvailable: function() {
        return !!this.hardSelection;
      },
      code: function(X, action, e) {
        this.hardSelection = null;
      }
    },
    {
      name: 'editColumns',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAM0lEQVR4AWMYtiCI4TXDKwZ/otUDlf8HwpfEa3gF1vCCeA3+DC+Byn2p5sXRUBoNpWEKAEP5JZC/ixCxAAAAAElFTkSuQmCC',
      ligature: 'more_vert',
      isAvailable: function() { return this.editColumnsEnabled; },
      code: function(X, action) {
        if ( this.columnSelectionView.state === 'OPEN' ) return;
        this.columnSelectionView.open();
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <md-table id="%%id">
        <table-header id="<%= this.setClass('selection', function() { return !!this.hardSelection; }) %>">
          <table-caption>
            <% this.tableCaptionHTML(out) %>
          </table-caption>
          <table-actions><% this.tableActionsHTML(out) %></table-actions>
          <% if (this.editColumnsEnabled) { %>
            %%columnSelectionView
          <% } %>
        </table-header>
        %%table
      </md-table>
    */},
    function tableCaptionHTML() {/*
      <% if ( this.title && ! this.hardSelection ) { %>
        %%title
      <% } else if ( this.hardSelection ) { %>
        1 item selected
      <% } %>
    */},
    function tableActionsHTML() {/*<%
        for ( var i = 0; i < this.actions.length; ++i ) {
          var action = this.actions[i];
          var view = this.createActionView(action);
          this.addChild(view);
          out(view);
        }
      %>*/},
    { name: 'CSS' }
  ]
});
