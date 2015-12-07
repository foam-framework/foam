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
  name: 'Sandbox',
  extends: 'foam.ui.md.DetailView',

  requires: [
    'foam.dao.IDBDAO',
    'foam.sandbox.IsolatedContext',
    'foam.dao.FindFallbackDAO',
    'foam.dao.LoggingDAO',
    'foam.dao.CachingDAO',
    'MDAO',
    'com.google.paper.Scanner',
    'foam.ui.md.SharedStyles',
    'foam.input.touch.GestureManager',
    'foam.input.touch.TouchManager',
  ],
  exports: [
    'gestureManager',
    'touchManager',
    'loadedCodeBaseContext',
  ],

  documentation: function() {/* Scans all models from a QR code and stores them
    in an IDB modelDAO. The last model contained in the scanned data is
    instantiated displayed. */},

  properties: [
    {
      name: 'touchManager',
      factory: function() {
        return this.TouchManager.create();
      }
    },
    {
      name: 'gestureManager',
      factory: function() {
        return this.GestureManager.create();
      }
    },
    {
      name: 'modelInstance',
      help: 'The scanned model to render',
      adapt: function(old,nu) {
        if ( ! nu ) return old;
        return nu;
      },
      lazyFactory: function() { return this.SharedStyles.create(); }
    },
    {
      type: 'ViewFactory',
      name: 'scanner',
      lazyFactory: function() {
        return function(args,X) {
          var s = this.Scanner.create(args, this.Y);
          s.modelReady = this.modelReady;
          return s;
        }
      }
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
          cache: this.MDAO.create({ model: Model })
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
            loader.message = "Requiring for: " + model.id;
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
    function modelReady(model) {
      console.log('Model fready!', model.id);
      this.modelInstance = model.create({}, this.loadedCodeBaseContext);
      console.log("created", this.modelInstance);
      //this.updateHTML();
    }

  ],

  methods: [
    function init() {
      this.SharedStyles.create();
    }
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        $$modelInstance{ model_: 'com.google.paper.InstanceView' }
        %%scanner()
      </div>
    */},
    function CSS() {/*
      .property-edit-view {
        display: flex;
        flex-direction: column;
        align-content: baseline;
        flex-grow: 1;
        background: white;
      }
      .property-edit-view .md-flex-row {
        overflow: none;
        align-content: baseline;
      }
    */},

  ]


});
