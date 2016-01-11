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
 * JSONUtil -- Provides JSON++ marshalling support.
 *
 * Like regular JSON, with the following differences:
 *  1. Marshalls to/from FOAM Objects, rather than maps.
 *  2. Object Model information is encoded as 'model: "ModelName"'
 *  3. Default Values are not marshalled, saving disk space and network bandwidth.
 *  4. Support for marshalling functions.
 *  5. Support for property filtering, ie. only output non-transient properties.
 *  6. Support for 'pretty' and 'compact' modes.
 *
 *  TODO:
 *    Replace with JSONParser.js, when finished.
 *    Maybe rename to FON (FOAM Object Notation, pronounced 'phone') to avoid
 *    confusion with regular JSON syntax.
 **/

var AbstractFormatter = {
  keyify: function(str) { return '"' + str + '"'; },

  stringify: function(obj) {
    var buf = '';

    this.output(function() {
      for (var i = 0; i < arguments.length; i++)
        buf += arguments[i];
    }, obj);

    return buf;
  },

  stringifyObject: function(obj, opt_defaultModel) {
    var buf = '';

    this.outputObject_(function() {
      for (var i = 0; i < arguments.length; i++)
        buf += arguments[i];
    }, obj, opt_defaultModel);

    return buf;
  },

  /** @param p a predicate function or an mLang **/
  where: function(p) {
    return {
      __proto__: this,
      p: ( p.f && p.f.bind(p) ) || p
    };
  },

  p: function() { return true; }
};


