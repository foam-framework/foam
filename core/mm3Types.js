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
  name: 'Message',
  plural: 'messages',

  tableProperties: [
    'name',
    'value',
    'translationHint'
  ],

  documentation: function() {/*
  */},

  properties: [
    {
      name:  'name',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The coding identifier for the message.',
      documentation: function() { /* The identifier used in code to represent this $$DOC{ref:'.'}.
        $$DOC{ref:'.name'} should generally only contain identifier-safe characters.
        $$DOC{ref:'.'} names should use camelCase staring with a lower case letter.
        */}
    },
    {
      name: 'value',
      help: 'The message itself.'
    },
    {
      name: 'meaning',
      help: 'Linguistic clarification to resolve ambiguity.',
      documentation: function() {/* A human readable discussion of the
        $$DOC{ref:'.'} to resolve linguistic ambiguities.
      */}
    },
    {
      name: 'placeholders',
      help: 'Placeholders to inject into the message.',
      documentation: function() {/* Array of plain Javascript objects
        describing in-message placeholders. The data can be expanded into
        $$DOC{ref:'foam.i18n.Placeholder'}, for example.
      */},
      factory: function() { return []; }
    },
    {
      name: 'replaceValues',
      documentation: function() {/* Function that binds values to message
        contents.
      */},
      defaultValue: function(unused_selectors, args) {
        var phs = this.placeholders || [];
        var value = this.value;
        // Bind known placeholders to message string.
        for ( var i = 0; i < phs.length; ++i ) {
          var name = phs[i].name;
          var replacement = args.hasOwnProperty(name) ? args[name] :
              phs[i].example;
          value = value.replace((new RegExp('[$]' + name + '[$]', 'g')),
                                replacement);
        }
        return value;
      }
    },
    {
      name: 'translationHint',
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'A brief description of this message and the context in which it used.',
      documentation: function() {/* A human readable description of the
        $$DOC{ref:'.'} and its context for the purpose of translation.
      */}
    }
  ]
});


CLASS({
  name: 'StringProperty',
  extends: 'Property',

  help: 'Describes a properties of type String.',
  label: 'Text',

  messages: [
    { name: 'errorPatternMismatch', value: 'The text does not match the pattern.' },
    {
      name: 'errorBelowMinLength',
      value: 'The text is too short. Minimum: $min$',
      placeholders: [ { name: 'min' } ]
    },
    {
      name: 'errorAboveMaxLength',
      value: 'The text is too long. Maximum: $max$',
      placeholders: [ { name: 'max' } ]
    }
  ],

  properties: [
    {
      name: 'displayHeight',
      displayWidth: 8,
      defaultValue: 1,
      help: 'The display height of the property.'
    },
    /*
    {
      name: 'type',
      displayWidth: 20,
      defaultValue: 'String',
      help: 'The FOAM type of this property.'
    },
    */
    {
      name: 'adapt',
      labels: ['javascript'],
      defaultValue: function (_, v) {
        return v === undefined || v === null ? '' :
        typeof v === 'function'              ? multiline(v) : v.toString() ;
      }
    },
    {
      name: 'swiftAdapt',
      defaultValue: function() {/*
        if newValue != nil { return String(newValue!) }
        return ""
      */},
    },
    {
      name: 'javaType',
      displayWidth: 70,
      defaultValue: 'String',
      help: 'The Java type of this property.'
    },
    {
      name: 'swiftType',
      defaultValue: 'String',
    },
    {
      name: 'swiftDefaultValue',
      defaultValue: '""',
    },
    {
      name: 'view',
      labels: ['javascript'],
      defaultValue: 'foam.ui.TextFieldView',
    },
    {
      name: 'pattern',
      help: 'Regex pattern for property.'
    },
    {
      name: 'minChars',
      label: 'Minimum characters',
      help: 'The minimum number of characters required.',
      adapt: function(old,nu) {
        return nu === "" ? "" : parseInt(nu);
      }
    },
    {
      name: 'maxChars',
      label: 'Maximum characters',
      help: 'The maximum number of characters allowed.',
      adapt: function(old,nu) {
        return nu === "" ? "" : parseInt(nu);
      }
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      required: false,
      help: 'The protobuf tag number for this field.'
    },
    {
      name: 'validate',
      lazyFactory: function() {
        var prop = this; // this == the property
        var ret = constantFn('');

        var min = prop.minChars;
        if ( min !== "" ) {
          ret = function(result) {
            return result ||
              ( this[prop.name].length < min ?
                  prop.ERROR_BELOW_MIN_LENGTH.replaceValues(null, { min: min }) :
                  ''
              );
          }.o(ret);
          ret.dependencies = [prop.name];
        }
        var max = prop.maxChars;
        if ( max !== "" ) {
          ret = function(result) {
            return result ||
              ( this[prop.name].length > max ?
                  prop.ERROR_ABOVE_MAX_LENGTH.replaceValues(null, { max: max }) :
                  ''
              );
          }.o(ret);
          ret.dependencies = [prop.name];
        }
        var pattern = prop.pattern;
        if ( pattern ) {
          var testable = pattern.test ? pattern : new RegExp(pattern.toString(), 'i');
          var errMsg = pattern.errorMessage ?
            pattern.errorMessage() : prop.errorPatternMismatch;
          ret = function(result) {
            return result ||
              ( ! testable.test(this[prop.name]) ? errMsg : '' );
          }.o(ret);
          ret.dependencies = [prop.name];
        }
        return ret;
      }
    }
  ]
});


