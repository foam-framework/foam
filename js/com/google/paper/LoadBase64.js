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
  package: 'com.google.paper',
  name: 'LoadBase64',

  requires: [
    'foam.dao.IDBDAO',
    'foam.util.Base64Decoder',
    'foam.util.encodings.IncrementalUtf8',
    'foam.sandbox.IsolatedContext',
    'foam.dao.FindFallbackDAO',
    'foam.dao.LoggingDAO',
    'foam.dao.CachingDAO',
    'MDAO',
  ],

  properties: [
    {
      name: 'data',
      hidden: true,
      postSet: function(old, nu) {
        if ( nu ) {
          var decoder = this.Base64Decoder.create({ sink: this.IncrementalUtf8.create() });
          decoder.put(nu);
          decoder.eof();
          var str = decoder.sink.string;
          var X = this.loadedCodeBaseContext;
          try {
            eval('(function(X, CLASS){' + str + '}).call(null, X, X.CLASS)');
          } catch (e) {
            this.message = "Data error: " + e.toString();
          }
        } else {
          this.message = "No Data!";
        }
      },
    },
    {
      name: 'dao',
      hidden: true,
      lazyFactory: function() {
        return this.CachingDAO.create({ src:
          this.IDBDAO.create({
            model: Model,
            name: 'FOAMModels',
            useSimpleSerialization: false,
          }),
          src: this.MDAO.create({ model: Model })
        });
      },
    },
    {
      name: 'modelDAO',
      hidden: true,
      lazyFactory: function() {
        return  this.FindFallbackDAO.create({
          delegate: this.dao,
          fallback: this.X.ModelDAO,
        });
      },
    },
    {
      name: 'message',
      mode: 'read-only',
      defaultValue: 'No Data.',
      postSet: function(old,nu) {
        console.log(nu);
      },
    },
    {
      name: 'loadedCodeBaseContext',
      hidden: true,
      factory: function() {
        var loader = this;
        return this.IsolatedContext.create({
          classFn: function(modelHash, opt_X) {
            var Y = opt_X || this; // this == the IsolatedContext instance
            modelHash.package = modelHash.package || 'foam.sandbox';
            var model = Y.Model.create(modelHash, Y);
            Y.registerModel(model);
            loader.dao && loader.dao.put(model); // save the new model
            loader.message = "Requiring: " + model.id;
            model.arequire()(loader.modelReady);
            return model;
          }
        }, GLOBAL.X).Y.sub({
          ModelDAO: this.modelDAO,
        });
      },
    },
  ],

  listeners: [
    {
      name: 'modelReady',
      code: function(m) {
        this.message = 'Required ok, '+m.id;
      },
    },
  ],

});
