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
  package: 'foam.apps.builder.controller',
  name: 'Controller',

  requires: [
    'foam.apps.builder.AppConfig',
    'foam.apps.builder.AppConfigCitationView',
    'foam.apps.builder.controller.PermanentNav',
    'foam.apps.builder.controller.StackView',
    'foam.ui.DAOListView',
    'foam.ui.md.PopupView',
  ],
  exports: [
    'stack',
  ],

  properties: [
    {
      model_: 'ViewFactoryProperty',
      name: 'menuView',
      defaultValue: 'foam.ui.md.PopupView',
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'appDAO',
      lazyFactory: function() {
        return [
          this.AppConfig.create({ appName: 'Foo App' }),
          this.AppConfig.create({ appName: 'Bar App' }),
        ];
      },
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'nav',
      defaultValue: function() {
        return this.PermanentNav.create({
          title: 'App Builder',
          dao$: this.appDAO$,
          listView: {
            factory_: 'foam.ui.DAOListView',
            rowView: 'foam.apps.builder.AppConfigCitationView',
          },
        });
      },
    },
    {
      name: 'stack',
      factory: function() {
        return this.StackView.create();
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.stack.pushView(this.nav(), {
        transition: 'slideFromLeft',
      });
    },
  ],
});
