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
  extends: 'foam.browser.BrowserConfig',

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
      type: 'Function',
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
      type: 'Function',
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
      type: 'Function',
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
      type: 'Function',
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
      name: 'menuSelection',
    },
    {
      name: 'accountSelection',
      defaultValueFn: function() {
        return this.identityManager.getIdentity();
      },
    },
    {
      name: 'viewSelection',
      postSet: function(_, nu) {
        if ( nu ) nu.viewFactory({ data: this }).open();
      },
    },
    {
      type: 'String',
      name: 'name',
      lazyFactory: function() {
        return this.model ? this.model.name : 'BrowserConfig';
      },
    },
    {
      type: 'String',
      name: 'label',
      lazyFactory: function() {
        return this.model ? this.model.label : 'Browser Config';
      },
    },
    {
      type: 'String',
      name: 'iconUrl',
      view: 'foam.ui.ImageView',
    },
    {
      type: 'ViewFactory',
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
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAZlBMVEVChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfRChfQ98RT7AAAAIXRSTlMAKrT19LIo8fCx86/uJjB+uuT747l9Lz3Ixzta/fxY5+ZVMLMtAAAAb0lEQVR42r3Mxw6AIBBFUUVExd57mf//SRESEJXEFXczyTvJOLZzkYd98rEHwArfgoAXqQWAH08AfQE2gS8gliuPGQmvm6RPYBJRGotdvVL9hywvyqqqm7bTsB9ANk5qnxe4tW4SdtA6JMAjM9joBOOjEwuWikL8AAAAAElFTkSuQmCC',
      ligature: 'person_add',
      code: function() {
        this.identityManager.createIdentity(nop);

        // TODO(markdittmer): We should probably use an "Authenticating..."
        // overlay at least until we are sure that views will not get confused
        // while waiting for a new account. We might want one anyway to remind
        // the user to switch out of any account already logged in.

        this.publish(this.MENU_CLOSE);
      },
    },
  ],
});
