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
  extendsModel: 'foam.apps.builder.Template',

  label: 'Chrome Application Configuration',

  ids: ['appName'],

  properties: [
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
      }
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
      model_: 'StringProperty',
      name: 'chromeId',
      hidden: true,
    },
  ]
});
