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

CLASS({
  name: 'StringProperty',
  extendsModel: 'Property',

  help: 'Describes a properties of type String.',

  properties: [
    {
      name: 'displayHeight',
      type: 'int',
      displayWidth: 8,
      defaultValue: 1,
      help: 'The display height of the property.'
    },
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'String',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'adapt',
      defaultValue: function (_, v) {
        return v === undefined || v === null ? '' :
        typeof v === 'function'              ? multiline(v) : v.toString() ;
      }
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 70,
      defaultValue: 'String',
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'foam.ui.TextFieldView'
    },
    {
      name: 'pattern',
      help: 'Regex pattern for property.'
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    }
  ]
});


CLASS({
  name: 'BooleanProperty',
  extendsModel: 'Property',

  help: 'Describes a properties of type Boolean.',

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Boolean',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 70,
      defaultValue: 'bool',
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'foam.ui.BooleanView'
    },
    {
      name: 'defaultValue',
      defaultValue: false
    },
    {
      name: 'adapt',
      defaultValue: function (_, v) { return !!v; }
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    },
    {
      name: 'fromString',
      defaultValue: function(s, p) {
        var txt = s.trim();
        this[p.name] =
          txt.equalsIC('y')    ||
          txt.equalsIC('yes')  ||
          txt.equalsIC('true') ||
          txt.equalsIC('t');
      },
      help: 'Function to extract value from a String.'
    }
  ]
});


CLASS({
  name:  'DateProperty',
  extendsModel: 'Property',

  help:  'Describes a properties of type Date.',

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Date',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'displayWidth',
      defaultValue: 50
    },
    {
      name: 'javaType',
      type: 'String',
      defaultValue: 'Date',
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      // TODO: create custom DateView
      defaultValue: 'foam.ui.DateFieldView'
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    },
    {
      name: 'adapt',
      defaultValue: function (_, d) {
        return typeof d === 'string' ? new Date(d) : d;
      }
    },
    {
      name: 'tableFormatter',
      defaultValue: function(d) {
        return d ? d.toRelativeDateString() : '';
      }
    },
    {
      name: 'compareProperty',
      defaultValue: function(o1, o2) {
        if ( ! o1 ) return ( ! o2 ) ? 0: -1;
        if ( ! o2 ) return 1;

        return o1.compareTo(o2);
      }
    }
  ]
});


CLASS({
  name: 'DateTimeProperty',
  extendsModel: 'DateProperty',

  help: 'Describes a properties of type DateTime.',

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 25,
      defaultValue: 'datetime',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'adapt',
      defaultValue: function(_, d) {
        if ( typeof d === 'number' ) return new Date(d);
        if ( typeof d === 'string' ) return new Date(d);
        return d;
      }
    },
    {
      name: 'view',
      defaultValue: 'foam.ui.DateTimeFieldView'
    }
  ]
});


CLASS({
  name:  'IntProperty',
  extendsModel: 'Property',
  help:  'Describes a properties of type Int.',

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Int',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'displayWidth',
      defaultValue: 10
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      defaultValue: 'int',
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'foam.ui.IntFieldView'
    },
    {
      name: 'adapt',
      defaultValue: function (_, v) {
        return typeof v === 'number' ? Math.round(v) : v ? parseInt(v) : 0 ;
      }
    },
    {
      name: 'defaultValue',
      defaultValue: 0
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    },
    {
      name: 'compareProperty',
      defaultValue: function(o1, o2) {
        return o1 === o2 ? 0 : o1 > o2 ? 1 : -1;
      }
    }
  ]
});


CLASS({
  name:  'FloatProperty',
  extendsModel: 'Property',
  help:  'Describes a properties of type Float.',

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Float',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'defaultValue',
      defaultValue: 0.0
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      defaultValue: 'double',
      help: 'The Java type of this property.'
    },
    {
      name: 'displayWidth',
      defaultValue: 15
    },
    {
      name: 'view',
      defaultValue: 'foam.ui.FloatFieldView'
    },
    {
      name: 'adapt',
      defaultValue: function (_, v) {
        return typeof v === 'number' ? v : v ? parseFloat(v) : 0.0 ;
      }
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    }
  ]
});


CLASS({
  name:  'FunctionProperty',
  extendsModel: 'Property',
  help:  'Describes a properties of type Function.',

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Function',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      defaultValue: 'Function',
      help: 'The Java type of this property.'
    },
    {
      name: 'displayWidth',
      defaultValue: 15
    },
    {
      name: 'view',
      defaultValue: 'foam.ui.FunctionView'
    },
    {
      name: 'defaultValue',
      defaultValue: function() {}
    },
    {
      name: 'fromElement',
      defaultValue: function(e, p) {
        var txt = e.innerHTML.trim();

        this[p.name] = txt.startsWith('function') ?
          eval('(' + txt + ')') :
          new Function(txt) ;
      }
    },
    {
      name: 'adapt',
      defaultValue: function(_, value) {
        if ( typeof value === 'string' ) {
          return value.startsWith('function') ?
            eval('(' + value + ')') :
            new Function(value);
        }
        return value;
      }
    }
  ]
});


