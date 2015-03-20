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

  replaceModel_: function(model, otherModel, X) {
    while ( otherModel ) {
      var replacementName =
        ( model.package   ? model.package + '.' : '' ) +
        ( otherModel.name ? otherModel.name     : otherModel ) + // TODO(jackson): Shouldn't there be a separator here?
        model.name ;

      var replacementModel = X.lookup(replacementName);

      if ( replacementModel ) return replacementModel;

      otherModel = X.lookup(otherModel.extendsModel);
    }

    return undefined;
  },

  create_: function() { return Object.create(this); },

  create: function(args, opt_X) {
    // console.log('**** create ', this.model_.name, this.model_.count__ = (this.model_.count__ || 0)+1);
    // check for a model-for-model replacement, only if args.model is a Model instance
    if ( args && args.model && (opt_X || X).Model.isInstance(args.model) ) {
      var ret = this.replaceModel_(this.model_, args.model, opt_X || X);
      if ( ret ) return ret.create(args, opt_X);
    }

    var o = this.create_(this);
    o.instance_ = {};
    o.X = (opt_X || X);
    o.Y = o.X.sub({}, (o.X.NAME ? o.X.NAME : '') + 'Y');

    if ( this.model_.imports_ && this.model_.imports_.length ) {
      if ( ! Object.prototype.hasOwnProperty.call(this, 'imports__') ) {
        this.imports__ = this.model_.imports_.map(function(e) {
          var s = e.split(' as ');
          return [s[0], s[1] || s[0]];
        });
      }
      for ( var i = 0 ; i < this.imports__.length ; i++ ) {
        var im = this.imports__[i];
        // Don't import from Context if explicitly passed in args
        if ( ( ! args || ! args.hasOwnProperty(im[1]) ) && typeof o.X[im[0]] !== 'undefined' ) o[im[1]] = o.X[im[0]];
      }
    }

//    if ( typeof args === 'object' ) o.copyFrom(args);

    if ( o.model_ ) {
      var agents = this.initAgents();
      for ( var i = 0 ; i < agents.length ; i++ ) agents[i][1](o, o.X, o.Y, args);
    }

    o.init(args);

    return o;
  },

  init: nop,

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

  addInitAgent: function(priority, desc, agent) {
    agent.toString = function() { return desc; };
    this.initAgents_.push([priority, agent]);
  },

  initAgents: function() {
    if ( ! this.model_ ) return;

    // this == prototype
    if ( ! Object.hasOwnProperty.call(this, 'initAgents_') ) {
      var agents = this.initAgents_ = [];
      var self = this;

      // Four cases for export: 'this', a method, a property value$, a property
      Object_forEach(this.model_.exports_, function(e) {
        var exp = e.split('as ');

        if ( exp.length == 0 ) return;

        var key   = exp[0].trim();
        var alias = exp[1] || exp[0];

        if ( key ) {
          var asValue = key !== '$' && key != '$$' && key.charAt(key.length-1) == '$';
          if ( asValue ) key = key.slice(0, key.length-1);

          var prop = self.model_.getProperty(key);
          if ( prop ) {
            if ( asValue ) {
              self.addInitAgent(1, 'export property value ' + key, function(o, X, Y) { Y.set(alias, o[prop.name$_]); });
            } else {
              self.addInitAgent(1, 'export property ' + key, function(o, X, Y) { Y.setValue(alias, o[prop.name$_]); });
            }
          } else {
            self.addInitAgent(0, 'export other ' + key, function(o, X, Y) {
              var out = typeof o[key] === "function" ? o[key].bind(o) : o[key];
              Y.set(alias, out);
            });
          }
        } else {
          // Exporting 'this'
          self.addInitAgent(0, 'export this', function(o, X, Y) { Y.set(alias, o); });
        }
      });

      this.model_.properties_.forEach(function(prop) {
        if ( prop.initPropertyAgents ) {
          prop.initPropertyAgents(self);
        } else {
          self.addInitAgent(
            0,
            'set proto-property ' + prop.name,
            function(o, X, Y, m) {
              if ( m && m.hasOwnProperty(prop.name) )
                o[prop.name] = m[prop.name];
            });
        }
      });

      // Add shortcut create() method to Models
      self.addInitAgent(0, 'Add create() to Model', function(o, X, Y) {
        if ( Model.isInstance(o) && o.name != 'Model' ) o.create = BootstrapModel.create;
      });

      // Works if sort is 'stable', which it isn't in Chrome
      // agents.sort(function(o1, o2) { return o1[0] - o2[0]; });

      // TODO(kgr): make a stableSort() function in stdlib
      for ( key in agents ) agents[key][2] = key;
      agents.sort(CompoundComparator(
        function(o1, o2) { return o1[0] - o2[0]; },
        function(o1, o2) { return o1[2] - o2[2]; }));

      // For debugging, prints list of init agents.
      /*
      for ( var i = 0 ; i < agents.length ; i++ )
        console.log(i, agents[i][0], agents[i][1].toString());
      */
    }

    return this.initAgents_;
  },

  fromElement: function(e) {
    var elements = this.elementMap_;

    // Build a map of properties keyed off of 'name'
    // TODO: do we have a method to lookupIC?
    if ( ! elements ) {
      elements = {};
      for ( var i = 0 ; i < this.model_.properties_.length ; i++ ) {
        var p = this.model_.properties_[i];
        elements[p.name] = p;
        elements[p.name.toUpperCase()] = p;
      }
      this.elementMap_ = elements;
    }

    for ( var i = 0 ; i < e.attributes.length ; i++ ) {
      var attr = e.attributes[i];
      var p    = elements[attr.name];
      var val  = attr.value;
      if ( p ) {
        if ( val.startsWith('#') ) {
          val = val.substring(1);
          var $val = this.X.$(val);
          if ( $val ) {
            this[attr.name] = this.X.$(val);
          } else {
            p.fromString.call(this, val, p);
          }
        } else {
          // Call fromString() for attribute values because they're
          // String values, not Elements.
          p.fromString.call(this, val, p);
        }
      } else {
        if ( ! { id: true, model: true, view: true, showactions: true, oninit: true }[attr.name] )
          console.warn('Unknown attribute name: "' + attr.name + '"');
      }
    }

    for ( var i = 0 ; i < e.children.length ; i++ ) {
      var c = e.children[i];
      var p = elements[c.nodeName];
      if ( p ) {
        p.fromElement.call(this, c, p);
      } else {
        console.warn('Unknown element name: "' + c.nodeName + '"');
      }
    }

    return this;
  },

  installInDocument: function(X, document) {
    for ( var i = 0 ; i < this.model_.templates.length ; i++ ) {
      var t = this.model_.templates[i];
      if ( t.name === 'CSS' ) {
        t.futureTemplate(function() {
          X.addStyle(this.CSS());
        }.bind(this));
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
    for ( var i = 0, property ; property = this.model_.properties_[i] ; i++ ) {
      if ( property.actionFactory ) {
        var actions = property.actionFactory(this, property.f(this), property.f(other));
        for (var j = 0; j < actions.length; j++)
          out(actions[j]);
      }
    }
  },

  equals: function(other) { return this.compareTo(other) == 0; },

  compareTo: function(other) {
    if ( other === this ) return 0;
    if ( this.model_ !== other.model_ ) {
      // TODO: This provides unstable ordering if two objects have a different model_
      // but they have the same name.
      return this.model_.name.compareTo(other.model_.name) || 1;
    }

    var ps = this.model_.properties_;

    for ( var i = 0 ; i < ps.length ; i++ ) {
      var r = ps[i].compare(this, other);

      if ( r ) return r;
    }

    return 0;
  },

  diff: function(other) {
    var diff = {};

    for ( var i = 0, property; property = this.model_.properties_[i]; i++ ) {
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
  clearProperty: function(name) { delete this.instance_[name]; },

  defineProperty: function(prop) {
    var name = prop.name;
    prop.name$_ = name + '$';

    // Add a 'name$' psedo-property if not already defined
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
      } else if ( prop.factory ) {
        getter = function() {
          if ( typeof this.instance_[name] == 'undefined' ) {
            this.instance_[name] = null; // prevents infinite recursion
            // console.log('Ahead of order factory: ', prop.name);
            //debugger;
            var val = prop.factory.call(this, prop);
            this[name] = val;
          }
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

      if ( prop.adapt ) {
        setter = (function(setter, adapt) { return function(oldValue, newValue) {
          setter.call(this, oldValue, adapt.call(this, oldValue, newValue, prop));
        }; })(setter, prop.adapt);
      }

      /* TODO: New version that doesn't trigger lazyFactory or getter. */
      setter = (function(setter) { return function(newValue) {
        setter.call(this, typeof this.instance_[name] == 'undefined' ? prop.defaultValue : this.instance_[name], newValue);
      }; })(setter);

      /*
      setter = (function(setter) { return function(newValue) {
        setter.call(this, this[name], newValue);
      }; })(setter);
      */
      this.defineFOAMSetter(name, setter);
    }

    // Let the property install other features into the Prototype
    prop.install && prop.install.call(this, prop);
  },

  addMethod: function(name, method) {
    if ( this.__proto__[name] ) {
      override(this, name, method);
    } else {
      this[name] = method;
    }
  },

  hashCode: function() {
    var hash = 17;

    for ( var i = 0; i < this.model_.properties_.length ; i++ ) {
      var prop = this[this.model_.properties_[i].name];
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
    for ( var i = 0; i < this.model_.properties_.length; i++ ) {
      var prop = this.model_.properties_[i];
      if ( Number.isFinite(prop.prototag) )
        prop.outProtobuf(this, out);
    }
  },

  /** Create a shallow copy of this object. **/
  clone: function() {
    var c = Object.create(this.__proto__);
    c.instance_ = {};
    c.X = this.X;
    c.Y = this.Y;
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
      var ps = this.model_.properties_;
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var prop = ps[i];
        if ( src.hasOwnProperty(prop.name) ) this[prop.name] = src[prop.name];
        if ( src.hasOwnProperty(prop.name$_) ) this[prop.name$_] = src[prop.name$_];
      }
    }

    return this;
  },

  output: function(out) { return JSONUtil.output(out, this); },

  toJSON: function() { return JSONUtil.stringify(this); },

  toXML: function() { return XMLUtil.stringify(this); },

  write: function(document, opt_view) {
    //console.warn("FObject.write() for ", this.model_.id," is not safe when called from async code.");
    var view = (opt_view || X.foam.ui.DetailView).create({
      model: this.model_,
      data: this,
      showActions: true
    });

    document.writeln(view.toHTML());
    view.initHTML();
  },

  defaultView: function(opt_view) {
    return (opt_view || X.foam.ui.DetailView).create({
      model: this.model_,
      data: this,
      showActions: true
    });
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

    for ( var i = 0 ; i < decorator.model_.methods.length ; i++ ) {
      var method = decorator.model_.methods[i];
      if ( method.name !== 'decorateObject' )
        this.decorate(method.name, method.code, decorator);
    }
    return this;
  },

  getMyFeature: function(featureName) {
    featureName = featureName.toUpperCase();
    return [
      this.properties_ ? this.properties_ : [],
      this.actions_ ? this.actions_ : [],
      this.methods ? this.methods : [],
      this.listeners ? this.listeners : [],
      this.templates ? this.templates : [],
      this.models ? this.models : [],
      this.tests ? this.tests : [],
      this.relationships ? this.relationships : [],
      this.issues ? this.issues : []
    ].mapFind(function(list) { return list.mapFind(function(f) {
      return f.name && f.name.toUpperCase() === featureName && f;
    })});
  },

  getAllMyFeatures: function() {
    var featureList = [];
    [
      this.properties_ ? this.properties_ : [],
      this.actions_ ? this.actions_ : [],
      this.methods ? this.methods : [],
      this.listeners ? this.listeners : [],
      this.templates ? this.templates : [],
      this.models ? this.models : [],
      this.tests ? this.tests : [],
      this.relationships ? this.relationships : [],
      this.issues ? this.issues : []
    ].map(function(list) {
      featureList = featureList.concat(list);
    });
    return featureList;
  },

  // getFeature accounts for inheritance through extendsModel
  getFeature: function(featureName) {
    var feature = this.getMyFeature(featureName);

    if ( ! feature && this.extendsModel ) {
      var ext = this.X.lookup(this.extendsModel);
      if ( ext ) {
        return ext.getFeature(featureName);
      }
    } else {
      return feature;
    }
  },

  // getAllFeatures accounts for inheritance through extendsModel
  getAllFeatures: function() {
    var featureList = this.getAllMyFeatures();

    if ( this.extendsModel ) {
      var ext = this.X.lookup(this.extendsModel);
      if ( ext ) {
        ext.getAllFeatures().map(function(subFeat) {
          var subName = subFeat.name.toUpperCase();
          if ( ! featureList.mapFind(function(myFeat) { // merge in features we don't already have
            return myFeat && myFeat.name && myFeat.name.toUpperCase() === subName;
          }) ) {
            featureList.push(subFeat);
          }
        });
      }
    }
    return featureList;
  }

};
