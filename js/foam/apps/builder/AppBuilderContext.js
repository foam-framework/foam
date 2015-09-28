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
  name: 'AppBuilderContext',

  properties: [
    {
      model_: 'BooleanProperty',
      name: 'hasSeenDesignerView',
      defaultValue: false,
      hidden: true,
    },
    {
      model_: 'BooleanProperty',
      name: 'appBuilderAnalyticsEnabled',
      label: 'Send anonymous usage data from my apps to the App Builder team ' +
          'to help make App Builder better',
      defaultValue: true,
    },
  ],
});