CLASS({
  name: 'ArrayProperty',
  extendsModel: 'Property',
  help: 'Describes a properties of type Array.',

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Array',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'singular',
      type: 'String',
      displayWidth: 70,
      defaultValueFn: function() { return this.name.replace(/s$/, ''); },
      help: 'The plural form of this model\'s name.',
      documentation: function() { /* The singular form of $$DOC{ref:'Property.name'}.*/}
    },
    {
      name: 'subType',
      type: 'String',
      displayWidth: 20,
      defaultValue: '',
      help: 'The FOAM sub-type of this property.'
    },
    {
      name: 'protobufType',
      defaultValueFn: function() { return this.subType; }
    },
    {
      name: 'adapt',
      defaultValue: function(_, a, prop) {
        var m = this.X.lookup(prop.subType) || GLOBAL.lookup(prop.subType);

        if ( m ) {
          for ( var i = 0 ; i < a.length ; i++ ) {
            if ( ! m.isInstance(a[i]) )
              a[i] = a[i].model_ ? FOAM(a[i]) : m.create(a[i]);
          }
        }

        return a;
      }
    },
    {
      name: 'postSet',
      defaultValue: function(oldA, a, prop) {
        var name = prop.name + 'ArrayRelay_';
        var l = this[name] || ( this[name] = function() {
          this.propertyChange(prop.name, null, this[prop.name]);
        }.bind(this) );
        if ( oldA && oldA.unlisten ) oldA.unlisten(l);
        if ( a && a.listen ) a.listen(l);
      }
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      defaultValueFn: function(p) { return p.subType + '[]'; },
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'foam.ui.ArrayView'
    },
    {
      name: 'factory',
      defaultValue: function() { return []; }
    },
    {
      name: 'propertyToJSON',
      defaultValue: function(visitor, output, o) {
        if ( ! this.transient && o[this.name].length )
          output[this.name] = visitor.visitArray(o[this.name]);
      }
    },
    {
      name: 'install',
      defaultValue: function(prop) {
        defineLazyProperty(this, prop.name + '$Proxy', function() {
          var proxy = this.X.lookup('foam.dao.ProxyDAO').create({delegate: this[prop.name].dao});

          this.addPropertyListener(prop.name, function(_, _, _, a) {
            proxy.delegate = a.dao;
          });

          return {
            get: function() { return proxy; },
            configurable: true
          };
        });

        this.addMethod('get' + capitalize(prop.singular), function(id) {
          for ( var i = 0; i < this[prop.name].length; i++ ) {
            if ( this[prop.name][i].id === id ) return this[prop.name][i];
          }
        });
      }
    },
    {
      name: 'fromElement',
      defaultValue: function(e, p) {
        var model = this.X.lookup(e.getAttribute('model') || p.subType);
        var children = e.children;
        var a = [];
        for ( var i = 0 ; i < children.length ; i++ ) {
          var o = model.create(null, this.Y);
          o.fromElement(children[i], p);
          a.push(o);
        }
        this[p.name] = a;
      }
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    }
  ]
});


CLASS({
  name:  'ReferenceProperty',
  extendsModel: 'Property',
  help:  'A foreign key reference to another Entity.',

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Reference',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'subType',
      type: 'String',
      displayWidth: 20,
      defaultValue: '',
      help: 'The FOAM sub-type of this property.'
    },
    {
      name: 'subKey',
      type: 'EXPR',
      displayWidth: 20,
      defaultValue: 'ID',
      help: 'The foreign key that this property references.'
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      // TODO: should obtain primary-key type from subType
      defaultValueFn: function(p) { return 'Object'; },
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'foam.ui.TextFieldView'
// TODO: Uncomment when all usages of ReferenceProperty/ReferenceArrayProperty fixed.
//      defaultValue: 'KeyView'
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    }
  ]
});