CLASS({
  name: 'BooleanProperty',
  extends: 'Property',

  help: 'Describes a properties of type Boolean.',
  label: 'True or false',

  properties: [
    /*
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Boolean',
      help: 'The FOAM type of this property.'
    },
    */
    {
      name: 'swiftType',
      type: 'String',
      displayWidth: 70,
      defaultValue: 'Bool'
    },
    {
      name: 'swiftDefaultValue',
      defaultValue: 'false',
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 70,
      defaultValue: 'boolean',
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      labels: ['javascript'],
      defaultValue: 'foam.ui.BooleanView',
    },
    {
      name: 'toPropertyE',
      labels: ['javascript'],
      defaultValue: function(X) {
        return X.lookup('foam.u2.tag.Checkbox').create(null, X);
      }
    },
    [ 'defaultValue', false ],
    {
      name: 'adapt',
      defaultValue: function (_, v) { return !!v; },
      labels: ['javascript'],
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      required: false,
      help: 'The protobuf tag number for this field.'
    },
    {
      name: 'fromString',
      labels: ['javascript'],
      defaultValue: function(s) {
        var txt = s.trim();
        return txt.equalsIC('y')    ||
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
  extends: 'Property',

  help:  'Describes a properties of type Date.',
  label: 'Date',

  properties: [
    /*
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Date',
      help: 'The FOAM type of this property.'
    },
    */
    [ 'displayWidth', 50 ],
    {
      name: 'javaType',
      defaultValue: 'java.util.Date',
      help: 'The Java type of this property.'
    },
    [ 'view', 'foam.ui.DateFieldView' ],
    {
      name: 'toPropertyE',
      labels: ['javascript'],
      defaultValue: function(X) {
        return X.lookup('foam.u2.DateView').create(null, X);
      }
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      required: false,
      help: 'The protobuf tag number for this field.'
    },
    {
      name: 'adapt',
      defaultValue: function (_, d) {
        if (typeof d === 'number') return new Date(d);
        if (typeof d === 'string') {
          var ret = new Date(d);
          return ret.toUTCString() === 'Invalid Date' ? new Date(+d) : ret;
        }
        return d;
      }
    },
    [ 'tableFormatter', function(d) { return d ? d.toRelativeDateString() : ''; } ],
    [ 'compareProperty',
      function(o1, o2) {
        if ( ! o1 ) return ( ! o2 ) ? 0: -1;
        if ( ! o2 ) return 1;

        return o1.compareTo(o2);
      }
    ]
  ]
});


CLASS({
  name: 'DateTimeProperty',
  extends: 'DateProperty',

  help: 'Describes a properties of type DateTime.',
  label: 'Date and time',

  properties: [
    [ 'view', 'foam.ui.DateTimeFieldView' ],
    {
      name: 'toPropertyE',
      labels: ['javascript'],
      defaultValue: function(X) {
        return X.lookup('foam.u2.DateTimeView').create(null, X);
      }
    },
  ]
});




CLASS({
  name:  'NumericProperty_',
  extends: 'Property',

  help:  'Base model for a property of any numeric type.',

  messages: [
    {
      name: 'errorBelowMinimum',
      value: 'The value must be at least $min$.',
      placeholders: [ { name: 'min' } ]
    },
    {
      name: 'errorAboveMaximum',
      value: 'The value can be at most $max$.',
      placeholders: [ { name: 'max' } ]
    }
  ],

  properties: [
    {
      name: 'minValue',
      label: 'Minimum Value',
      required: false,
      help: 'The minimum value this property accepts.',
      defaultValue: '',
      adapt: function(old,nu) {
        return nu === "" ? "" : this.adapt(null, nu);
      }
    },
    {
      name: 'maxValue',
      label: 'Maximum Value',
      required: false,
      help: 'The maximum value this property accepts.',
      defaultValue: '',
      adapt: function(old,nu) {
        return nu === "" ? "" : this.adapt(null, nu);
      }
    },
    {
      name: 'compareProperty',
      labels: ['javascript'],
      defaultValue: function(o1, o2) { return o1 === o2 ? 0 : o1 > o2 ? 1 : -1; },
    },
    {
      name: 'validate',
      lazyFactory: function() {
        var prop = this; // this == the property
        var ret = constantFn('');

        var min = prop.minValue;
        if ( min !== "" ) {
          ret = function(result) {
            return result ||
              ( this[prop.name] < min ? prop.ERROR_BELOW_MINIMUM.replaceValues(null, { min: min }) : '');
          }.o(ret);
          ret.dependencies = [prop.name];
        }

        var max = prop.maxValue;
        if ( max !== "" ) {
          ret = function(result) {
            return result ||
              ( this[prop.name] > max ? prop.ERROR_ABOVE_MAXIMUM.replaceValues(null, { max: max }) : '');
          }.o(ret);
          ret.dependencies = [prop.name];
        }
        return ret;
      }
    }
  ]
});


CLASS({
  name:  'IntProperty',
  extends: 'NumericProperty_',

  help:  'Describes a properties of type Int.',
  label: 'Round numbers',

  properties: [
    /*
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Int',
      help: 'The FOAM type of this property.'
    },
    */
    [ 'displayWidth', 10 ],
    {
      name: 'javaType',
      displayWidth: 10,
      defaultValue: 'int',
      help: 'The Java type of this property.'
    },
    {
      name: 'swiftType',
      defaultValue: 'Int',
    },
    {
      name: 'swiftAdapt',
      defaultValue: function() {/*
        // If it's already an int, use it.
        if let intVal = newValue as? Int { return intVal }
        // If it's a string, convert it.
        if let strVal = newValue as? String, intVal = Int(strVal) as Int! {
          return intVal
        }
        return 0
      */},
    },
    {
      name: 'swiftDefaultValue',
      defaultValue: '0',
    },
    {
      name: 'view',
      labels: ['javascript'],
      defaultValue: 'foam.ui.IntFieldView',
    },
    {
      name: 'adapt',
      labels: ['javascript'],
      defaultValue: function (_, v) {
        return typeof v === 'number' ? Math.round(v) : v ? parseInt(v) : 0 ;
      },
    },
    [ 'defaultValue', 0 ],
    {
      name: 'prototag',
      label: 'Protobuf tag',
      required: false,
      help: 'The protobuf tag number for this field.'
    }
  ]
});


CLASS({
  name:  'LongProperty',
  extends: 'IntProperty',

  help:  'Describes a properties of type Long.',
  label: 'Round long numbers',

  properties: [
    /*
    {
      name: 'type',
      defaultValue: 'Long'
    },
    */
    {
      name: 'displayWidth',
      labels: ['javascript'],
      defaultValue: 12
    },
    {
      name: 'javaType',
      labels: ['javascript'],
      defaultValue: 'long',
    },
    {
      name: 'swiftType',
      labels: ['compiletime', 'swift'],
      defaultValue: 'NSNumber',
    },
    {
      name: 'swiftAdapt',
      defaultValue: function() {/*
        // If it's already an int, use it.
        if let numVal = newValue as? NSNumber { return numVal }
        if let intVal = newValue as? Int64 { return NSNumber(longLong: intVal) }
        // If it's a string, convert it.
        if let strVal = newValue as? String, intVal = Int64(strVal) as Int64! {
          return NSNumber(longLong: intVal)
        }
        return 0
      */},
    },
  ]
});


CLASS({
  name:  'FloatProperty',
  extends: 'NumericProperty_',

  help:  'Describes a properties of type Float.',
  label: 'Decimal numbers',

  properties: [
    /*
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Float',
      help: 'The FOAM type of this property.'
    },
    */
    {
      name: 'defaultValue',
      defaultValue: 0.0
    },
    {
      name: 'javaType',
      displayWidth: 10,
      defaultValue: 'double',
      help: 'The Java type of this property.'
    },
    {
      name: 'swiftType',
      defaultValue: 'Float',
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
      required: false,
      help: 'The protobuf tag number for this field.'
    },
  ]
});


CLASS({
  name:  'FunctionProperty',
  extends: 'Property',

  help:  'Describes a properties of type Function.',
  label: 'Code that can be run',

  properties: [
    /*
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Function',
      help: 'The FOAM type of this property.'
    },
    */
    {
      name: 'javaType',
      displayWidth: 10,
      defaultValue: 'Function',
      help: 'The Java type of this property.'
    },
    {
      name: 'swiftType',
      defaultValue: 'FoamFunction',
    },
    {
      name: 'swiftDefaultValue',
      defaultValue: 'FoamFunction(fn: { (_) -> AnyObject? in return nil })',
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
      name: 'toPropertyE',
      defaultValue: function(X) {
        return X.lookup('foam.u2.FunctionView').create(undefined, X);
      }
    },
    {
      name: 'defaultValue',
      defaultValue: function() {}
    },
    {
      name: 'fromElement',
      defaultValue: function(e, p) {
        var txt = e.innerHTML.trim();

        this[p.name] = txt;
      }
    },
    {
      name: 'adapt',
      defaultValue: function(_, value) {
        if ( typeof value === 'string' ) {
          var parse = JSONParser.parseString(value, JSONParser['function prototype']);
          if ( parse ) {
            var body = value.substring(value.indexOf('{') + 1, value.lastIndexOf('}'));
            return new Function(parse[3], body);
          }
          return new Function(value);
        }
        return value;
      }
    }
  ]
});

CLASS({
  name: 'TemplateProperty',
  extends: 'FunctionProperty',

  properties: [
    {
      name: 'adapt',
      defaultValue: function(_, value) {
        return TemplateUtil.expandTemplate(this, value);
      }
    },
    {
      name: 'defaultValue',
      adapt: function(_, value) {
        return TemplateProperty.ADAPT.defaultValue.call(this, _, value);
      }
    },
    {
      name: 'toPropertyE',
      defaultValue: function(X) {
        return X.lookup('foam.u2.MultiLineTextField').create(undefined, X);
      }
    },
    {
      name: 'install',
      defaultValue: function(prop) {
        defineLazyProperty(this, prop.name + '$f', function() {
          var f = TemplateUtil.lazyCompile(this[prop.name])
          return {
            get: function() { return f; },
            configurable: true
          };
        });
      }
    }
  ]
});

CLASS({
  name: 'ArrayProperty',
  extends: 'Property',

  help:  'Describes a property of type Array.',
  label: 'List of items',

  properties: [
    /*
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Array',
      help: 'The FOAM type of this property.'
    },
    */
    {
      name: 'swiftType',
      defaultValue: '[AnyObject]'
    },
    {
      name: 'swiftFactory',
      defaultValue: 'return []'
    },
    {
      name: 'singular',
      displayWidth: 70,
      defaultValueFn: function() { return this.name.replace(/s$/, ''); },
      help: 'The plural form of this model\'s name.',
      documentation: function() { /* The singular form of $$DOC{ref:'Property.name'}.*/}
    },
    {
      name: 'subType',
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
        var m = prop.subType_ || ( prop.subType_ =
          this.X.lookup(prop.subType) || GLOBAL.lookup(prop.subType) );

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
        var name = prop.nameArrayRelay_ || ( prop.nameArrayRelay_ = prop.name + 'ArrayRelay_' );
        var l = this[name] || ( this[name] = function() {
          this.propertyChange(prop.name, null, this[prop.name]);
        }.bind(this) );
        if ( oldA && oldA.unlisten ) oldA.unlisten(l);
        if ( a && a.listen ) a.listen(l);
      }
    },
    {
      name: 'javaType',
      displayWidth: 10,
      defaultValueFn: function(p) {
        return 'java.util.List<' + this.subType + '>';
      },
      help: 'The Java type of this property.'
    },
    {
      name: 'javaLazyFactory',
      defaultValueFn: function(p) {
        return 'return new java.util.ArrayList<' + this.subType + '>();';
      },
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

          this.addPropertyListener(prop.name, function(_, __, ___, a) {
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
      required: false,
      help: 'The protobuf tag number for this field.'
    }
  ]
});


CLASS({
  name: 'BlobProperty',
  extends: 'Property',
  help: 'A chunk of binary data.',
  label: 'Binary data',

  properties: [
    {
      name: 'type',
      type: 'String',
      defaultValue: 'Blob',
      help: 'The FOAM type of this property.',
    },
    {
      name: 'javaType',
      type: 'String',
      defaultValue: 'byte[]',
      help: 'The Java type for this property.',
    },
  ]
});


CLASS({
  name:  'ReferenceProperty',
  extends: 'Property',

  help:  'A foreign key reference to another Entity.',
  label: 'Reference to another object',

  properties: [
    /*
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Reference',
      help: 'The FOAM type of this property.'
    },
    */
    {
      name: 'subType',
      displayWidth: 20,
      defaultValue: '',
      help: 'The FOAM sub-type of this property.'
    },
    {
      name: 'subKey',
      displayWidth: 20,
      defaultValue: 'ID',
      help: 'The foreign key that this property references.'
    },
    {
      name: 'javaType',
      displayWidth: 10,
      defaultValueFn: function() {
        return this.X.lookup(this.subType)[this.subKey].javaType;
      },
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'foam.ui.TextFieldView'
// TODO: Uncomment when all usages of ReferenceProperty/ReferenceArrayProperty fixed.
//      defaultValue: 'KeyView'
    },
    {
      name: 'toPropertyE',
      defaultValue: function(X) { return X.lookup('foam.u2.ReferenceView').create(null, X); }
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      required: false,
      help: 'The protobuf tag number for this field.'
    }
  ]
});


CLASS({
  name: 'StringArrayProperty',
  extends: 'Property',

  help: 'An array of String values.',
  label: 'List of text strings',

  properties: [
    /*
    {
      name: 'type',
      displayWidth: 20,
      defaultValue: 'Array',
      help: 'The FOAM type of this property.'
    },
    */
    {
      name: 'swiftType',
      defaultValue: '[String]'
    },
    {
      name: 'swiftFactory',
      defaultValue: 'return []'
    },
    {
      name: 'singular',
      displayWidth: 70,
      defaultValueFn: function() { return this.name.replace(/s$/, ''); },
      help: 'The plural form of this model\'s name.',
      documentation: function() { /* The singular form of $$DOC{ref:'Property.name'}.*/}
    },
    {
      name: 'subType',
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
      defaultValue: function(_, v) {
        return Array.isArray(v) ? v : ((v || v === 0) ? [v] : []);
      }
    },
    {
      name: 'factory',
      defaultValue: function() { return []; }
    },
    {
      name: 'javaType',
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
      required: false,
      help: 'The protobuf tag number for this field.'
    },
    {
      name: 'exclusive',
      defaultValue: false
    },
    {
      name: 'fromString',
      defaultValue: function(s) {
        return s.split(',');
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
    },
    {
      name: 'toMemento',
      defaultValue: function(o, p) {
        return o.map(function(x) { return x.replace(/,/g, '&#44;'); }).join(',');
      }
    },
    {
      name: 'fromMemento',
      defaultValue: function(s, p) {
        return s ? s.split(',').map(function(x) { return x.replace(/&#44;/g, ','); }) : undefined;
      }
    },
  ]
});


CLASS({
  name: 'ModelProperty',
  extends: 'Property',

  help: 'Describes a Model property.',
  label: 'Data Model definition',

  properties: [
//    [ 'type', 'Model' ],
    {
      name: 'getter',
      labels: ['javascript'],
      defaultValue: function(name) {
        var value = this.instance_[name];
        if ( typeof value === 'undefined' ) {
          var prop = this.model_.getProperty(name);
          if ( prop ) {
            if ( prop.lazyFactory ) {
              value = this.instance_[prop.name] = prop.lazyFactory.call(this, prop);
            } else if ( prop.factory ) {
              value = this.instance_[prop.name] = prop.factory.call(this, prop);
            } else if ( prop.defaultValueFn ) {
              value = prop.defaultValueFn.call(this, prop);
            } else if ( typeof prop.defaultValue !== undefined ) {
              value = prop.defaultValue;
            } else {
              value = '';
            }
          } else {
            value = '';
          }
        }
        if ( typeof value === 'string' ) {
          if ( ! value ) return '';
          var ret = this.X.lookup(value);
          // console.assert(Model.isInstance(ret), 'Invalid model specified for ' + this.name_);
          return ret;
        }
        if ( Model.isInstance(value) ) return value;
        return '';
      }
    },
    {
      name: 'propertyToJSON',
      labels: ['javascript'],
      defaultValue: function(visitor, output, o) {
        if ( ! this.transient ) output[this.name] = o[this.name].id;
      }
    }
  ]
});


CLASS({
  name: 'ViewProperty',
  extends: 'Property',

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
  extends: 'Property',

  help: 'Describes a Factory property.',

  properties: [
    {
      name: 'preSet',
      doc: "Can be specified as either a function, a Model, a Model path, or a JSON object.",
      defaultValue: function(_, f) {
        // Undefined values
        if ( ! f ) return f;

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
  extends: 'FactoryProperty',

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
        var fp = function(prop) {
          // call the defaultValue function, adapt the result, return it
          return ViewFactoryProperty.ADAPT.defaultValue.call(this, null, f.call(this, prop));
        };
        fp.toString = function() { return f.toString(); };
        return fp;
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
                  extends: 'foam.ui.DetailView',
                  templates:[{name: 'toHTML', template: f}]
                });

              // TODO(kgr): this isn't right because compiling the View template
              // is async.  Should add a READY state to View to handle this.
              viewModel.arequire();
            }
            ret = function(args, X) { return viewModel.create(args, X || this.Y); };
          } else {
            ret = function(map, opt_X) {
              var model = (opt_X || this.X).lookup(f);
              console.assert(!!model, 'Unknown model: ' + f + ' in ' + this.name + ' property');
              return model.create(map, opt_X || this.Y);
            }.bind(this);
          }

          ret.toString = function() { return '"' + f + '"'; };
          return ret;
        }

        // An actual Model
        if ( Model.isInstance(f) ) return function(args, opt_X) {
          return f.create(args, opt_X || this.Y)
        }.bind(this);

        // A JSON Model Factory: { factory_ : 'ModelName', arg1: value1, ... }
        if ( f.factory_ ) {
          ret = function(map, opt_X) {
            var m = (opt_X || this.X).lookup(f.factory_);
            console.assert(m, 'Unknown ViewFactory Model: ' + f.factory_);
            return m.create(f, opt_X || this.Y).copyFrom(map);
          };

          ret.toString = function() { return JSONUtil.compact.stringify(f); };
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
  extends: 'ReferenceProperty',

  properties: [
    /*
    {
      name: 'type',
      defaultValue: 'Array',
      displayWidth: 20,
      help: 'The FOAM type of this property.'
    },
    */
    {
      name: 'factory',
      defaultValue: function() { return []; },
    },
    {
      name: 'javaType',
      defaultValueFn: function() {
        return this.X.lookup(this.subType).ID.javaType + '[]';
      }
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
  extends: 'StringProperty',
  label: 'Email address',

  properties: [
    [ 'pattern', '^.+\@.+$' ]
  ]
});

CLASS({
  name: 'ImageProperty',
  extends: 'StringProperty',
  label: 'Image data or link',
  properties: [
    {
      name: 'view',
      labels: ['javascript'],
      defaultValue: 'foam.ui.md.ImagePickerView',
    }
  ]
});

CLASS({
  name: 'URLProperty',
  extends: 'StringProperty',
  label: 'Web link (URL or internet address)',
});

CLASS({
  name: 'ColorProperty',
  extends: 'StringProperty',
  label: 'Color',
  properties: [
    [ 'view', 'foam.ui.md.ColorFieldView' ]
  ]
});

CLASS({
  name: 'PasswordProperty',
  extends: 'StringProperty',
  label: 'Password that displays protected or hidden text',
  properties: [
    {
      name: 'swiftView',
      defaultValue: 'PasswordFieldView',
    },
  ],
});

CLASS({
  name: 'PhoneNumberProperty',
  extends: 'StringProperty',
  label: 'Phone number',

  properties: [
    [ 'pattern', '^[0-9\-\+\(\)\*\ ]*$' ]
  ]

});


if ( DEBUG ) CLASS({
  name: 'DocumentationProperty',
  extends: 'Property',
  help: 'Describes the documentation properties found on Models, Properties, Actions, Methods, etc.',
  documentation: "The developer documentation for this $$DOC{ref:'.'}. Use a $$DOC{ref:'DocModelView'} to view documentation.",

  properties: [
    /*
    {
      name: 'type',
      type: 'String',
      defaultvalue: 'Documentation'
    },
    */
    { // Note: defaultValue: for the getter function didn't work. factory: does.
      name: 'getter',
      labels: ['debug'],
      defaultValue: function(name) {
        var doc = this.instance_[name]
        if (doc && typeof Documentation != 'undefined' && Documentation // a source has to exist (otherwise we'll return undefined below)
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
      defaultValue: 'foam.ui.DetailView',
      labels: ['debug']
    },
    {
      name: 'help',
      defaultValue: 'Documentation for this entity.',
      labels: ['debug']
    },
    {
      name: 'documentation',
      factory: function() { return "The developer documentation for this $$DOC{ref:'.'}. Use a $$DOC{ref:'DocModelView'} to view documentation."; },
      labels: ['debug']
   }
  ]
});

CLASS({
  name: 'ImportedProperty',
  extends: 'Property',
  label: 'A pseudo-property that does not clone its value.',

  properties: [
    [ 'transient', true ],
    [ 'hidden',    true ],
  ],

  methods: [
    function deepCloneProperty(value, cloneArgs) {
      this.cloneProperty(value, cloneArgs);
    },
    function cloneProperty(value, cloneArgs) {
      cloneArgs[this.name] = value;
    },
  ]
});

CLASS({
  name: 'EnumProperty',
  extends: 'Property',
  properties: [
    {
      name: 'enum',
      swiftType: 'FoamEnum.Type',
    },
    {
      name: 'javaType',
      defaultValueFn: function() { return this.enum; },
    },
    {
      name: 'toPropertyE',
      defaultValue: function(X) { return X.lookup('foam.u2.EnumView').create(null, X); }
    }
  ]
});

CLASS({
  name:  'FObjectProperty',
  extends: 'Property',

  help:  'Describes a properties of type FObject.',
  label: 'FObject',

  properties: [
    {
      name: 'javaType',
      defaultValueFn: function() {
        return this.subType || 'FObject';
      },
    },
    {
      name: 'swiftType',
      defaultValueFn: function() {
        if (this.subType) {
          return this.subType.split('.').pop();
        }
        return 'FObject';
      },
    },
  ]
});
