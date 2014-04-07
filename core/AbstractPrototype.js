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

var prefix = '';

/** The Prototype for all Generated Prototypes. **/
// TODO: Rename FOAMObject or FObject
var AbstractPrototype = {
  __proto__: PropertyChangeSupport,

  TYPE: 'AbstractPrototype',

  create: function(args, opt_X) {
    var o = Object.create(this);
    o.instance_ = {};
    if ( opt_X ) o.X = opt_X;
    if ( typeof args === 'object' ) o.copyFrom(args);

    o.init(args);

    return o;
  },

  /** Context defaults to the global namespace by default. **/
  X: X,

  init: function(_) {
    if ( ! this.model_ ) return;

    if ( ! Object.hasOwnProperty.call(this.model_, 'valueFactoryProperties_') ) {
      this.model_.valueFactoryProperties_ = [];

      var ps = this.model_.properties;
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var prop = ps[i];

        if ( prop.valueFactory ) this.model_.valueFactoryProperties_.push(prop);
      }
    }

    var ps = this.model_.valueFactoryProperties_;
    for ( var i = 0 ; i < ps.length ; i++ ) {
      var prop = ps[i];

      // I'm not sure why I added this next line, but it isn't used
      // so I've disabled it.  There is no 'init' property on Property
      // but maybe it would be a good idea.
      //     if ( prop.init ) prop.init.call(this);

      // If a value was explicitly provided in the create args
      // then don't call the valueFactory if it exists.
      // if ( ! this.instance_[prop.name] ) this[prop.name] = prop.valueFactory.call(this);
      if ( ! this.hasOwnProperty(prop.name) ) this[prop.name] = prop.valueFactory.call(this);
    }

    // Add shortcut create() method to Models which allows them to be
    // used as constructors.  Don't do this for the Model though
    // because we need the regular behavior there.
    if ( this.model_ == Model && this.name != 'Model' )
      this.create = ModelProto.create;
  },


  defineFOAMGetter: function(name, getter) {
    var stack = Events.onGet.stack;
    this.__defineGetter__(name, function() {
      var value = getter.call(this);
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
      setter.call(this, newValue);
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
    // this method might be a good candidate for a decision table

    var name = prop.name;

    // TODO: add caching
    if ( ! AbstractPrototype.__lookupGetter__(name + '$') ) {
      Object.defineProperty(AbstractPrototype, name + '$', {
        get: function() { return this.propertyValue(name); },
        set: function(value) { Events.link(value, this.propertyValue(name)); }
      });
    }

    if ( prop.getter ) {
      this.__defineGetter__(name, prop.getter);
    } else {
      this.defineFOAMGetter(name, prop.defaultValueFn ?
        function() {
          return typeof this.instance_[name] !== 'undefined' ? this.instance_[name] : prop.defaultValueFn.call(this, prop);
        } :
        function() {
          return typeof this.instance_[name] !== 'undefined' ? this.instance_[name] : prop.defaultValue;
        });
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

      if ( prop.postSet ) {
        setter = (function(setter, postSet) { return function(oldValue, newValue) {
          setter.call(this, oldValue, newValue);
          postSet.call(this, oldValue, newValue)
        }; })(setter, prop.postSet);
      }

      var propertyTopic = PropertyChangeSupport.propertyTopic(name);
      setter = (function(setter) { return function(oldValue, newValue) {
        setter.call(this, oldValue, newValue);
        this.propertyChange_(propertyTopic, oldValue, newValue);
      }; })(setter);

      if ( prop.preSet ) {
        setter = (function(setter, preSet) { return function(oldValue, newValue) {
          setter.call(this, oldValue, preSet.call(this, newValue, oldValue, prop));
        }; })(setter, prop.preSet);
      }

      setter = (function(setter) { return function(newValue) {
        setter.call(this, this[name], newValue);
      }; })(setter);

      this.defineFOAMSetter(name, setter);
    }
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
    for ( var key in this.instance_ ) {
      var value = this[key];
      c[key] = Array.isArray(value) ? value.clone() : value;
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

          obj = obj.deepClone();
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

  write: function(document) {
    var view = ActionBorder.create(
      this.model_,
      DetailView.create({model: this.model_}));

    document.writeln(view.toHTML());
    view.value.set(this);
    view.initHTML();
  },

  addDecorators: function(map) {
    for ( var name in map ) {
      if ( ! this[name] || ! this[name] instanceof Function )
        console.warn("Decorating a non-function or non-existant function.");

      var func = map[name];
      var delegate = this[name];
      this[name] = function() {
        return func.call(this, delegate.bind(this), arguments);
      };
    }
  }
};
