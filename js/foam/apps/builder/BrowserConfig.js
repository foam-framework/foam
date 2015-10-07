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
    'foam.apps.builder.MenuItemCitationView',
    'foam.apps.builder.MenuView',
    'foam.apps.builder.SettingsView',
    'foam.apps.builder.ViewMenuItem',
    'foam.ui.DAOListView',
    'foam.ui.md.PopupView',
  ],
  imports: [
    'document',
    'identityManager$',
    'menuDAO$',
    'menuSelection$',
  ],

  constants: {
    MENU_CLOSE: [ 'menu-close' ],
  },

  properties: [
    {
      model_: 'FunctionProperty',
      name: 'selectionListFactory',
      defaultValue: function() {
        var view = this.DAOListView.create({
          data: this.menuDAO,
          rowView: this.MenuItemCitationView,
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
      name: 'accountListFactory',
      defaultValue: function() {
        var view = this.DAOListView.create({
          data: this.identityManager.getIdentities(),
          rowView: this.MenuItemCitationView,
          mode: 'read-only',
        }, this.Y.sub({
          selection$: this.accountSelection$,
        }));
        view.subscribe(view.ROW_CLICK, this.publish.bind(this, this.MENU_CLOSE));
        return view;
      },
    },
    {
      model_: 'FunctionProperty',
      name: 'viewListFactory',
      defaultValue: function() {
        var view = this.DAOListView.create({
          data: [
            this.ViewMenuItem.create({
              label: 'Settings',
              viewFactory: {
                factory_: 'foam.ui.md.PopupView',
                cardClass: 'md-card-shell',
                delegate: 'foam.apps.builder.SettingsView',
              },
            }, this.Y),
          ].dao,
          rowView: this.MenuItemCitationView,
          mode: 'read-only',
        }, this.Y.sub({
          selection$: this.viewSelection$,
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
          data: this,
          selectionList: this.selectionListFactory.bind(this),
          accountList: this.accountListFactory.bind(this),
          viewList: this.viewListFactory.bind(this),
        }, this.Y);
      },
    },
    {
      type: 'foam.apps.builder.BrowserConfig',
      name: 'menuSelection',
    },
    {
      type: 'foam.apps.builder.Identity',
      name: 'accountSelection',
      defaultValueFn: function() {
        return this.identityManager.getIdentity();
      },
    },
    {
      type: 'foam.apps.builder.ViewMenuItem',
      name: 'viewSelection',
      postSet: function(_, nu) {
        if ( nu ) nu.viewFactory({ data: this }).open();
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

  actions: [
    {
      name: 'addAccount',
      label: '+',
      code: function() {
        this.identityManager.createIdentity(nop);
        this.publish(this.data.MENU_CLOSE);
      },
    },
  ],
});
