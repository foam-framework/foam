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
  name: 'NoCloneProperty',
  package: 'foam.apps.builder',
  extendsModel: 'Property',

  help: 'Describes a property that will not clone its value.',

  methods: [
    function deepCloneProperty(val) {
      return val;
    }
  ]
});
