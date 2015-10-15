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
  name: 'PropertyMetaDescriptor',
  extends: 'foam.apps.builder.datamodels.meta.descriptor.MetaDescriptor',

  requires: ['foam.apps.builder.datamodels.meta.descriptor.PropertyTypeCitationView'],

  label: 'Property',

  documentation: function() {/* Describes a type (such as when creating a new
    property). Instances of $$DOC{ref:'foam.apps.builder.datamodels.meta.descriptor.PropertyMetaDescriptor'} may be edited
    and then used to create a corresponding $$DOC{ref:'Property'} instance.
  */},

  properties: [
    {
      name: 'selectionsDAO',
      view: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'foam.apps.builder.datamodels.meta.descriptor.PropertyTypeCitationView',
      },
      defaultValue: [
         StringProperty,
         BooleanProperty,
         DateProperty,
         DateTimeProperty,
         IntProperty,
         FloatProperty,
//           StringArrayProperty,
         EMailProperty,
         URLProperty,
//           ImageProperty,
//           ColorProperty,
//           PasswordProperty,
         PhoneNumberProperty,
       ],
    },
    {
      label: 'The name of the new property',
      name: 'name',
      preSet: function(old, nu, prop) {
        if ( ! nu ) return old || prop.defaultValue;
        return camelize(nu);
      },
      postSet: function(old,nu) {
        // HACK for textfieldview to ensure it gets the reset value if preSet reverts it
        this.propertyChange('name', null, nu);
      },
      defaultValue: 'name',
    },
  ],

});