CLASS({
  name: 'StringArrayProperty',
  extendsModel: 'Property',
  help: 'An array of String values.',

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Array[]',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'singular',
      type: 'String',
      displayWidth: 70,
      defaultValueFn: function() { return this.name.replace(/s$/, ''); },
      help: 'The plural form of this model\'s name.',
      documentation: function() { /* The singular form of $$DOC{ref:'Property.name'}.*/}
    },
    {
      name: 'subType',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'String',
      help: 'The FOAM sub-type of this property.'
    },
    {
      name: 'displayWidth',
      defaultValue: 50
    },
    {
      name: 'adapt',
      defaultValue: function(_, v) { return Array.isArray(v) ? v : [v]; }
    },
    {
      name: 'factory',
      defaultValue: function() { return []; }
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      defaultValue: 'String[]',
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'foam.ui.StringArrayView'
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    },
    {
      name: 'exclusive',
      defaultValue: false
    },
    {
      name: 'fromString',
      defaultValue: function(s, p) {
        this[p.name] = s.split(',');
      }
    },
    {
      name: 'fromElement',
      defaultValue: function(e, p) {
        var val = [];
        var name = p.singular || 'item';
        for ( var i = 0 ; i < e.children.length ; i++ )
          if ( e.children[i].nodeName === name ) val.push(e.children[i].innerHTML);
        this[p.name] = val;
      }
    }
  ]
});


CLASS({
  name: 'ModelProperty',
  extendsModel: 'Property',
  help: 'Describes a Model property.',

  properties: [
    {
      name: 'type',
      defaultValue: 'Model'
    },
    {
      name: 'getter',
      defaultValue: function(name) {
        var value = this.instance_[name];
        if ( typeof value === 'undefined' ) {
          var prop = this.model_.getProperty(name);
          if ( prop && prop.defaultValueFn )
            value = prop.defaultValueFn.call(this, prop);
          else
            value = prop.defaultValue;
        }
        return this.X.lookup(value);
      }
    },
    {
      name: 'propertyToJSON',
      defaultValue: function(visitor, output, o) {
        if ( ! this.transient ) output[this.name] = o[this.name].id;
      }
    }
  ]
});


CLASS({
  name: 'ViewProperty',
  extendsModel: 'Property',

  help: 'Describes a View-Factory property.',

  properties: [
    {
      name: 'adapt',
      doc: "Can be specified as either a function, a Model, a Model path, or a JSON object.",
      defaultValue: function(_, f) {
        if ( typeof f === 'function' ) return f;

        if ( typeof f === 'string' ) {
          return function(d, opt_X) {
            return (opt_X || this.X).lookup(f).create(d, opt_X || this.Y);
          }.bind(this);
        }

        if ( typeof f.create === 'function' ) return f.create.bind(f);
        if ( typeof f.model_ === 'string' ) return function(d, opt_X) {
          return FOAM(f, opt_X || this.Y).copyFrom(d);
        }

        console.error('******* Unknown view factory: ', f);
        return f;
      }
    },
    {
      name: 'defaultValue',
      adapt: function(_, f) { return ViewProperty.ADAPT.defaultValue.call(this, null, f); }
    }
  ]
});


CLASS({
  name: 'FactoryProperty',
  extendsModel: 'Property',

  help: 'Describes a Factory property.',

  properties: [
    {
      name: 'preSet',
      doc: "Can be specified as either a function, a Model, a Model path, or a JSON object.",
      defaultValue: function(_, f) {
        // A Factory Function
        if ( typeof f === 'function' ) return f;

        // A String Path to a Model
        if ( typeof f === 'string' ) return function(map, opt_X) {
          return (opt_X || this.X).lookup(f).create(map, opt_X || this.Y);
        }.bind(this);

        // An actual Model
        if ( Model.isInstance(f) ) return f.create.bind(f);

        // A JSON Model Factory: { factory_ : 'ModelName', arg1: value1, ... }
        if ( f.factory_ ) return function(map, opt_X) {
          var X = opt_X || this.X;
          var m = X.lookup(f.factory_);
          console.assert(m, 'Unknown Factory Model: ' + f.factory_);
          return m.create(f, opt_X || this.Y);
        }.bind(this);

        console.error('******* Invalid Factory: ', f);
        return f;
      }
    }
  ]
});