var JSONUtil = {

  escape: function(str) {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/[\x00-\x1f]/g, function(c) {
        return "\\u00" + ((c.charCodeAt(0) < 0x10) ?
                          '0' + c.charCodeAt(0).toString(16) :
                          c.charCodeAt(0).toString(16));
      });
  },

  parseToMap: function(str) {
    return eval('(' + str + ')');
  },

  aparse: function(ret, X, str) {
    var seq = [];
    var res = this.parse(X, str, seq);
    if ( seq.length ) {
      apar.apply(null, seq)(function() { ret(res); });
      return;
    }
    ret(res);
  },

  amapToObj: function(ret, X, obj, opt_defaultModel) {
    var seq = [];
    var res = this.mapToObj(X, obj, opt_defaultModel, seq);
    if ( seq.length ) {
      aseq.apply(null, seq)(function() { ret(res); });
      return;
    }
    return res;
  },

  parse: function(X, str, seq) {
    return this.mapToObj(X, this.parseToMap(str), undefined, seq);
  },

  arrayToObjArray: function(X, a, opt_defaultModel, seq) {
    for ( var i = 0 ; i < a.length ; i++ ) {
      a[i] = this.mapToObj(X, a[i], opt_defaultModel, seq);
    }
    return a;
  },

  /**
   * Convert JS-Maps which contain the 'model_' property, into
   * instances of that model.
   **/
  mapToObj: function(X, obj, opt_defaultModel, seq) {
    if ( ! obj || typeof obj.model_ === 'object' ) return obj;

    if ( Array.isArray(obj) ) return this.arrayToObjArray(X, obj, undefined, seq);

    if ( obj instanceof Function ) return obj;

    if ( obj instanceof Date ) return obj;

    if ( obj instanceof Object ) {

      // For Models, convert type: Value to model_: ValueProperty
      if ( obj.model_ === 'Model' || opt_defaultModel === 'Model' ) {
        if ( obj.properties ) {
          for ( var i = 0 ; i < obj.properties.length ; i++ ) {
            var p = obj.properties[i];
            if ( p.type && ! p.model_ && p.type !== 'Property' ) {
              p.model_ = p.type + 'Property';
              X.arequire(p.model_)((function(obj, p) { return function(m) {
                if ( Property && ! Property.isSubModel(m) ) {
                  console.log('ERROR: Use of non Property Sub-Model as Property type: ', obj.package + '.' + obj.name, p.type);
                }
              }; })(obj,p));
            }
          }
        }
      }

      for ( var key in obj )
        if ( key != 'model_' && key != 'prototype_' )
          obj[key] = this.mapToObj(X, obj[key], null, seq);

      if ( opt_defaultModel && ! obj.model_ ) return opt_defaultModel.create(obj, X);

      if ( obj.model_ ) {
        var newObj = X.lookup(obj.model_);
        if ( ( ! newObj || ! newObj.finished__ ) ) {
          var future = afuture();
          seq && seq.push(future.get);

          X.arequire(obj.model_)(function(model) {
            if ( ! model ) {
               if ( FLAGS.debug && obj.model_ !== 'Template' && obj.model_ !== 'ArrayProperty' && obj.model_ !== 'ViewFactoryProperty' && obj.model_ !== 'Documentation' && obj.model_ !== 'DocumentationProperty' && obj.model_ !== 'CSSProperty' && obj.model_ !== 'FunctionProperty' )
                 console.warn('Failed to dynamically load: ', obj.model_);
              future.set(obj);
              return;
            }

            // Some Properties have a preSet which calls JSONUtil.
            // If they do this before a model is loaded then that
            // property can have JSONUtil called twice.
            // This check avoids building the object twice.
            // Should be removed when JSONUtil made fully async
            // and presets removed.
            if ( ! obj.instance_ ) {
              var tmp = model.create(obj, X);
              obj.become(tmp);
              future.set(obj);
            }
          });

          return obj;
        }
        var ret = newObj ? newObj.create(obj, X) : obj;
        return ret.readResolve ? ret.readResolve() : ret;
      }
      return obj
    }

    return obj;
  },

  compact: {
    __proto__: AbstractFormatter,

    output: function(out, obj, opt_defaultModel) {
      if ( Array.isArray(obj) ) {
        this.outputArray_(out, obj);
      }
      else if ( typeof obj === 'string' ) {
        out('"');
        out(JSONUtil.escape(obj));
        out('"');
      }
      else if ( obj instanceof Function ) {
        this.outputFunction_(out, obj);
      }
      else if ( obj instanceof Date ) {
        out(obj.getTime());
      }
      else if ( obj instanceof RegExp ) {
        out(obj.toString());
      }
      else if ( obj instanceof Object ) {
        if ( obj.model_ && obj.model_.id )
          this.outputObject_(out, obj, opt_defaultModel);
        else
          this.outputMap_(out, obj);
      }
      else if ( typeof obj === 'number' ) {
        if ( ! isFinite(obj) ) obj = null;
        out(obj);
      }
      else {
        out(obj === undefined ? null : obj);
      }
    },

    outputObject_: function(out, obj, opt_defaultModel) {
      var str   = '';
      var first = true;

      out('{');
      if ( obj.model_.id !== opt_defaultModel ) {
        this.outputModel_(out, obj);
        first = false;
     }

      var properties = obj.model_.getRuntimeProperties();
      for ( var key in properties ) {
        var prop = properties[key];

        if ( ! this.p(prop, obj) ) continue;

        if ( prop.name in obj.instance_ ) {
          var val = obj[prop.name];
          if ( Array.isArray(val) && ! val.length ) continue;
          if ( ! first ) out(',');
          out(this.keyify(prop.name), ': ');
          if ( Array.isArray(val) && prop.subType ) {
            this.outputArray_(out, val, prop.subType);
          } else {
            this.output(out, val);
          }
          first = false;
        }
      }

      out('}');
    },

    outputModel_: function(out, obj) {
      out('model_:"')
      if ( obj.model_.package ) out(obj.model_.package, '.')
      out(obj.model_.name, '"');
    },

    outputMap_: function(out, obj) {
      var str   = '';
      var first = true;

      out('{');

      for ( var key in obj ) {
        var val = obj[key];

        if ( ! first ) out(',');
        out(this.keyify(key), ': ');
        this.output(out, val);

        first = false;
      }

      out('}');
    },

    outputArray_: function(out, a, opt_defaultModel) {
      if ( a.length == 0 ) { out('[]'); return out; }

      var str   = '';
      var first = true;

      out('[');

      for ( var i = 0 ; i < a.length ; i++, first = false ) {
        var obj = a[i];

        if ( ! first ) out(',');

        this.output(out, obj, opt_defaultModel);
      }

      out(']');
    },

    outputFunction_: function(out, obj) { out(obj); }
  },

  pretty: {
    __proto__: AbstractFormatter,

    output: function(out, obj, opt_defaultModel, opt_indent) {
      var indent = opt_indent || '';

      if ( Array.isArray(obj) ) {
        this.outputArray_(out, obj, null, indent);
      }
      else if ( typeof obj == 'string' ) {
        out('"');
        out(JSONUtil.escape(obj));
        out('"');
      }
      else if ( obj instanceof Function ) {
        this.outputFunction_(out, obj, indent);
      }
      else if ( obj instanceof Date ) {
        out(obj.getTime());
      }
      else if ( obj instanceof RegExp ) {
        out(obj.toString());
      }
      else if ( obj instanceof Object ) {
        if ( obj.model_ )
          this.outputObject_(out, obj, opt_defaultModel, indent);
        else
          this.outputMap_(out, obj, indent);
      } else if ( typeof obj === 'number' ) {
        if ( ! isFinite(obj) ) obj = null;
        out(obj);
      } else {
        if ( obj === undefined ) obj = null;
        out(obj);
      }
    },

    outputObject_: function(out, obj, opt_defaultModel, opt_indent) {
      var indent       = opt_indent || '';
      var nestedIndent = indent + '   ';
      var str          = '';
      var first        = true;

      out(/*"\n", */indent, '{\n');
      if ( obj.model_.id && obj.model_.id !== opt_defaultModel ) {
        this.outputModel_(out, obj, nestedIndent);
        first = false;
      }

      var properties = obj.model_.getRuntimeProperties();
      for ( var key in properties ) {
        var prop = properties[key];

        if ( ! this.p(prop, obj) ) continue;

        if ( prop.name === 'parent' ) continue;

        if ( prop.name in obj.instance_ ) {
          var val = obj[prop.name];

          if ( Array.isArray(val) && ! val.length ) continue;

          if ( equals(val, prop.defaultValue) ) continue;

          if ( ! first ) out(',\n');
          out(nestedIndent, this.keyify(prop.name), ': ');

          if ( Array.isArray(val) && prop.subType ) {
            this.outputArray_(out, val, prop.subType, nestedIndent);
          } else {
            this.output(out, val, null, nestedIndent);
          }

          first = false;
        }
      }

      out('\n', indent, '}');
    },

    outputModel_: function(out, obj, indent) {
      out(indent, '"model_": "', obj.model_.id, '"');
    },

    outputMap_: function(out, obj, opt_indent) {
      var indent       = opt_indent || '';
      var nestedIndent = indent + '   ';
      var str          = '';
      var first        = true;

      out(/*"\n",*/ indent, '{\n', nestedIndent);

      for ( var key in obj ) {
        var val = obj[key];

        if ( ! first ) out(',\n');
        out(nestedIndent, this.keyify(key), ': ');
        this.output(out, val, null, nestedIndent);

        first = false;
      }

      out('\n', indent, '}');
    },

    outputArray_: function(out, a, opt_defaultModel, opt_indent) {
      if ( a.length == 0 ) { out('[]'); return out; }

      var indent       = opt_indent || '';
      var nestedIndent = indent + '   ';
      var str          = '';
      var first        = true;

      out('[\n');

      for ( var i = 0 ; i < a.length ; i++, first = false ) {
        var obj = a[i];

        if ( ! first ) out(',\n');

        this.output(out, obj, opt_defaultModel, nestedIndent);
      }

      out('\n', indent, ']');
    },

    outputFunction_: function(out, obj, indent) {
      var str = obj.toString();
      var lines = str.split('\n');

      if ( lines.length == 1 ) { out(str); return; }

      var minIndent = 10000;
      for ( var i = 0 ; i < lines.length ; i++ ) {
        var j = 0;
        for ( ; j < lines[i].length && lines[i].charAt(j) === ' ' && j < minIndent ; j++ );
        if ( j > 0 && j < minIndent ) minIndent = j;
      }

      if ( minIndent === 10000 ) { out(str); return; }

      for ( var i = 0 ; i < lines.length ; i++ ) {
        if ( lines[i].length && lines[i].charAt(0) === ' ' ) {
          lines[i] = indent + lines[i].substring(minIndent);
        }
        out(lines[i]);
        if ( i < lines.length-1 ) out('\n');
      }
    }
  },

  moreCompact: {
    __proto__: AbstractFormatter,
    // TODO: use short-names
  },

  compressed: {
    __proto__: AbstractFormatter,

    stringify: function(obj) {
      return Iuppiter.Base64.encode(Iuppiter.compress(JSONUtil.compact.stringify(obj),true));
    }
  }

};

JSONUtil.prettyModel = {
  __proto__: JSONUtil.pretty,

  outputModel_: function(out, obj, indent) {
    out(indent, 'model_: "', obj.model_.id, '"');
  },

  keys_: {},

  keyify: function(str) {
    if ( ! this.keys_.hasOwnProperty(str) ) {
      this.keys_[str] =
        /^[a-zA-Z\$_][0-9a-zA-Z$_]*$/.test(str) ?
        str :
        '"' + str + '"';
    }

    return this.keys_[str];
  }
};

JSONUtil.stringify       = JSONUtil.pretty.stringify.bind(JSONUtil.pretty);
JSONUtil.stringifyObject = JSONUtil.pretty.stringifyObject.bind(JSONUtil.pretty);
JSONUtil.output          = JSONUtil.pretty.output.bind(JSONUtil.pretty);
JSONUtil.where           = JSONUtil.pretty.where.bind(JSONUtil.pretty);

var NOT_TRANSIENT = function(prop) { return ! prop.transient; };
