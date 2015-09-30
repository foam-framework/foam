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
  name: 'AppConfig',

  label: 'Chrome Application Configuration',

  requires: [
    'foam.apps.builder.AppWindow',
  ],

  ids: [ 'appId' ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'appId',
      label: 'Unique App ID',
      mode: 'read-only',
      help: "The hidden unique id for the app that links DAO instances and models to the owner app.",
      lazyFactory: function() {
        return camelize(this.appName) + '-' + createGUID();
      }
    },
    {
      model_: 'StringProperty',
      name: 'appName',
      label: 'Application Name',
      help: multiline(function() {/*
        User-facing name of the application. This name appears in places such
        as the Chrome Web Store and the application window title bar.
      */}),
      issues: [
        'TODO(markdittmer): Binding to app window title not yet implemented'
      ],
      view: {
        factory_: 'foam.ui.md.TextFieldView',
        placeholder: 'My App',
        required: true
      },
      postSet: function() {
        // ensure appId is set from our new value in its lazyFactory
        this.appId;
      }
    },
    {
      model_: 'foam.apps.builder.datamodels.CustomModelProperty',
      name: 'model',
      help: 'The primary data model this app operates on.',
      defaultValue: null,
      adapt: function(old, nu) {
        if ( typeof nu === 'string' ) {
          if ( ! nu ) return old;
          var ret = this.X.lookup(nu);
          return ret;
        }
        if ( Model.isInstance(nu) ) return nu;
        return old;
      }
    },
    {
      name: 'dao',
      type: 'foam.apps.builder.dao.DAOFactory',
      help: 'The data source type and location.',
      defaultValue: null,
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'designerView',
      hidden: true,
      transient: true
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'appView',
      hidden: true,
      transient: true
    },
    {
      model_: 'StringProperty',
      name: 'version',
      label: 'Version',
      help: multiline(function() {/*
        This number usually needs to be incremented to re-publish/update the
        application.
      */}),
      view: {
        factory_: 'foam.ui.md.TextFieldView',
        placeholder: '0.1',
        required: true
      },
      defaultValue: '0.1'
    },
    {
      name: 'defaultView',
      help: 'The model id of the view to create to display this app.',
    },
    {
      model_: 'StringProperty',
      name: 'termsOfService',
      label: 'Terms of Service',
      help: multiline(function() {/*
        Terms of service the user must accept before using the application.
      */}),
      disabled: true,
      issues: [
        'TODO(markdittmer): Support file upload.',
      ],
      view: {
        factory_: 'foam.ui.md.TextFieldView',
        placeholder: 'TERMS OF SERVICE',
        displayHeight: 8
      }
    },
    {
      model_: 'IntProperty',
      name: 'rotation',
      label:  'Rotation (Chrome OS only)',
      help: 'Measured in degrees.',
      view: {
        factory_: 'foam.ui.md.PopupChoiceView',
        floatingLabel: true,
        choices: [
          [0, '0'],
          [90, '90'],
          [180, '180'],
          [270, '270']
        ]
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'kioskEnabled',
      label: 'Kiosk mode enabled',
      help: 'Allows the app to run as a kiosk app.',
      factory: function() {
        return true;
      },
      issues: [
        multiline(function() {/*
          TODO(markdittmer): Consider changing download button title based on
          this.
        */})
      ],
      postSet: function(oldValue, newValue) {
        // this.setKioskMode(newValue);
      }
    },
    {
      model_: 'IntProperty',
      name: 'sessionDataTimeoutTime',
      label: 'Session idle timeout',
      help: 'Time (in minutes) the app is idle before clearing browsing data.',
      rangeDescription: '1 - 1440 minutes',
      defaultDescription: '0 = unlimited',
      // view: 'RangeDefaultTextFieldView'
    },
    {
      model_: 'IntProperty',
      name: 'sessionTimeoutTime',
      label: 'Timeout to return home',
      help: multiline(function() {/*
        Time (in minutes) the app is idle before returning to the homepage.
        Browsing data is not cleared.
      */}),
      rangeDescription: '1 - 1440 minutes',
      defaultDescription: '0 = unlimited',
      // view: 'RangeDefaultTextFieldView'
    },
    {
      model_: 'BooleanProperty',
      name: 'virtualKeyboardEnabled',
      label: 'Virtual keyboard enabled',
      help: 'Enables the on-screen virtual keyboard.',
      defaultValue: true
    },
    {
      model_: 'StringProperty',
      name: 'chromeId',
      hidden: true,
    },
    {
      model_: 'IntProperty',
      name: 'defaultWindowWidth',
      label: 'Default app window width',
      defaultValue: 800,
    },
    {
      model_: 'IntProperty',
      name: 'defaultWindowHeight',
      label: 'Default app window height',
      defaultValue: 700,
    },
    {
      model_: 'IntProperty',
      name: 'minWindowWidth',
      label: 'Minimum app window width',
      defaultValue: 400,
    },
    {
      model_: 'IntProperty',
      name: 'minWindowHeight',
      label: 'Minimum app window height',
      defaultValue: 600,
    },
    {
      type: 'foam.apps.builder.AppWindow',
      name: 'appWindow',
      lazyFactory: function() {
        return this.AppWindow.create({
          id: this.model_.id,
          name$: this.appName$,
          width$: this.defaultWindowWidth$,
          height$: this.defaultWindowHeight$,
          minWidth$: this.minWindowWidth$,
          minHeight$: this.minWindowHeight$,
        }, this.Y);
      },
      hidden: true,
    },
    {
      model_: 'BooleanProperty',
      name: 'appBuilderAnalyticsEnabled',
      defaultValue: true,
      hidden: true,
    },
    {
      model_: 'StringProperty',
      name: 'analyticsId',
      label: 'Google Analytics property tracking ID',
      help: 'When set, reports app usage statistics through Google Analytics.',
    },
  ],

  methods: [
    function getChromePermissions() {
      var ps = [];
      if ( this.kioskEnabled ) ps.push('power');            // To keep the display awake.
      if ( this.rotation !== 0 ) ps.push('system.display'); // To rotate displays.
      if ( this.virtualKeyboardEnabled )
        ps.push('accessibilityFeatures.read', 'accessibilityFeatures.modify');
      return ps;
    },
    function createDAO() {
      if ( this.dao && this.model ) {
        return this.dao.factory(this.appId, this.model, this.Y);
      }
      return null;
    },
  ],
});
