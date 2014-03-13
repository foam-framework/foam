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
var AbstractFormatter = {
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

  keyify: function(str) {
    // TODO: check if contains single-quote or other characters
    return '"' + str + '"';
  },

  escape: function(str) {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/[\x00-\x1f]/g, function(c) {
        return "\\u00" + ((c.charCodeAt(0) < 0x10) ?
                          "0" + c.charCodeAt(0).toString(16) :
                          c.charCodeAt(0).toString(16));
      });
  },

  parseToMap: function(str) {
    return eval('(' + str + ')');
  },

  parse: function(str) {
    return this.mapToObj(this.parseToMap(str));
  },

  arrayToObjArray: function(a) {
    for ( var i = 0 ; i < a.length ; i++ ) {
      a[i] = this.mapToObj(a[i]);
    }
    return a;
  },

  /**
   * Convert JS-Maps which contain the 'model_' property, into
   * instances of that model.
   **/
  mapToObj: function(obj, opt_defaultModel) {
    if ( ! obj || typeof obj.model_ === 'object' ) return obj;

    if ( obj instanceof Array ) return this.arrayToObjArray(obj);

    if ( obj instanceof Function ) return obj;

    if ( obj instanceof Date ) return obj;

    if ( obj instanceof Object ) {
      var j = 0;

      for ( var key in obj ) {
        if ( key != 'model_' && key != 'prototype_' ) obj[key] = this.mapToObj(obj[key]);
        j++;
      }
/*      var keys = Object.keys(obj);
      for ( var j = 0, key; key = keys[j]; j++ ) {
        if ( key != 'model_' && key != 'prototype_' ) obj[key] = this.mapToObj(obj[key]);
      }
      */

      if ( opt_defaultModel && ! obj.model_ ) return opt_defaultModel.create(obj);

      return GLOBAL[obj.model_] ? GLOBAL[obj.model_].create(obj) : obj;
    }

    return obj;
  },

  compact: {
    __proto__: AbstractFormatter,

    stringify: function(obj) {
      var buf = "";

      this.output(function() {
        for (var i = 0; i < arguments.length; i++)
          buf += arguments[i];
      }, obj);

      return buf;
    },

    output: function(out, obj) {
      if ( obj instanceof Array) {
        this.outputArray_(out, obj);
      }
      else if ( typeof obj === 'string' ) {
        out("\"");
        out(JSONUtil.escape(obj));
        out("\"");
      }
      else if ( obj instanceof Function ) {
        out(obj);
      }
      else if ( obj instanceof Date ) {
        out(obj.getTime());
      }
      else if ( obj instanceof Object ) {
        try {
          if ( obj.model_ )
            this.outputObject_(out, obj);
          else
            this.outputMap_(out, obj);
        }
        catch (x) {
          console.log("toJSONError: ", x, obj);
        }
      }
      else if (typeof obj === "number") {
        if (!isFinite(obj)) obj = null;
        out(obj);
      }
      else {
        if (obj === undefined) obj = null;
        out(obj);
      }
    },

    outputObject_: function(out, obj) {
      var str = "";

      out('{', '"model_":"', obj.model_.name, '"');

      for ( var key in obj.model_.properties ) {
        var prop = obj.model_.properties[key];

        if ( ! this.p(prop) ) continue;

        if ( prop.name in obj.instance_ ) {
          var val = obj[prop.name];
          if ( val == prop.defaultValue ) continue;
          out(",", JSONUtil.keyify(prop.name), ':');
          this.output(out, val);
        }
      }

      out('}');
    },


    outputMap_: function(out, obj) {
      var str   = "";
      var first = true;

      out('{');

      for ( var key in obj ) {
        var val = obj[key];

        if ( ! first ) out(",");
        out(JSONUtil.keyify(key), ':');
        this.output(out, val);

        first = false;
      }

      out('}');
    },

    outputArray_: function(out, a) {
      if ( a.length == 0 ) { out('[]'); return out; }

      var str   = "";
      var first = true;

      out('[');

      for ( var i = 0 ; i < a.length ; i++, first = false ) {
        var obj = a[i];

        if ( ! first ) out(',');

        this.output(out, obj);
      }

      out(']');
    }
  },


  pretty: {
    __proto__: AbstractFormatter,

    stringify: function(obj) {
      var buf = "";

      this.output(function() {
        for (var i = 0; i < arguments.length; i++)
          buf += arguments[i];
      }, obj);

      return buf;
    },

    output: function(out, obj, opt_indent) {
      var indent = opt_indent || "";

      if ( obj instanceof Array) {
        this.outputArray_(out, obj, indent);
      }
      else if ( typeof obj == 'string' ) {
        out("\"");
        out(JSONUtil.escape(obj));
        out("\"");
      }
      else if ( obj instanceof Function ) {
        out(obj);
      }
      else if ( obj instanceof Date ) {
        out("new Date('", obj, "')");
      }
      else if ( obj instanceof Object ) {
        try {
          if ( obj.model_ )
            this.outputObject_(out, obj, indent);
          else
            this.outputMap_(out, obj, indent);
        }
        catch (x) {
          console.log("toJSONError: ", x, obj);
        }
      } else if (typeof obj === "number") {
        if (!isFinite(obj)) obj = null;
        out(obj);
      } else {
        if (obj === undefined) obj = null;
        out(obj);
      }
    },

    outputObject_: function(out, obj, opt_indent) {
      var indent       = opt_indent || "";
      var nestedIndent = indent + "   ";
      var str          = "";

      out(/*"\n", */indent, '{\n', nestedIndent, '"model_": "', obj.model_.name, '"');

      for ( var key in obj.model_.properties ) {
        var prop = obj.model_.properties[key];

        if ( ! this.p(prop) ) continue;

        if ( prop.name === 'parent' ) continue;
        if ( prop.name in obj.instance_ ) {
          var val = obj[prop.name];
          out(",\n", nestedIndent, "\"", prop.name, "\"", ': ');
          this.output(out, val, nestedIndent);
        }
      }

      out("\n", indent, '}');
    },

    outputMap_: function(out, obj, opt_indent) {
      var indent       = opt_indent || "";
      var nestedIndent = indent + "   ";
      var str          = "";
      var first        = true;

      out(/*"\n",*/ indent, '{\n', nestedIndent);

      for ( var key in obj )
      {
        var val = obj[key];

        if ( ! first ) out(",\n");
        out(nestedIndent, JSONUtil.keyify(key), ': ');
        this.output(out, val, nestedIndent);

        first = false;
      }

      out("\n", indent, '}');
    },

    outputArray_: function(out, a, opt_indent) {
      if ( a.length == 0 ) { out('[]'); return out; }

      var indent       = opt_indent || "";
      var nestedIndent = indent + "   ";
      var str          = "";
      var first        = true;

      out('[\n');

      for ( var i = 0 ; i < a.length ; i++, first = false ) {
        var obj = a[i];

        if ( ! first ) out(',\n');

        if ( typeof obj == 'string' ) {
          out(nestedIndent);
        }

        this.output(out, obj, nestedIndent);
      }

      out("\n", indent, ']');
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

JSONUtil.stringify = JSONUtil.pretty.stringify.bind(JSONUtil.pretty);
JSONUtil.output = JSONUtil.pretty.output.bind(JSONUtil.pretty);;
JSONUtil.where = JSONUtil.pretty.where.bind(JSONUtil.pretty);;

var NOT_TRANSIENT = function(prop) { return ! prop.transient; };
