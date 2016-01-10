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
  name: 'DAOFactory',
  package: 'foam.apps.builder.dao',

  documentation: "Holds a serializable description of a DAO type.",

  imports: [
    'modelDAO',
  ],

  properties: [
    {
      name: 'name',
      help: 'The name of this DAO configuration.'
    },
    {
      name: 'label',
      help: 'A friendly label to refer to this DAO configuration.',
      defaultValueFn: function() { return this.name; },
    },
    {
      type: 'Factory',
      hidden: true,
      name: 'factory',
      documentation: "Your factory is called as: factory(name, model, X). The name will be unique to the app, and model is the model to store in the dao.",
    },
    {
      type: 'Boolean',
      name: 'requiresUserConfiguration',
      help: 'True if the user should be shown an EditView to configure this DAOFactory',
      defaultValue: false,
    }
  ],


});