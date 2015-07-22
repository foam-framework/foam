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
  package: 'foam.apps.builder.questionnaire',
  name: 'AppConfig',
  extendsModel: 'foam.apps.builder.AppConfig',

  requires: ['Model'],

  properties: [
    {
      name: 'model',
      label: 'Data Model',
      view: 'foam.meta.types.ModelView',
      factory: function() {
        return this.Model.create({
          name: 'NewModel',
          properties: [
            this.BooleanProperty.create({ name: 'boolprop' }),
            this.StringProperty.create({ name: 'stringprop' }),
            this.IntProperty.create({ name: 'intprop' }),
            this.FloatProperty.create({ name: 'floatprop' }),
            this.DateProperty.create({ name: 'dateprop' }),
          ]
        });
      },

    }
  ]
});
