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
  name: 'EmbeddedDAOFactory',
  package: 'foam.apps.builder.dao',

  extends: 'foam.apps.builder.dao.DAOFactory',

  label: 'Embedded storage that lives inside your app. Add data from an Admini App.',

  requires: [
    'foam.dao.SeqNoDAO',
    'foam.dao.EasyDAO',
  ],

  documentation: "Holds a serializable description of a DAO type.",

  properties: [
    {
      type: 'Factory',
      hidden: true,
      name: 'factory',
      defaultValue: function(name, model, X) {
        // TODO: add MDAO support
        //return this.SeqNoDAO.create({ delegate: this.store_.dao });
        this.share_ = this.EasyDAO.create({
          model: model,
          name: name,
          daoType: this.IDBDAO,
          cache: true,
          seqNo: true,
          logging: true,
        });
        if (! this.store_ ) {
          this.store_ = [];
        }
        this.store_.dao;

        this.syncShared();

        return this.store_;
      },
    },
    {
      name: 'requiresUserConfiguration',
      defaultValue: false,
      hidden: true,
    },
    {
      type: 'Array',
      name: 'store_',
      hidden: true,
      documentation: function() {/* Since we are potentially externally storing
        the custom model needed to deserialize this content, we don't
        set model_ on the items so they are not immediately FOAMalized when
        deserializing. We have to come back and inflate them later. */},
      propertyToJSON: function(visitor, output, o) {
        if ( o[this.name] && o[this.name].length ) {
          // decorate visitor to rename model_
          var DeflateObjectToJSON = {
            __proto__: ObjectToJSON.create(),
            visitObject: function(o) {
              this.push({
                // set model_ such that deserialize won't find it
                __model_: (o.model_.package ? o.model_.package + '.' : '') + o.model_.name
              });
              Visitor.visitObject.call(this, o);
              return this.pop();
            },
            // Substitute in-place
            visitArray: Visitor.visitArray,
            visitArrayElement: function (arr, i) { arr[i] = this.visit(arr[i]); }
          };
          output[this.name] = DeflateObjectToJSON.visitArray(o[this.name]);
        }
      },
      getter: function(name) {
        var val = this.instance_[name];
        // we delayed deserialization by hiding model_ for our content
        // if content not inflated yet, inflate it
        if ( val && val[0] && val[0].__model_ ) {
          //console.warn("EmbeddedDAO Getter, not inflated yet:", val, (new Error()).stack);
          val = this.inflate(val);
        }
        this.instance_[name] = val;
        return val;
      },
       preSet: function(old,nu) {
         return nu.slice();
       },
    },
    {
      model_: 'foam.apps.builder.NoCloneProperty',
      name: 'share_',
      documentation: "An area to copy the data to so that multiple apps can share or edit the data at app design time.",
      transient: true,
      hidden: true,
      propertyToJSON: function() { return ''; },
    },
  ],

  methods: [
    function inflate(val) {
      var InflateJSONToObject = {
        __proto__: JSONToObject,
        visitMap: function(o) {
          if ( o.__model_ ) {
            o.model_ = o.__model_;
            delete o.__model_;
          }
          return this.__proto__.visitObject(o);
        },
      };
      return InflateJSONToObject.visit(val);
    },

    function syncShared() {
      this.store_.dao;

      // Once: dump the contents of the share into the store, and vice-versa.
      this.store_.select(this.share_);
      this.share_.select(this.store_);

      // Continually: pass puts and removes through to the share as well
      this.store_.listen(this.share_);
    },
  ],
});