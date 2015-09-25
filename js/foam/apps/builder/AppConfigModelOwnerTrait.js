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
  name: 'AppConfigModelOwnerTrait',

  requires: [
    'Model',
    'BooleanProperty',
    'StringProperty',
    'IntProperty',
    'FloatProperty',
    'DateProperty',
    'foam.ui.md.DetailView',
    'foam.ui.TableView',
  ],

  documentation: 'X.modelDAO should exist and be shared with any DAOFactory instances.',

  imports: [
    'modelDAO',
  ],

  properties: [
    {
      name: 'baseModelId',
      help: 'The model name of the base type for models this trait owns.',
    },
    {
      name: 'appName',
      postSet: function(old, nu) {
        if ( nu && ( old !== nu )) {
          this.model.label = capitalize(camelize(nu));
          this.modelPut(this.model);
        }
      }
    },
    {
      name: 'model',
      view: 'foam.ui.md.DetailView',
      lazyFactory: function() {
        return this.Model.create({
          extendsModel: this.baseModelId,
          name: this.appId,
          label: capitalize(camelize(this.appName))
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
        return ret;
      },
      postSet: function(old,nu) {
        if ( old ) old.removeListener(this.modelChange);
        if ( nu ) {
          // if copying, id was forced to be the same, so we're overwriting the old model
          // if deserializing this, populate the possibly empty modelDAO
          this.modelPut(nu);
          nu.addListener(this.modelChange);
        }
        this.modelChange();
      },
    },
  ],

  listeners: [
    {
      name: 'modelChange',
      code: function() {
        this.propertyChange('model', null, this.model);
        // update the saved copy of the model
        //this.modelPut(this.model);
      }
    }
  ],

  methods: [
    function resetModel() {
      // this initialization case is the only time the name is synced to appName
      this.model = this.Model.create({
        extendsModel: this.baseModelId,
        name: this.appId,
        label: capitalize(camelize(this.appName))
      });
    },

    function modelPut(model) {
      this.modelDAO && model && this.modelDAO.put(model, {
        put: function(o) { console.log("put ok", o.id); },
        error: function(o) {
          console.log("put error", o);
        },
      });
    },
    function modelRemove(model) {
      this.modelDAO && model && this.modelDAO.remove(model, {
        remove: function(o) { console.log("remove ok", o.id); },
        error: function(func, o) {
          console.log("remove error", o);
        },
      });
    },
  ],

});