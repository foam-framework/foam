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
  package: 'com.google.ow.model',
  name: 'OrderItem',

  properties: [
    {
      model_: 'IntProperty',
      name: 'id',
    },
    {
      type: 'com.google.ow.model.Product',
      name: 'product',
    },
    {
      model_: 'IntProperty',
      name: 'quantity',
      defaultValue: 1,
    },
  ],
});
