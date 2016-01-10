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
  package: 'foam.chrome',
  name: 'AppContext',

  properties: [
    {
      type: 'String',
      name: 'model',
      defaultValue: 'foam.util.Timer'
    },
    {
      type: 'String',
      name: 'view',
      defaultValue: 'foam.ui.DetailView'
    }
  ]
});
