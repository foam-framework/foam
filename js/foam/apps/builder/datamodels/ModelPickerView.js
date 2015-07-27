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
  package: 'foam.apps.builder.datamodels',
  name: 'ModelPickerView',
  extendsModel: 'foam.ui.DetailView',

  requires: [
    'foam.browser.ui.BrowserView',
    'foam.browser.BrowserConfig',
    'foam.meta.types.ModelEditView',
    'foam.dao.IDBDAO',
    'Model',
    'foam.apps.builder.datamodels.ModelCitationView',
  ],

  exports: [
    'selection$'
  ],

  properties: [
    {
      model_: 'ModelProperty',
      name: 'baseModel',
      help: 'The list is filtered to only include models that extend baseModel.'
    },
    {
      name: 'browserConfig',
      lazyFactory: function() {
        return this.BrowserConfig.create({
          model: this.baseModel,
          dao: this.IDBDAO.create({
            model: this.Model,
            name: 'DataModels',
            useSimpleSerialization: false,
          }),
          innerDetailView: 'foam.meta.types.ModelEditView',
          listView: {
            factory_: 'foam.ui.DAOListView',
            rowView: 'foam.apps.builder.datamodels.ModelCitationView',
          },
          showBack: true,
          editOnSelect: false,
          menuFactory: null,
        });
      }
    },
    {
      name: 'action',
      defaultValueFn: function() {
        return this.PICK;
      }
    }
  ],

  actions: [
    {
      name: 'pick',
      label: 'Pick Model',
      width: 100,
      action: function() {
        var ibv = this.BrowserView.InnerBrowserView.create({
          //selection$: this.data$,
          data: this.browserConfig,
        }, this.Y);
        ibv.selection$.addListener(this.selectionChange);

        this.X.stack.pushView(ibv);
      }
    }
  ],

  listeners: [
    {
      name: 'selectionChange',
      code: function(obj, topic, old, nu) {
        if (nu) {
          this.data = nu;
        }
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        $$baseModel{ mode:'read-only' } $$pick
      </div>
    */},
    function CSS() {/*
    */},
  ],

});
