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
  package: 'foam.ui.md',
  name: 'EditColumns',

  properties: [
    {
      model_: 'ModelProperty',
      name: 'model',
      required: true,
    },
    {
      model_: 'StringArrayProperty',
      name: 'properties',
    },
    {
      model_: 'ArrayProperty',
      subType: 'Property',
      name: 'availableProperties',
      lazyFactory: function() {
        if ( ! this.model ) return [];
        var m = this.model;
        return m.tableProperties.map(function(propName) {
          return m.getProperty(propName);
        });
      },
    },
  ],
});
