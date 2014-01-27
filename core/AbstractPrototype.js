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

/** The Prototype for all Generated Prototypes. **/
// TODO: Rename FOAMObject or FObject
var AbstractPrototype = {
  __proto__: PropertyChangeSupport,

  TYPE: 'AbstractPrototype',

  create: function(args) {
/*
console.log("args: ", args);
    if (arguments.length > 1) {
      args = {};
      for (var i = 0 ; i < arguments.length; i++) {
        arguments[i].forEach(function (k,v) {
console.log(i, k, v);
          args[k] = v;
        });
      }
    }
*/

    if ( this.__objProto__ != this ) debugger;

    var obj = {
      __proto__: this.__objProto__ || this,
      instance_: {}
    };

    if ( typeof args === 'object' ) obj.copyFrom(args);
    obj.init(args);

    return obj;
  },


  init: function(_) {
    if ( ! this.model_ ) return;

    for ( var i = 0 ; i < this.model_.properties.length ; i++ ) {
      var prop = this.model_.properties[i];

      // I'm not sure why I added this next line, but it isn't used
      // so I've disabled it
      //     if ( prop.init ) prop.init.call(this);

      // If a value was explicitly provided in the create args
      // then don't call the valueFactory if it exists.
      if ( prop.valueFactory && ! this.instance_[prop.name] )
        this[prop.name] = prop.valueFactory.call(this);
    }

    // Add shortcut create() method to Models which allows them to be
    // used as constructors.  Don't do this for the Model though
    // because we need the regular behavior there.
    if ( this.model_ == Model && this.name != 'Model' )
      this.create = ModelProto.create;
  },


  defineFOAMGetter: function(name, getter) {
    this.__defineGetter__(name, function() {
      var value = getter.call(this);
      Events.onGet(this, name, value);
      return value;
    });
  },

  defineFOAMSetter: function(name, setter) {
    this.__defineSetter__(name, function(newValue) {
      if ( ! Events.onSet(this, name, newValue) ) return;
      setter.call(this, newValue);
    });
  },


  toString: function() {
// console.log(this.model_.name + "Prototype");
    // return this.model_.name + "Prototype";
    return this.toJSON();
  },


  hasOwnProperty: function(name) {
    return this.instance_.hasOwnProperty(name);
  },

  writeActions: function(other, out) {
      for (var i = 0, property; property = this.model_.properties[i]; i++) {
          if (property.actionFactory) {
              var actions = property.actionFactory(this, property.f(this), property.f(other));
              for (var j = 0; j < actions.length; j++)
                  out(actions[j]);
          }
      }
  },

  clearProperty: function(name) {
    delete this.instance_[name];
  },


  // todo:
  become: function(other) {

  },


  // todo:
  becomeClone: function(other) {

  },


  defineProperty: function(prop) {
    // this method might be a good candidate for a decision table

    var name = prop.name;

    if ( prop.getter ) {
      this.__defineGetter__(name, prop.getter);
    } else {
      this.defineFOAMGetter(name, prop.defaultValueFn ?
        function() {
          return this.hasOwnProperty(name) ? this.instance_[name] : prop.defaultValueFn.call(this);
        } :
        function() {
          return this.hasOwnProperty(name) ? this.instance_[name] : prop.defaultValue;
        });
    }

    if ( prop.setter ) {
      this.defineFOAMSetter(name, prop.setter);
    } else if ( prop.preSet || prop.postSet ) {
      this.defineFOAMSetter(name, function(newValue) {
        var oldValue = this[name];

        if ( prop.preSet )
          newValue = prop.preSet.call(this, newValue, oldValue, prop);

        // todo: fix
        if ( prop.type == 'int' || prop.type == 'float' )
          newValue = Number(newValue);

        this.instance_[name] = newValue;

        if ( prop.postSet )
          prop.postSet.call(this, newValue, oldValue);

        this.propertyChange(name, oldValue, newValue);
      });
    } else {
      this.defineFOAMSetter(name, function(newValue) {
        var oldValue = this[name];

        // todo: fix
        if ( prop.type == 'int' || prop.type == 'float' )
          newValue = Number(newValue);

        this.instance_[name] = newValue;

        // TODO: remove
        try {
          this.propertyChange(name, oldValue, newValue);
        } catch (x) {
        }
      });
    }
  },


  getProperty: function(name) {
    // TODO: cache in map
    for ( var i = 0 ; i < this.properties.length ; i++ ) {
      var prop = this.properties[i];

      if ( prop.name == name ) return prop;
    }

    return undefined;
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
    return ( this.model_ && this.model_.create ) ? this.model_.create(this) : this;
  },

  /** Create a deep copy of this object. **/
  deepClone: function() {
    var cln = this.clone();

    // now clone inner collections
    for ( var key in cln.instance_ ) {
      var val = cln.instance_[key];

      if ( val instanceof Array ) {
        val = val.slice(0);
        cln.instance_[key] = val;

        for ( var i = 0 ; i < val.length ; i++ ) {
          var obj = val[i];

          if ( obj.deepClone )
            val[i] = obj.deepClone();
        }
      }
    }

    return cln;
  },

  /** @return this **/
  copyFrom: function(src) {
    // Faster and doesn't copy default values from modelled objects.
    // Doesn't work when src is modelled and has default values
    // if ( src && src.instance_ ) src = src.instance_;

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
//         if ( src.instance_ && src.instance_.hasOwnProperty(name) ) this[prop.name] = src[prop.name];
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
  }
};

/*
AbstractPrototype.__defineGetter__('__super__', function() {
  return this.__proto__.__proto__;
});
*/
