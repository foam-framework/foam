
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
  package: 'foam.util.zip',
  name: 'BinaryIntProperty',
  extends: 'IntProperty',

  properties: [
    {
      type: 'Int',
      name: 'size',
      defaultValue: 2,
    },
    {
      type: 'Int',
      name: 'offset',
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'endian',
      defaultValue: 'LITTLE',
      choices: [
        ['LITTLE', 'Little'],
        ['BIG', 'Big'],
      ],
    },
  ],
});
