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
  package: 'foam.apps.builder',
  name: 'BrowserConfig',
  extendsModel: 'foam.browser.BrowserConfig',

  requires: [
    'foam.apps.builder.BrowserConfigCitationView',
    'foam.apps.builder.MenuView',
    'foam.ui.DAOListView',
  ],
  imports: [
    'menuSelection$',
    'menuDAO$',
  ],

  constants: {
    MENU_CLOSE: ['menu-close']
  },

  properties: [
    {
      model_: 'FunctionProperty',
      name: 'menuListFactory',
      defaultValue: function() {
        var view = this.DAOListView.create({
          data: this.menuDAO,
          rowView: this.BrowserConfigCitationView,
          mode: 'read-only',
        }, this.Y.sub({
          selection$: this.menuSelection$,
        }));
        view.subscribe(view.ROW_CLICK, this.publish.bind(this, this.MENU_CLOSE));
        return view;
      },
    },
    {
      model_: 'FunctionProperty',
      name: 'menuFactory',
      defaultValue: function() {
        return this.MenuView.create({
          list: this.menuListFactory.bind(this),
        }, this.Y);
      },
    },
    {
      model_: 'StringProperty',
      name: 'name',
      lazyFactory: function() {
        return this.model ? this.model.name : 'BrowserConfig';
      },
    },
    {
      model_: 'StringProperty',
      name: 'label',
      lazyFactory: function() {
        return this.model ? this.model.label : 'Browser Config';
      },
    },
    {
      model_: 'StringProperty',
      name: 'iconUrl',
      view: 'foam.ui.ImageView',
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'detailView',
      defaultValue: {
        factory_: 'foam.ui.md.UpdateDetailView',
        showModelActions: false,
      },
    },
  ],
});
