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
  package: 'foam.meta.descriptor',
  name: 'MetaDescriptor',

  documentation: function() {/* Describes a type (such as when creating a new
    property). Instances of $$DOC{ref:'foam.meta.descriptor.PropertyMetaDescriptor'} may be edited
    and then used to create a corresponding $$DOC{ref:'Property'} instance.
  */},

  properties: [
    {
      model_: 'StringProperty',
      name: 'model',
      documentation: function() {/* The model id of the new item. */},
    },
    {
      model_: 'StringProperty',
      name: 'name',
      documentation: function() {/* The name of the new item. */},
    },
  ],

});
