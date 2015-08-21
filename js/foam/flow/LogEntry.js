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
  name: 'LogEntry',
  package: 'foam.flow',

  properties: [
    {
      model_: 'IntProperty',
      name: 'id'
    },
    {
      model_: 'StringProperty',
      name: 'mode',
      defaultValue: 'log'
    },
    {
      model_: 'StringProperty',
      name: 'contents'
    }
  ]});
