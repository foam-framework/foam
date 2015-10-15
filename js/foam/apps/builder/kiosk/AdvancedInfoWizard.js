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
  package: 'foam.apps.builder.kiosk',
  name: 'AdvancedInfoWizard',
  extends: 'foam.apps.builder.wizard.WizardPage',

  properties: [
    {
      name: 'title',
      defaultValue: 'Advanced',
    },
  ],

  templates: [
    function instructionHTML() {/*
      <span>
        Use the controls below to configure advanced settings for your kiosk
        app. For example, if you input Terms of Service, then the user must
        accept the terms before using the app, or any time the user logs out
        or the app times out and returns to the homepage. You can also set an
        app-idle timeout after which session data (browser history and cache)
        gets cleared, or the app returns to the homepage. Timeouts are measured
        in minutes.
      </span>
    */},
    function contentHTML() {/*
      $$termsOfService
      $$sessionDataTimeoutTime
      $$sessionTimeoutTime
      $$analyticsId
      $$enableURLTracking
    */},
  ],
});