CLASS({
  name: 'ViewFactoryProperty',
  extendsModel: 'FactoryProperty',

  help: 'Describes a View Factory property.',

  /* Doesn't work yet!
  constants: {
    VIEW_CACHE: {}
  },
  */

  properties: [
    {
      name: 'defaultValue',
      preSet: function(_, f) { return ViewFactoryProperty.ADAPT.defaultValue.call(this, null, f); }
    },
    {
      name: 'defaultValueFn',
      preSet: function(_, f) {
        // return a function that will adapt the given f's return
        return function(prop) {
          // call the defaultValue function, adapt the result, return it
          return ViewFactoryProperty.ADAPT.defaultValue.call(this, null, f.call(this, prop));
        };
      }
    },
    {
      name: 'fromElement',
      defaultValue: function(e, p) {
        this[p.name] = e.innerHTML_ || ( e.innerHTML_ = e.innerHTML );
      }
    },
    {
      name: 'adapt',
      doc: "Can be specified as either a function, String markup, a Model, a Model path, or a JSON object.",
      defaultValue: function(_, f) {
        // Undefined values
        if ( ! f ) return f;

        // A Factory Function
        if ( typeof f === 'function' ) return f;

        var ret;

        // A String Path to a Model
        if ( typeof f === 'string' ) {
          // if not a valid model path then treat as a template
          if ( /[^0-9a-zA-Z$_.]/.exec(f) ) {
            // Cache the creation of an DetailView so that we don't
            // keep recompiling the template
            var VIEW_CACHE = ViewFactoryProperty.VIEW_CACHE ||
              ( ViewFactoryProperty.VIEW_CACHE = {} );
            var viewModel = VIEW_CACHE[f];
            if ( ! viewModel ) {
                viewModel = VIEW_CACHE[f] = Model.create({
                  name: 'InnerDetailView' + this.$UID,
                  extendsModel: 'foam.ui.DetailView',
                  templates:[{name: 'toHTML', template: f}]
                });
              // TODO(kgr): this isn't right because compiling the View
              // template is async.  Should create a FutureView to handle this.
              viewModel.arequire();
            }
            ret = function(args, X) { return viewModel.create(args, X || this.Y); };
          } else {
            ret = function(map, opt_X) {
              return (opt_X || this.X).lookup(f).create(map, opt_X || this.Y);
            }.bind(this);
          }

          ret.toString = function() { return '"' + f + '"'; };
          return ret;
        }

        // An actual Model
        if ( Model.isInstance(f) ) return f.create.bind(f);

        // A JSON Model Factory: { factory_ : 'ModelName', arg1: value1, ... }
        if ( f.factory_ ) {
          ret = function(map, opt_X) {
            var m = (opt_X || this.X).lookup(f.factory_);
            console.assert(m, 'Unknown ViewFactory Model: ' + f.factory_);
            return m.create(f, opt_X || this.Y).copyFrom(map);
          }.bind(this);

          ret.toString = function() { return JSON.stringify(f); };
          return ret;
        }

        if ( this.X.lookup('foam.ui.BaseView').isInstance(f) ) return constantFn(f);

        console.error('******* Invalid Factory: ', f);
        return f;
      }
    }
  ]
});


CLASS({
  name: 'ReferenceArrayProperty',
  extendsModel: 'ReferenceProperty',

  properties: [
    {
      name: 'type',
      defaultValue: 'Array',
      displayWidth: 20,
      help: 'The FOAM type of this property.'
    },
    {
      name: 'factory',
      defaultValue: function() { return []; },
    },
    {
      name: 'view',
      defaultValue: 'foam.ui.StringArrayView',
// TODO: Uncomment when all usages of ReferenceProperty/ReferenceArrayProperty fixed.
//      defaultValue: 'DAOKeyView'
    }
  ]
});

CLASS({
  name: 'EMailProperty',
  extendsModel: 'StringProperty'
});

CLASS({
  name: 'ImageProperty',
  extendsModel: 'StringProperty'
});

CLASS({
  name: 'URLProperty',
  extendsModel: 'StringProperty'
});

CLASS({
  name: 'ColorProperty',
  extendsModel: 'StringProperty'
});

CLASS({
  name: 'PasswordProperty',
  extendsModel: 'StringProperty'
});

CLASS({
  name: 'DocumentationProperty',
  extendsModel: 'Property',
  help: 'Describes the documentation properties found on Models, Properties, Actions, Methods, etc.',
  documentation: "The developer documentation for this $$DOC{ref:'.'}. Use a $$DOC{ref:'DocModelView'} to view documentation.",

  properties: [
    {
      name: 'type',
      type: 'String',
      defaultvalue: 'Documentation'
    },
    { // Note: defaultValue: for the getter function didn't work. factory: does.
      name: 'getter',
      type: 'Function',
      defaultValue: function(name) {
        var doc = this.instance_[name]
        if (doc && typeof Documentation != "undefined" && Documentation // a source has to exist (otherwise we'll return undefined below)
            && (  !doc.model_ // but we don't know if the user set model_
                  || !doc.model_.getPrototype // model_ could be a string
                  || !Documentation.isInstance(doc) // check for correct type
               ) ) {
          // So in this case we have something in documentation, but it's not of the
          // "Documentation" model type, so FOAMalize it.
          if (doc.body) {
            this.instance_[name] = Documentation.create( doc );
          } else {
            this.instance_[name] = Documentation.create({ body: doc });
          }
        }
        // otherwise return the previously FOAMalized model or undefined if nothing specified.
        return this.instance_[name];
      }
    },
    {
      name: 'view',
      defaultValue: 'foam.ui.DetailView'
    },
    {
      name: 'help',
      defaultValue: 'Documentation for this entity.'
    },
    {
      name: 'documentation',
      factory: function() { return "The developer documentation for this $$DOC{ref:'.'}. Use a $$DOC{ref:'DocModelView'} to view documentation."; }
   }
  ]
});
