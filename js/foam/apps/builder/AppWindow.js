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
      model_: 'StringProperty',
      name: 'id',
      defaultValue: 'foam.apps.builder.AppConfig',
    },
    {
      model_: 'StringProperty',
      name: 'name',
      defaultValue: 'App Builder App',
    },
    {
      model_: 'IntProperty',
      name: 'width',
      defaultValue: 800,
    },
    {
      model_: 'IntProperty',
      name: 'height',
      defaultValue: 700,
    },
    {
      model_: 'IntProperty',
      name: 'minWidth',
      defaultValue: 400,
    },
    {
      model_: 'IntProperty',
      name: 'minHeight',
      defaultValue: 600,
    },
  ],
});
