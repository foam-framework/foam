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
  name: 'IsolatedContext',
  package: 'foam.sandbox',

  documentation: function() {/*
    Export everything needed for creating well-behaved classes in an isolated
    context. This context is "isolated" insofar as allowing the context to be
    garbage collected allows the classes to be garbage collected (provided that
    nothing else has a reference to said classes). The "actual" instance of the
    context is this.Y.
  */},

  exports: [
    'name',
    'packagePath_',
    'packagePath',
    'registerModel',
    'lookup',
    'classFn as CLASS',
    'sub_',
    'sub'
  ],

  properties: [
    {
      name: 'id',
      factory: function() { return this.$UID; }
    },
    {
      type: 'String',
      name: 'name',
      factory: function() { return 'IsolatedContext' + this.id; }
    },
    {
      type: 'Function',
      name: 'packagePath_',
      defaultValue: function(Y, path, i, opt_noCreate) {
        if ( i === path.length ) return Y;
        if ( ! Y[path[i]] && opt_noCreate ) return undefined;

        if ( ! Y.hasOwnProperty(path[i]) ) {
          if ( Y[path[i]] ) Y[path[i]] = Object.create(Y[path[i]]);
          else              Y[path[i]] = {};
        }

        return this.packagePath_(Y[path[i]], path, i+1, opt_noCreate);
      }
    },
    {
      type: 'Function',
      name: 'packagePath',
      defaultValue: function(X, path, opt_noCreate) {
        return path ? this.packagePath_(X, path.split('.'), 0, opt_noCreate) :
            this;
      }
    },
    {
      type: 'Function',
      name: 'registerModel',
      defaultValue: function(model, opt_name) {
        var root    = this;
        var name    = model.name;
        var package = model.package;

        if ( opt_name ) {
          var a = opt_name.split('.');
          name = a.pop();
          package = a.join('.');
        }

        var path = this.packagePath(root, package);
        Object.defineProperty(path, name, { value: model, configurable: true });
        return model;
      }
    },
    {
      type: 'Function',
      name: 'lookup',
      defaultValue: function(path) {
        if ( ! path ) return undefined;
        if ( typeof path !== 'string' ) return path;
        return this.packagePath(this, path, true);
      }
    },
    {
      type: 'Function',
      name: 'classFn',
      defaultValue: function(modelHash, opt_X) {
        var Y = opt_X || this;
        modelHash.package = modelHash.package || 'foam.sandbox';
        var model = Y.Model.create(modelHash, Y);
        Y.registerModel(model);
        return model;
      }
    },
    {
      type: 'Function',
      name: 'sub_',
      factory: function() {
        return this.X.sub;
      }
    },
    {
      type: 'Function',
      name: 'sub',
      defaultValue: function() {
        var sub = this.sub_.apply(this, arguments);
        sub.CLASS = sub.CLASS.bind(sub);
        return sub;
      }
    }
  ]
});
