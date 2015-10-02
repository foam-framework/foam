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
  package: 'foam.apps.builder',
  name: 'DataConfig',

  label: 'Data Definition',

  requires: [
    'foam.apps.builder.dao.LocalDAOFactory',
    'Model',
    'foam.apps.builder.datamodels.CustomModelProperty',
  ],

  properties: [
    {
      name: 'name',
      help: 'The name of this data+dao, unique inside an app. Typcially the app will set this name.',
    },
    {
      model_: 'foam.apps.builder.NoCloneProperty',
      name: 'parent',
      transient: true,
      hidden: true,
      type: 'foam.apps.builder.AppConfig',
      postSet: function(old,nu) {
        if ( nu ) {
          var id = nu.appId + "_" + this.name;
          var name = nu.appName + " " + this.name;
          if ( this.model && this.model.name !== id ) {
            this.model.name = id;
            this.model.label = capitalize(camelize(name));
            this.model.extendsModel = nu.baseModelId;
          }
          if ( this.dao && this.dao.name !== name ) this.dao.name = name;
        }
      }
    },
    {
      model_: 'foam.apps.builder.datamodels.CustomModelProperty',
      name: 'model',
      help: 'The primary data model this app operates on.',
      defaultValue: null,
      adapt: function(old, nu) {
        if ( typeof nu === 'string' ) {
          if ( ! nu ) return old;
          var ret = this.X.lookup(nu);
          return ret;
        }
        if ( Model.isInstance(nu) ) return nu;
        return old;
      },
      lazyFactory: function() {
        return this.Model.create({
          extendsModel: this.parent.baseModelId,
          name: this.parent.appId,
          label: capitalize(camelize(this.appName+" "+this.name))
        });
      },
      preSet: function(old,nu) {
        if ( ! nu ) return old;
        // copy the mew model but use our old model's id
        // if deserializing this, there's no old so just keep the model as given
        var ret = nu.deepClone();
        if ( old ) {
          ret.package = old.package;
          ret.name = old.name;
        }
        ret = Model.create(ret); //TODO(jacksonic): this is a waste after cloning, but some things set in Model.create aren't cloned
        return ret;
      },
      postSet: function(old,nu) {
        if ( old ) old.removeListener(this.modelChange);
        if ( nu ) nu.addListener(this.modelChange);
        this.modelChange();
      },
    },
    {
      name: 'dao',
      type: 'foam.apps.builder.dao.DAOFactory',
      help: 'The data source type and location.',
      lazyFactory: function() {
        return this.LocalDAOFactory.create({
          name: this.parent.appName,
        });
      },
      postSet: function(old,nu) {
        if ( ! nu ) debugger;
      }

    },
  ],

  listeners: [
    {
      name: 'modelChange',
      help: 'Propagates changes inside the model, during editing.',
      code: function() {
        this.propertyChange('model', null, this.model);
      }
    }
  ],

  methods: [
    function resetDAO() {
      this.dao = this.LocalDAOFactory.create({
        name: this.parent.appName + " " + this.name,
      });
    },
    function resetModel() {
      // this initialization case is the only time the name is synced to appName
      this.model = this.Model.create({
        extendsModel: this.parent.baseModelId,
        name: this.parent.appId + "_" + this.name,
        label: capitalize(camelize(this.parent.appName+" "+this.name))
      });
    },

    function modelPut(model) {
      /* implement if separate copies of models are to be stored in their own DAO */
    },
    function modelRemove(model) {
      /* implement if separate copies of models are to be stored in their own DAO */
    },


    function createDAO() {
      if ( this.dao && this.model ) {
        return this.dao.factory(this.parent.appId+"_"+this.name, this.model, this.Y);
      }
      return null;
    },
  ],
});
