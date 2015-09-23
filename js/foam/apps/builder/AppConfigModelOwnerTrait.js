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
      preSet: function(old, nu) {
        // preset-postset split to allow both DAO and model to update this.dao before writing
        if ( nu && (old !== nu) ) {
          // primary key change for the model
          this.modelRemove(this.model);
          this.model.name = capitalize(camelize(nu));
          if ( this.dao ) this.dao.modelType = this.model.id;
        }
        return nu;
      },
      postSet: function(old, nu) {
        if ( nu && (old !== nu) ) {
          this.modelPut(this.model);
        }
      }
    },
    {
      name: 'model',
      view: 'foam.ui.md.DetailView',
      lazyFactory: function() {
        this.resetModel();
      },
      preSet: function(old,nu) {
        if ( ! nu ) return old;
        if ( old && (old.id !== nu.id) ) {
          this.modelRemove(old);
        }
        var ret = nu.deepClone();
        // copy the other model but use our name
        if ( this.appName ) ret.name = capitalize(camelize(this.appName));
        return ret;
      },
      postSet: function(old,nu) {
        if ( nu ) {
          this.modelPut(nu);
          nu.addListener(this.modelChange);
        }
        if ( old ) old.removeListener(this.modelChange);
        this.modelChange();
      },
   },

  ],

  listeners: [
    {
      name: 'modelChange',
      code: function() {
        this.propertyChange('model', null, this.model);
        this.modelPut(this.model);
      }
    }
  ],

  methods: [
    function resetModel() {
      this.model = this.Model.create({
        extendsModel: this.baseModelId,
        name: capitalize(camelize(this.appName)),
      });
    },

    function modelPut(model) {
      this.modelDAO && this.modelDAO.put(model, {
        put: function(o) { console.log("put ok", o.id); },
        error: function(o) {
          console.log("put error", o);
        },
      });
    },
    function modelRemove(model) {
      this.modelDAO && this.modelDAO.remove(model, {
        remove: function(o) { console.log("remove ok", o.id); },
        error: function(func, o) {
          console.log("remove error", o);
        },
      });
    },

  ],

});