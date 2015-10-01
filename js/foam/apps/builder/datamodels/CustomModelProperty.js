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
  name: 'CustomModelProperty',
  package: 'foam.apps.builder.datamodels',
  extendsModel: 'Property',

  help: 'Describes a Model property that is editable by the user.',
  label: 'Data Model definition',

  properties: [
    [ 'type', 'Model' ],
    {
      name: 'adapt',
      defaultValue: function(old, nu) {
        if ( ! nu ) return nu;

        if ( Model.isInstance(nu) ) {
          if ( nu.instance_ && nu.instance_.prototype_ ) {
            nu.instance_.prototype_ = null;
          }
          Model.properties.forEach(function(mprop) {
            nu[mprop.name] = nu[mprop.name];
          });
          return nu;
        }

        if ( typeof nu === 'string' ) {
          var model = this.X.lookup(nu);
          if ( model ) return model;
        }

        return nu;
      }
    },
  ],

  methods: [
    function deepCloneProperty(model) {
      // TODO(jacksonic): this.X will be from when the CustomModelProperty instance was created...
      return Model.create(model, this.X);
    }
  ]
});
