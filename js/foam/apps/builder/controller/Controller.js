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
    'foam.input.touch.GestureManager',
    'foam.input.touch.TouchManager',
    'foam.ui.DAOListView',
    'foam.ui.md.PopupView',
  ],
  imports: [
    // TODO(markdittmer): Just for testing purposes.
    'setTimeout',
  ],
  exports: [
    'stack',
    'touchManager',
    'gestureManager',
  ],

  properties: [
    {
      subType: 'foam.input.touch.TouchManager',
      name: 'touchManager',
      factory: function() { return this.TouchManager.create(); },
    },
    {
      subType: 'foam.input.touch.GestureManager',
      name: 'gestureManager',
      factory: function() { return this.GestureManager.create(); },
    },
    {
      type: 'ViewFactory',
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
      type: 'ViewFactory',
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
      var stack = this.stack;
      stack = stack.pushView(this.nav.bind(this), {
        transition: 'slideFromLeft',
      });

      this.setTimeout(function() {
        stack = stack.pushView(this.nav.bind(this), {
          transition: 'slideFromRight',
          overlay: 'right',
        });
      }.bind(this), 2000);
    },
  ],
});
