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
      model_: 'StringProperty',
      name: 'modelType',
      help: 'The model id of the type to store in this DAO.',
      defaultValue: 'Model',
    },
    {
      model_: 'FactoryProperty',
      hidden: true,
      name: 'factory',
    },
    {
      model_: 'BooleanProperty',
      name: 'requiresUserConfiguration',
      help: 'True if the user should be shown an EditView to configure this DAOFactory',
      defaultValue: false,
    }
  ],

  methods: [
    function aLoadModel(ret) {
      /* afunc to load the model referenced by $$DOC(ref:'.modelType'). Calls ret(model). */
      var self = this;
      var found = false;
      if ( self.modelDAO ) {
        self.modelDAO.select(EQ(Model.ID, self.modelType), {
          put: function(m) {
            if ( ! found ) {
              found = true;
              ret && ret(m);
            }
          },
          eof: function() {
            if ( ! found ) {
              arequire(self.modelType)(ret);
            }
          },
          error: function() {
            arequire(self.modelType)(ret);
          }
        });
      } else {
        arequire(self.modelType)(ret);
      }
    },
  ],

});