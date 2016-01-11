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
  package: 'foam.apps.builder.datamodels.meta.descriptor',
  name: 'MetaDescriptor',

  documentation: function() {/* Describes a type (such as when creating a new
    property). Instances of $$DOC{ref:'foam.apps.builder.datamodels.meta.descriptor.PropertyMetaDescriptor'} may be edited
    and then used to create a corresponding $$DOC{ref:'Property'} instance.
  */},

  properties: [
    {
      type: 'String',
      name: 'model',
      documentation: function() {/* The model id of the new item. */},
    },
    {
      name: 'name',
    }
  ],

  methods: [
    function createModel(opt_X) {
      var X = opt_X || this.Y;
      return X.lookup(this.model).create({ name: this.name }, X);
    }
  ],

});