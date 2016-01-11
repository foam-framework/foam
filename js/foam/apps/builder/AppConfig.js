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

  documentation: function() {/*
    Describes an app. Specialize to create different app types,
    and implement an $$DOC{ref:'foam.apps.builder.AppController'}
    specialization for runtime inflation such as DAO creation.
  */},

  requires: [
    'foam.apps.builder.AppWindow',
  ],

  ids: [ 'appId' ],

  properties: [
    {
      type: 'String',
      name: 'appId',
      label: 'Unique App ID',
      mode: 'read-only',
      help: "The hidden unique id for the app that links DAO instances and models to the owner app.",
      factory: function() {
        return camelize(this.appName) + '-' + createGUID();
      }
    },
    {
      type: 'String',
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
      name: 'dataConfigs',
      help: 'The data and dao definitions this app uses.',
      factory: function() { return []; },
      adapt: function(old,nu) {
        if ( Array.isArray(nu) ) {
          nu.forEach(function(dc) {
            dc.parent = this;
          }.bind(this));
          return nu;
        } else {
          nu.parent = this;
          return [nu];
        }
      }
    },
    {
      type: 'ViewFactory',
      name: 'designerView',
      hidden: true,
      transient: true
    },
    {
      type: 'ViewFactory',
      name: 'appView',
      hidden: true,
      transient: true
    },
    {
      type: 'String',
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
      type: 'String',
      name: 'termsOfService',
      label: 'Terms of Service',
      help: multiline(function() {/*
        Terms of service the user must accept before using the application.
      */}),
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
      type: 'String',
      name: 'privacyPolicyURL',
      label: 'Privacy policy URL',
      help: 'Link to app Privacy Policy.',
      view: 'foam.ui.md.TextFieldView'
    },
    {
      type: 'ViewFactory',
      name: 'userDataWarning',
      transient: true,
      defaultValue: null
    },
    {
      type: 'Int',
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
      type: 'Boolean',
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
      ]
    },
    {
      type: 'Int',
      name: 'sessionDataTimeoutTime',
      label: 'Session idle timeout',
      help: 'Time (in minutes) the app is idle before clearing browsing data.',
      rangeDescription: '1 - 1440 minutes',
      defaultDescription: '0 = unlimited'
    },
    {
      type: 'Int',
      name: 'sessionTimeoutTime',
      label: 'Timeout to return home',
      help: multiline(function() {/*
        Time (in minutes) the app is idle before returning to the homepage.
        Browsing data is not cleared.
      */}),
      rangeDescription: '1 - 1440 minutes',
      defaultDescription: '0 = unlimited'
    },
    {
      type: 'Boolean',
      name: 'virtualKeyboardEnabled',
      label: 'Virtual keyboard enabled',
      help: 'Enables the on-screen virtual keyboard.',
      defaultValue: true
    },
    {
      type: 'String',
      name: 'chromeId',
      hidden: true
    },
    {
      type: 'Int',
      name: 'defaultWindowWidth',
      label: 'Default app window width',
      defaultValue: 800
    },
    {
      type: 'Int',
      name: 'defaultWindowHeight',
      label: 'Default app window height',
      defaultValue: 700
    },
    {
      type: 'Int',
      name: 'minWindowWidth',
      label: 'Minimum app window width',
      defaultValue: 400
    },
    {
      type: 'Int',
      name: 'minWindowHeight',
      label: 'Minimum app window height',
      defaultValue: 600
    },
    {
      name: 'appWindow',
      lazyFactory: function() {
        return this.AppWindow.create({
          id: this.model_.id,
          name$: this.appName$,
          width$: this.defaultWindowWidth$,
          height$: this.defaultWindowHeight$,
          minWidth$: this.minWindowWidth$,
          minHeight$: this.minWindowHeight$
        }, this.Y);
      },
      hidden: true
    },
    {
      type: 'Boolean',
      name: 'appBuilderAnalyticsEnabled',
      hidden: true,
      defaultValue: true,
      label: 'Send anonymous usage data from this app to the App Builder team ' +
          'to help make App Builder better<br><a href="#">Learn more</a>'
    },
    {
      type: 'String',
      name: 'analyticsId',
      label: 'Google Analytics property tracking ID',
      help: 'When set, reports app usage statistics through Google Analytics.'
    }
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
    function createDAO(opt_name) {
      var dc = this.getDataConfig(opt_name);
      return dc && dc.createDAO();
    },
    function resetDAO(opt_name) {
      var dc = this.getDataConfig(opt_name);
      return dc && dc.resetDAO();
    },
    function resetModel(opt_name) {
      var dc = this.getDataConfig(opt_name);
      return dc && dc.resetModel();
    },
    function getDataConfig(opt_name) {
      // TODO(jacksonic): consider a map of DataConfigs
      var dc = this.dataConfigs[0];
      if ( opt_name ) {
        this.dataConfigs.forEach(function(d) {
          if ( d.name == opt_name ) dc = d;
        });
      }
      return dc;
    }
  ]
});
