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
      model_: 'StringProperty',
      name: 'termsOfService',
      label: 'Terms of Service',
      help: multiline(function() {/*
        Terms of service the user must accept before using the application.
      */}),
      disabled: true,
      issues: [
        'TODO(markdittmer): Support file upload.',
        multiline(function() {/*
          TODO(markdittmer): Implement showing this in lightbox before
          revealing landing page.
        */})
      ],
      view: {
        factory_: 'foam.ui.md.TextFieldView',
        placeholder: 'TERMS OF SERVICE',
        displayHeight: 8
      }
    },
    {
      model_: 'StringProperty',
      name: 'rotation',
      label:  'Rotation (Chrome OS only)',
      help: 'Measured in degrees.',
      view: {
        factory_: 'foam.ui.md.PopupChoiceView',
        choices: [
          ['0', '0'],
          ['90', '90'],
          ['180', '180'],
          ['270', '270']
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
    }
  ]
});
