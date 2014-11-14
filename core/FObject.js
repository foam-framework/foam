/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The Prototype for all Generated Prototypes.
 * The common ancestor of all FOAM Objects.
 **/
var FObject = {
  __proto__: PropertyChangeSupport,

  name_: 'FObject',

  create_: function() {
    return Object.create(this);
  },

  create: function(args, opt_X) {
    var o = this.create_(this);
    o.instance_ = {};
    o.X = opt_X || X;

    o.X = o.X.sub({});

    if ( this.model_.imports && this.model_.imports.length ) {
      if ( ! this.imports_ ) {
        this.imports_ = this.model_.imports.map(function(e) {
          var s = e.split(' as ');
          return [s[0], s[1] || s[0]];
        });
      }
      for ( var i = 0 ; i < this.imports_.length ; i++ ) {
        var im = this.imports_[i];
        o[im[1]] = o.X[im[0]];
      }
    }

    if ( typeof args === 'object' ) o.copyFrom(args);
    o.init(args);

    if ( o.model_.exportKeys ) {
      for ( var i = 0; i < o.model_.exportKeys.length; i ++ ) o.X[o.model_.exportKeys[i]] = o;
    }

    return o;
  },

  // TODO: document
  xbind: function(map) {
    return {
      __proto__: this,
      create: function(args, X) {
        args = args || {};
        for ( var key in map ) {
          if ( ! args.hasOwnProperty(key) ) args[key] = map[key];
        }
        return this.__proto__.create(args, X);
      },
      xbind: function(m2) {
        for ( var key in map ) {
          if ( ! m2.hasOwnProperty(key) ) m2[key] = map[key];
        }
        return this.__proto__.xbind(m2);
      }
    }
  },

  /** Context defaults to the global namespace by default. **/
  X: X,

  selectProperties_: function(name, p) {
    if ( Object.hasOwnProperty.call(this.model_, name) ) return this.model_[name];

    var a = [];
    var ps = this.model_.properties;
    for ( var i = 0 ; i < ps.length ; i++ ) if ( ps[i][p] ) a.push(ps[i]);
    this.model_[name] = a;

    return a;
  },

  init: function(_) {
    if ( ! this.model_ ) return;

    this.X = this.X.sub();

    var ps;

    function exportKeys(X, keys, value) {
      if ( ! keys ) return;
      for ( var i = 0 ; i < keys.length ; i++ ) {
        X.set(keys[i], value);
      }
    }

    ps = this.selectProperties_('factoryProperties_', 'factory');
    for ( var i = 0 ; i < ps.length ; i++ ) {
      var prop = ps[i];

      // If a value was explicitly provided in the create args
      // then don't call the factory if it exists.
      // if ( ! this.instance_[prop.name] ) this[prop.name] = prop.factory.call(this);
      if ( ! this.hasOwnProperty(prop.name) ) this[prop.name] = prop.factory.call(this);

      exportKeys(this.X, prop.exportKeys, this[prop.name]);

      if ( prop.exportValueKeys && prop.exportValueKeys.length )
        exportKeys(this.X, prop.exportValueKeys, this[prop.name + '$']);
    }

    ps = this.selectProperties_('dynamicValueProperties_', 'dynamicValue');
    ps.forEach(function(prop) {
      var name = prop.name;
      var dynamicValue = prop.dynamicValue;

      Events.dynamic(
        dynamicValue.bind(this),
        function(value) { this[name] = value; }.bind(this));
    }.bind(this));


    // TODO(kgr): exclude values which were handled in the above lists already
    ps = this.selectProperties_('exportKeyProperties_', 'exportKeys');
    for ( var i = 0 ; i < ps.length ; i++ ) {
      var prop = ps[i];

      exportKeys(this.X, prop.exportKeys, this[prop.name]);
    }


    ps = this.selectProperties_('exportValueKeyProperties_', 'exportValueKeys');
    for ( var i = 0 ; i < ps.length ; i++ ) {
      var prop = ps[i];

      exportKeys(this.X, prop.exportValueKeys, this[prop.name + '$']);
    }

    // Add non-property exports to Context
    if ( this.model_.exports && this.model_.exports.length ) {
      var fnExports = this.model_.fnExports_ ||
        ( this.model_.fnExports_ = this.model_.exports.map(function(e) {
          var s = e.split(' as ');
          s[0] = s[0].trim();
          return [s[0], s[1] || s[0]];
        }).filter(function (s) {
          return typeof this[s[0]] === 'function';
        }.bind(this)));
      for ( var i = 0 ; i < fnExports.length ; i++ ) {
        var e = fnExports[i];
        this.X[e[1]] = this[e[0]].bind(this);
      }

      var otherExports = this.model_.otherExports_ ||
        ( this.model_.otherExports_ = this.model_.exports.map(function(e) {
          var s = e.split(' as ');
          s[0] = s[0].trim();
          return [s[0], s[1] || s[0]];
        }).filter(function (s) {
          return typeof this[s[0]] !== 'function' && ! this.model_.getProperty(s[0]);
        }.bind(this)));
      for ( var i = 0 ; i < otherExports.length ; i++ ) {
        var e = otherExports[i];
        this.X[e[1]] = this[e[0]];
      }
    }

    // Add shortcut create() method to Models which allows them to be
    // used as constructors.  Don't do this for the Model though
    // because we need the regular behavior there.
    if ( this.model_ == Model && this.name != 'Model' )
      this.create = BootstrapModel.create;
  },

  fromElement: function(e) {
    for ( var i = 0 ; i < e.children.length ; i++ ) {
      var c = e.children[i];
      var p = this.model_.getProperty(c.nodeName);
      if ( p ) this[c.nodeName] = p.fromElement.call(this, c, p);
    }
  },

  installInDocument: function(X, document) {
    for ( var i = 0 ; i < this.model_.templates.length ; i++ ) {
      var t = this.model_.templates[i];
      if ( t.name == 'CSS' ) {
        // TODO(kgr): the futureTemplate should be changed to always be there
        // so that we don't need two cases.
        if ( t.futureTemplate ) {
          t.futureTemplate(function() {
            X.addStyle(this.CSS());
          }.bind(this));
        } else {
          X.addStyle(this.CSS());
        }
        return;
      }
    }
  },

  defineFOAMGetter: function(name, getter) {
    var stack = Events.onGet.stack;
    this.__defineGetter__(name, function() {
      var value = getter.call(this, name);
      var f = stack[0];
      f && f(this, name, value);
      return value;
    });
  },

  defineFOAMSetter: function(name, setter) {
    var stack = Events.onSet.stack;
    this.__defineSetter__(name, function(newValue) {
      var f = stack[0];
      if ( f && ! f(this, name, newValue) ) return;
      setter.call(this, newValue, name);
    });
  },

  toString: function() {
    // TODO: do something to detect loops which cause infinite recurrsions.
// console.log(this.model_.name + "Prototype");
    return this.model_.name + "Prototype";
    // return this.toJSON();
  },

  hasOwnProperty: function(name) {
    return typeof this.instance_[name] !== 'undefined';
//    return this.instance_.hasOwnProperty(name);
  },

  writeActions: function(other, out) {
    for ( var i = 0, property ; property = this.model_.properties[i] ; i++ ) {
      if ( property.actionFactory ) {
        var actions = property.actionFactory(this, property.f(this), property.f(other));
        for (var j = 0; j < actions.length; j++)
          out(actions[j]);
      }
    }
  },

  equals: function(other) { return this.compareTo(other) == 0; },

  compareTo: function(other) {
    var ps = this.model_.properties;

    for ( var i = 0 ; i < ps.length ; i++ ) {
      var r = ps[i].compare(this, other);

      if ( r ) return r;
    }

    return 0;
  },

  diff: function(other) {
    var diff = {};

    for ( var i = 0, property; property = this.model_.properties[i]; i++ ) {
      if ( Array.isArray(property.f(this)) ) {
        var subdiff = property.f(this).diff(property.f(other));
        if ( subdiff.added.length !== 0 || subdiff.removed.length !== 0 ) {
          diff[property.name] = subdiff;
        }
        continue;
      }

      if ( property.f(this).compareTo(property.f(other)) !== 0) {
        diff[property.name] = property.f(other);
      }
    }

    return diff;
  },

  /** Reset a property to its default value. **/
  clearProperty: function(name) {
    delete this.instance_[name];
  },

  defineProperty: function(prop) {
    var name = prop.name;
    prop.name$_ = name + '$';

    // TODO: add caching
    if ( ! this.__lookupGetter__(prop.name$_) ) {
      Object.defineProperty(this, prop.name$_, {
        get: function() { return this.propertyValue(name); },
        set: function(value) { Events.link(value, this.propertyValue(name)); },
        configurable: true
      });
    }

    if ( prop.getter ) {
      this.defineFOAMGetter(name, prop.getter);
    } else {
      if ( prop.lazyFactory ) {
        var getter = function() {
          if ( typeof this.instance_[name] !== 'undefined' ) return this.instance_[name];
          this.instance_[name] = prop.lazyFactory.call(this, prop);
          return this.instance_[name];
        };
      } else if ( prop.defaultValueFn ) {
        getter = function() {
          return typeof this.instance_[name] !== 'undefined' ? this.instance_[name] : prop.defaultValueFn.call(this, prop);
        };
      } else {
        getter = function() {
          return typeof this.instance_[name] !== 'undefined' ? this.instance_[name] : prop.defaultValue;
        };
      }
      this.defineFOAMGetter(name, getter);
    }

    if ( prop.setter ) {
      this.defineFOAMSetter(name, prop.setter);
    } else {
      var setter = function(oldValue, newValue) {
        this.instance_[name] = newValue;
      };

      if ( prop.type === 'int' || prop.type === 'float' ) {
        setter = (function(setter) { return function(oldValue, newValue) {
          setter.call(this, oldValue, typeof newValue !== 'number' ? Number(newValue) : newValue);
        }; })(setter);
      }

      if ( prop.onDAOUpdate ) {
        if ( typeof prop.onDAOUpdate === 'string' ) {
          setter = (function(setter, onDAOUpdate, listenerName) { return function(oldValue, newValue) {
            setter.call(this, oldValue, newValue);

            var listener = this[listenerName] || ( this[listenerName] = this[onDAOUpdate].bind(this) );

            if ( oldValue ) oldValue.unlisten(listener);
            if ( newValue ) {
              newValue.listen(listener);
              listener();
            }
          }; })(setter, prop.onDAOUpdate, prop.name + '_onDAOUpdate');
        } else {
          setter = (function(setter, onDAOUpdate, listenerName) { return function(oldValue, newValue) {
            setter.call(this, oldValue, newValue);

            var listener = this[listenerName] || ( this[listenerName] = onDAOUpdate.bind(this) );

            if ( oldValue ) oldValue.unlisten(listener);
            if ( newValue ) {
              newValue.listen(listener);
              listener();
            }
          }; })(setter, prop.onDAOUpdate, prop.name + '_onDAOUpdate');
        }
      }

      if ( prop.postSet ) {
        setter = (function(setter, postSet) { return function(oldValue, newValue) {
          setter.call(this, oldValue, newValue);
          postSet.call(this, oldValue, newValue, prop)
        }; })(setter, prop.postSet);
      }

      var propertyTopic = PropertyChangeSupport.propertyTopic(name);
      setter = (function(setter) { return function(oldValue, newValue) {
        setter.call(this, oldValue, newValue);
        this.propertyChange_(propertyTopic, oldValue, newValue);
      }; })(setter);

      if ( prop.preSet ) {
        setter = (function(setter, preSet) { return function(oldValue, newValue) {
          setter.call(this, oldValue, preSet.call(this, oldValue, newValue, prop));
        }; })(setter, prop.preSet);
      }

      setter = (function(setter) { return function(newValue) {
        setter.call(this, this[name], newValue);
      }; })(setter);

      this.defineFOAMSetter(name, setter);
    }

    // Let the property install other features into the Prototype
    prop.install && prop.install.call(this, prop);
  },

  hashCode: function() {
    var hash = 17;

    for ( var i = 0; i < this.model_.properties.length ; i++ ) {
      var prop = this[this.model_.properties[i].name];
      var code = ! prop ? 0 :
        prop.hashCode   ? prop.hashCode()
                        : prop.toString().hashCode();

      hash = ((hash << 5) - hash) + code;
      hash &= hash;
    }

    return hash;
  },

  // TODO: this should be monkey-patched from a 'ProtoBuf' library
  toProtobuf: function() {
    var out = ProtoWriter.create();
    this.outProtobuf(out);
    return out.value;
  },

  // TODO: this should be monkey-patched from a 'ProtoBuf' library
  outProtobuf: function(out) {
    for ( var i = 0; i < this.model_.properties.length; i++ ) {
      var prop = this.model_.properties[i];
      if ( Number.isFinite(prop.prototag) )
        prop.outProtobuf(this, out);
    }
  },

  /** Create a shallow copy of this object. **/
  clone: function() {
    var c = Object.create(this.__proto__);
    c.instance_ = {};
    c.X = this.X;
    for ( var key in this.instance_ ) {
      var value = this[key];
      // The commented out (original) implementation was causing
      // issues with QuickBug because of the 'lables' postSet.
      // I'm not sure it was done that way originally.
//      c[key] = Array.isArray(value) ? value.clone() : value;
      c.instance_[key] = Array.isArray(value) ? value.clone() : value;
    }
    return c;
//    return ( this.model_ && this.model_.create ) ? this.model_.create(this) : this;
  },

  /** Create a deep copy of this object. **/
  deepClone: function() {
    var cln = this.clone();

    // now clone inner collections
    for ( var key in cln.instance_ ) {
      var val = cln.instance_[key];

      if ( Array.isArray(val) ) {
        for ( var i = 0 ; i < val.length ; i++ ) {
          var obj = val[i];

          val[i] = obj.deepClone();
        }
      }
    }

    return cln;
  },

  /** @return this **/
  copyFrom: function(src) {
/*
    // TODO: remove the 'this.model_' check when all classes modelled
    if ( src && this.model_ ) {
      for ( var i = 0 ; i < this.model_.properties.length ; i++ ) {
        var prop = this.model_.properties[i];

        // If the src is modelled, and it has an instance_
        //   BUT the instance doesn't have a value for the property,
        //   then don't copy this value over since it's a default value.
        if ( src.model_ && src.instance_ &&
            !src.instance_.hasOwnProperty(prop.name) ) continue;

        if ( prop.name in src ) this[prop.name] = src[prop.name];
      }
    }
*/

    if ( src && this.model_ ) {
      var ps = this.model_.properties;
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var prop = ps[i];
        if ( src.hasOwnProperty(prop.name) ) this[prop.name] = src[prop.name];
        if ( src.hasOwnProperty(prop.name$_) ) this[prop.name$_] = src[prop.name$_];
      }
    }

    return this;
  },


  output: function(out) {
    return JSONUtil.output(out, this);
  },


  toJSON: function() {
    return JSONUtil.stringify(this);
  },

  toXML: function() {
    return XMLUtil.stringify(this);
  },

  write: function(document, opt_view) {
    var view = (opt_view || DetailView).create({
      model: this.model_,
      data: this,
      showActions: true
    });

    document.writeln(view.toHTML());
    view.initHTML();
  },

  decorate: function(name, func, that) {
    var delegate = this[name];
    this[name] = function() {
      return func.call(this, that, delegate.bind(this), arguments);
    };
    return this;
  },

  addDecorator: function(decorator) {
    if ( decorator.decorateObject )
      decorator.decorateObject(this);

    for ( var i = 0; i < decorator.model_.methods.length; i++ ) {
      var method = decorator.model_.methods[i];
      if ( method.name !== 'decorateObject' )
        this.decorate(method.name, method.code, decorator);
    }
    return this;
  },

  getMyFeature: function(featureName) {
    featureName = featureName.toUpperCase();
    return [
      this.properties? this.properties : [],
      this.actions? this.actions : [],
      this.methods? this.methods : [],
      this.listeners? this.listeners : [],
      this.templates? this.templates : [],
      this.models? this.models : [],
      this.tests? this.tests : [],
      this.relationships? this.relationships : [],
      this.issues? this.issues : []
    ].mapFind(function(list) { return list.mapFind(function(f) {
      return f.name && f.name.toUpperCase() === featureName && f;
    })});
  },

  getAllMyFeatures: function() {
    var featureList = [];
    [
      this.properties? this.properties : [],
      this.actions? this.actions : [],
      this.methods? this.methods : [],
      this.listeners? this.listeners : [],
      this.templates? this.templates : [],
      this.models? this.models : [],
      this.tests? this.tests : [],
      this.relationships? this.relationships : [],
      this.issues? this.issues : []
    ].map(function(list) {
      featureList = featureList.concat(list);
    });
    return featureList;
  },

  // getFeature accounts for inheritance through extendsModel
  getFeature: function(featureName) {
    var feature = this.getMyFeature(featureName);

    if (this.id != "Model" && !feature) {
      if (this.extendsModel.length > 0 && this.X[this.extendsModel]) {
        return this.X[this.extendsModel].getFeature(featureName);
      } else {
        return this.X["Model"].getFeature(featureName);
      }
    } else {
      return feature;
    }
  },

  // getAllFeatures accounts for inheritance through extendsModel
  getAllFeatures: function() {
    var featureList = this.getAllMyFeatures();

    if (this.id != "Model") {
      var superModel = (this.extendsModel.length > 0 && this.X[this.extendsModel].id)? this.X[this.extendsModel] : this.X["Model"];
      console.log("getAll: ", this.extendsModel, superModel);
      superModel.getAllFeatures().map(function(subFeat) {
          var subName = subFeat.name.toUpperCase();
          if (!featureList.mapFind(function(myFeat) { // merge in features we don't already have
            return myFeat && myFeat.name && myFeat.name.toUpperCase() === subName;
          })) {
            featureList.push(subFeat);
          }
      });
    }
    return featureList;
  }

};
