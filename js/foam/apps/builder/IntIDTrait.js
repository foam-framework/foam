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
  name: 'IntIDTrait',
  help: 'Shorthand for adding an integer ID to a model.',

  ids: ['id'],

  properties: [
    {
      type: 'Int',
      name: 'id',
      defaultValue: 0,
      hidden: true
    }
  ]
});
