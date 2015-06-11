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
  extendsModel: 'foam.ui.SimpleView',

  requires: [
    'foam.ui.TableView',
    'foam.ui.md.EditColumnsView'
  ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'title',
      defaultValue: 'Table'
    },
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( this.X.model || old === nu ) return;
        if ( nu && nu.model ) this.model = nu.model;
      }
    },
    {
      model_: 'StringArrayProperty',
      name:  'properties'
    },
    {
      name:  'model',
      lazyFactory: function() {
        return this.X.model ||
            (this.data && this.data.model);
      }
    },
    {
      name: 'table',
      lazyFactory: function() {
        return this.TableView.create({
          scrollEnabled: true,
          className: 'mdTable',
          ascIcon: '<i class="material-icons">keyboard_arrow_up</i>',
          descIcon: '<i class="material-icons">keyboard_arrow_down</i>',
          model$: this.model$,
          data$: this.data$,
          properties$: this.properties$
        });
      }
    },
    {
      name: 'editColumns',
      lazyFactory: function() {
        return this.EditColumnsView.create({
          model$: this.model$,
          properties$: this.properties$
        });
      }
    }
  ],

  methods: [
    function getModel() {
      return this.X.model ||
          (this.data && this.data.model);
    }
  ],

  listeners: [
    {
      name: 'onEditColumns',
      code: function(e) {
        if ( this.editColumns.isOpen ) return;
        console.log('onEditColumns');
        this.editColumns.x = e.clientX;
        this.editColumns.y = e.clientY;
        this.editColumns.open();
        // if ( this.editColumns.isOpen ) return;
        // this.editColumns.open();
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <md-table id="%%id">
        <table-header>
          <table-caption>%%title</table-caption>
          <table-actions>
            <span><i class="material-icons"
                     id="<%= this.on('click', this.onEditColumns) %>">filter_list</i></span>
          </table-actions>
          %%editColumns
        </table-header>
        %%table
      </md-table>
    */},
    { name: 'CSS' }
  ]
});
