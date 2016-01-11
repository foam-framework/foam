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
  name: 'AppWindow',

  properties: [
    {
      type: 'String',
      name: 'id',
      defaultValue: 'foam.apps.builder.AppConfig',
    },
    {
      type: 'String',
      name: 'name',
      defaultValue: 'App Builder App',
    },
    {
      type: 'Int',
      name: 'width',
      defaultValue: 800,
    },
    {
      type: 'Int',
      name: 'height',
      defaultValue: 700,
    },
    {
      type: 'Int',
      name: 'minWidth',
      defaultValue: 400,
    },
    {
      type: 'Int',
      name: 'minHeight',
      defaultValue: 600,
    },
  ],
});
